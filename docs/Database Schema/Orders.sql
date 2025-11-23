
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
	created_at timestamptz NOT NULL DEFAULT now(),
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

-- 주문 상태가 CANCELLED, COMPLETED, CREATED로 변경될 때 모든 order_items 상태 동기화
CREATE OR REPLACE FUNCTION public.sync_order_items_on_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- 주문 상태가 CANCELLED로 변경되었을 때
  IF OLD.status != 'CANCELLED' AND NEW.status = 'CANCELLED' THEN
    UPDATE public.order_items
    SET status = 'CANCELLED'
    WHERE order_id = NEW.id AND status != 'CANCELLED';
  END IF;

  -- 주문 상태가 COMPLETED로 변경되었을 때
  IF OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED' THEN
    UPDATE public.order_items
    SET status = 'COMPLETED'
    WHERE order_id = NEW.id AND status != 'COMPLETED';
  END IF;

  -- 주문 상태가 CREATED로 변경되었을 때 (복구)
  IF OLD.status != 'CREATED' AND NEW.status = 'CREATED' THEN
    UPDATE public.order_items
    SET status = 'CREATED'
    WHERE order_id = NEW.id AND status != 'CREATED';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- order_items가 취소, 완료, 복구될 때 주문 상태 동기화
CREATE OR REPLACE FUNCTION public.sync_order_on_all_items_status_change()
RETURNS TRIGGER AS $$
DECLARE
  cancelled_items_count INTEGER;
  completed_items_count INTEGER;
  created_items_count INTEGER;
  total_items_count INTEGER;
  order_id_val UUID;
BEGIN
  -- order_item이 CANCELLED, COMPLETED, CREATED로 변경되었을 때만 처리
  IF (
    (TG_OP = 'UPDATE' AND (
      (OLD.status != 'CANCELLED' AND NEW.status = 'CANCELLED') OR
      (OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED') OR
      (OLD.status != 'CREATED' AND NEW.status = 'CREATED')
    )) OR
    (TG_OP = 'INSERT' AND (NEW.status = 'CANCELLED' OR NEW.status = 'COMPLETED' OR NEW.status = 'CREATED'))
  ) THEN
    order_id_val := COALESCE(NEW.order_id, OLD.order_id);
    -- 전체 아이템 수
    SELECT COUNT(*) INTO total_items_count FROM public.order_items WHERE order_id = order_id_val;
    -- 취소된 아이템 수
    SELECT COUNT(*) INTO cancelled_items_count FROM public.order_items WHERE order_id = order_id_val AND status = 'CANCELLED';
    -- 완료된 아이템 수
    SELECT COUNT(*) INTO completed_items_count FROM public.order_items WHERE order_id = order_id_val AND status = 'COMPLETED';
    -- 생성(복구)된 아이템 수
    SELECT COUNT(*) INTO created_items_count FROM public.order_items WHERE order_id = order_id_val AND status = 'CREATED';

    IF total_items_count = 0 THEN
      RETURN COALESCE(NEW, OLD);
    END IF;

    -- 모든 아이템이 취소되었으면 주문도 취소로 변경
    IF cancelled_items_count = total_items_count THEN
      UPDATE public.orders
      SET status = 'CANCELLED'
      WHERE id = order_id_val AND status != 'CANCELLED';
    -- 모든 아이템이 완료되었으면 주문도 완료로 변경
    ELSIF completed_items_count = total_items_count THEN
      UPDATE public.orders
      SET status = 'COMPLETED'
      WHERE id = order_id_val AND status != 'COMPLETED';
    -- 모든 아이템이 CREATED면 주문도 CREATED로 변경
    ELSIF created_items_count = total_items_count THEN
      UPDATE public.orders
      SET status = 'CREATED'
      WHERE id = order_id_val AND status != 'CREATED';
    -- 일부만 취소(나머지는 CREATED) → PARTIAL_CANCELLED
    ELSIF cancelled_items_count > 0 AND cancelled_items_count < total_items_count THEN
      UPDATE public.orders 
      SET status = 'PARTIAL_CANCELLED' 
      WHERE id = order_id_val AND status != 'PARTIAL_CANCELLED';

    -- 일부만 복구(나머지는 CANCELLED) → PARTIAL_CREATED (필요시 새 상태 추가)
    -- ELSIF created_items_count > 0 AND created_items_count < total_items_count THEN
    --   UPDATE public.orders 
    --   SET status = 'PARTIAL_CANCELLED' 
    --   WHERE id = order_id_val AND status != 'PARTIAL_CANCELLED';

    -- 일부만 완료(나머지는 CREATED/취소 등) → PARTIAL_COMPLETED (필요시 새 상태 추가)
    -- ELSIF completed_items_count > 0 AND completed_items_count < total_items_count THEN
    --   UPDATE public.orders SET status = 'PARTIAL_COMPLETED' WHERE id = order_id_val AND status != 'PARTIAL_COMPLETED';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;


-- 트리거 생성
CREATE TRIGGER trg_sync_order_items_on_order_status_change
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_items_on_order_status_change();

CREATE TRIGGER trg_sync_order_on_all_items_status_change
AFTER INSERT OR UPDATE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_on_all_items_status_change();



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
  created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.order_items IS '공동구매 주문 상세(공동구매별) 정보';

CREATE TRIGGER trg_update_order_items_updated_at
BEFORE UPDATE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
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