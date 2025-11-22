
-- ==============================
-- 1) 주문 상태 enum 타입
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM (
      'CREATED',    -- 주문 생성
      'COMPLETED',  -- 주문 완료(픽업 포함)
      'CANCELLED',  -- 주문 취소
      'PARTIAL_CANCELLED' -- 부분 취소
    );
  END IF;
END$$;

CREATE TABLE public.orders (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name text,
	store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
	total_price numeric NOT NULL,
	status order_status NOT NULL,
	ordered_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.orders IS '공동구매 주문 정보';

-- ==============================
-- 2) update trigger
-- ==============================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================
-- 3) 주문 상태 동기화 트리거 함수들
-- ==============================

-- 주문이 취소될 때 모든 order_items를 취소로 변경
CREATE OR REPLACE FUNCTION public.sync_order_items_on_order_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- 주문 상태가 CANCELLED로 변경되었을 때
  IF OLD.status != 'CANCELLED' AND NEW.status = 'CANCELLED' THEN
    UPDATE public.order_items
    SET status = 'CANCELLED'
    WHERE order_id = NEW.id AND status != 'CANCELLED';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- order_items가 취소될 때 모든 아이템이 취소되면 주문도 취소로 변경
CREATE OR REPLACE FUNCTION public.sync_order_on_all_items_cancel()
RETURNS TRIGGER AS $$
DECLARE
  remaining_items_count INTEGER;
BEGIN
  -- order_item이 CANCELLED로 변경되었을 때만 처리
  IF (TG_OP = 'UPDATE' AND OLD.status != 'CANCELLED' AND NEW.status = 'CANCELLED') OR
     (TG_OP = 'INSERT' AND NEW.status = 'CANCELLED') THEN
    
    -- 해당 주문의 취소되지 않은 아이템 수 확인
    SELECT COUNT(*)
    INTO remaining_items_count
    FROM public.order_items
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id) AND status != 'CANCELLED';
    
    -- 모든 아이템이 취소되었으면 주문도 취소로 변경
    IF remaining_items_count = 0 THEN
      UPDATE public.orders
      SET status = 'CANCELLED'
      WHERE id = COALESCE(NEW.order_id, OLD.order_id) AND status != 'CANCELLED';
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trg_sync_order_items_on_order_cancel
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_items_on_order_cancel();

CREATE TRIGGER trg_sync_order_on_all_items_cancel
AFTER INSERT OR UPDATE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_on_all_items_cancel();



-- ==============================
-- ORDER_ITEMS 테이블
-- ==============================
CREATE TABLE public.order_items (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
	coop_id uuid NOT NULL REFERENCES public.coops(id) ON DELETE CASCADE,
	quantity integer NOT NULL,
	price numeric NOT NULL,
  total_price numeric NOT NULL,
	status order_status NOT NULL -- 주문 상태(ORDERED, COMPLETED, CANCELLED)
);
COMMENT ON TABLE public.order_items IS '공동구매 주문 상세(공동구매별) 정보';


-- ==============================
-- 인덱스
-- ==============================
CREATE INDEX idx_orders_store_id ON public.orders(store_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_coop_id ON public.order_items(coop_id);


-- ==============================
-- Realtime publication (supabase_realtime)
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR TABLE public.orders, public.order_items;
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'order_items'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
    END IF;
  END IF;
END$$;


-- ==============================
-- RLS 활성화
-- ==============================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;


-- ==============================
-- RLS 정책
-- ==============================
-- 모든 사용자 SELECT 허용
CREATE POLICY "orders select for all"
ON public.orders
FOR SELECT
USING (true);

CREATE POLICY "order_items select for all"
ON public.order_items
FOR SELECT
USING (true);


-- 본인(user_id) 또는 store_member만 INSERT/UPDATE/DELETE 허용
CREATE POLICY "orders modify for owner or store_member"
ON public.orders
FOR ALL
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.store_members sm
    WHERE sm.user_id = auth.uid() AND sm.store_id = public.orders.store_id
  )
);

CREATE POLICY "order_items modify for owner or store_member"
ON public.order_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id AND (
      o.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.store_members sm
        WHERE sm.user_id = auth.uid() AND sm.store_id = o.store_id
      )
    )
  )
);