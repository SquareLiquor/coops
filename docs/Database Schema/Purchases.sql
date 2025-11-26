-- 발주 관리 테이블
-- 매장에서 본사로 상품을 발주한 내역을 관리한다.
-- 매장에서는 공동구매(coops)에 매칭되는 상품을 관리하고 있고, 해당 상품은 본사의 상품ID를 origin_id로 가지고 있다.
-- 발주 내역은 매장별로 관리되며, 동일한 본사 상품에 대해 매장마다 별도의 발주 내역이 존재할 수 있다.
-- 발주 상태는 '요청', '승인', '출고', '취소', '거부'의 enum으로 관리한다.
-- 신청 시에는 본사의 상품 정보를 기본으로 보여준다. 본사 상품의 단위를 보여주고, 매장에서 공동구매로 인해 발생한 주문량을 기반으로 발주 수량을 입력받는다.
-- ex) 단위: 박스, 주문량: 100 개 (공동구매의 단위), 발주수량: 10 박스(본사 상품의 단위)

-- 매장에서는 view를 생성해서 목록을 조회한다. coops가 메인 테이블, purchases와 outer join 한다.
-- 본사에서는 발주 관리 테이블로 목록을 조회한다.

-- ==============================
-- 1) enum 타입
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'purchase_status') THEN
    CREATE TYPE purchase_status AS ENUM (
      'REQUESTED',        -- 요청
      'APPROVED',         -- 승인
      'DELIVERY_STARTED', -- 출고
      'DELIVERED',        -- 배송 완료
      'REJECTED',         -- 거부
      'CANCELLED'         -- 취소
    );
  END IF;
END$$;

-- ==============================
-- 2) 테이블
-- ==============================
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  coop_id uuid NOT NULL REFERENCES public.coops(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  status purchase_status NOT NULL DEFAULT 'REQUESTED',
  quantity integer NOT NULL,
  price number NOT NULL,
  unit text NOT NULL,
  total_price number NOT NULL,
  requested_date timestamptz NOT NULL DEFAULT now(),
  approved_date timestamptz,
  shipped_date timestamptz,
  cancelled_date timestamptz,
  rejected_date timestamptz,
  rejection_reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.purchases IS '발주 관리 정보';
COMMENT ON COLUMN public.purchases.product_id IS '본사 상품 ID';
COMMENT ON COLUMN public.purchases.quantity IS '발주 수량 (본사 상품 단위)';
COMMENT ON COLUMN public.purchases.unit IS '본사 상품 단위';
COMMENT ON COLUMN public.purchases.rejection_reason IS '거부 사유';
COMMENT ON COLUMN public.purchases.notes IS '비고';

-- ==============================
-- 3) 인덱스
-- ==============================
CREATE INDEX idx_purchases_store_id ON public.purchases(store_id);
CREATE INDEX idx_purchases_coop_id ON public.purchases(coop_id);
CREATE INDEX idx_purchases_product_id ON public.purchases(product_id);
CREATE INDEX idx_purchases_status ON public.purchases(status);
CREATE INDEX idx_purchases_requested_date ON public.purchases(requested_date);
-- 조건에 최적화된 다중 컬럼 인덱스
CREATE INDEX idx_purchases_store_status ON public.purchases(store_id, status);

-- ==============================
-- 4) 트리거
-- ==============================
CREATE TRIGGER trg_update_purchases_updated_at
BEFORE UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================
-- 5) Realtime publication (supabase_realtime)
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR TABLE public.purchases;
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'purchases'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.purchases;
    END IF;
  END IF;
END$$;

-- ==============================
-- 6) RLS 활성화
-- ==============================
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- ==============================
-- 7) RLS 정책
-- ==============================
-- 본사 관리자는 모든 발주 조회 가능
CREATE POLICY "purchases select for hq admin"
ON public.purchases
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.store_members sm
    JOIN public.stores s ON sm.store_id = s.id
    WHERE sm.user_id = auth.uid() AND s.type = 'hq'
  )
);

-- 매장 멤버는 자신의 매장 발주만 조회 가능
CREATE POLICY "purchases select for store member"
ON public.purchases
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.store_members sm
    WHERE sm.user_id = auth.uid() AND sm.store_id = purchases.store_id
  )
);

-- 매장 멤버만 발주 생성 가능
CREATE POLICY "purchases insert for store member"
ON public.purchases
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.store_members sm
    WHERE sm.user_id = auth.uid() AND sm.store_id = purchases.store_id
  )
);

-- 매장 멤버는 자신의 매장 발주만 수정 가능 (요청 상태일 때만)
CREATE POLICY "purchases update for store member"
ON public.purchases
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.store_members sm
    WHERE sm.user_id = auth.uid() AND sm.store_id = purchases.store_id
  ) AND status = 'REQUESTED'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.store_members sm
    WHERE sm.user_id = auth.uid() AND sm.store_id = purchases.store_id
  )
);

-- 본사 관리자는 모든 발주 수정 가능
CREATE POLICY "purchases update for hq admin"
ON public.purchases
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM public.store_members sm
    JOIN public.stores s ON sm.store_id = s.id
    WHERE sm.user_id = auth.uid() AND s.type = 'hq'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.store_members sm
    JOIN public.stores s ON sm.store_id = s.id
    WHERE sm.user_id = auth.uid() AND s.type = 'hq'
  )
);

-- 매장 멤버는 자신의 매장 발주만 삭제 가능 (요청 상태일 때만)
CREATE POLICY "purchases delete for store member"
ON public.purchases
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.store_members sm
    WHERE sm.user_id = auth.uid() AND sm.store_id = purchases.store_id
  ) AND status = 'REQUESTED'
);

-- ==============================
-- 8) 매장용 뷰 (coops 메인, purchases outer join)
-- ==============================
CREATE OR REPLACE VIEW public.store_purchase_view
WITH (security_invoker = true) AS
SELECT
  coop.id AS coop_id,
  coop.name AS coop_name,
  coop.description AS coop_description,
  coop.status AS coop_status,
  coop.sales_date,
  coop.sales_price,
  coop.max_quantity,

  coop.store_id,
  store.name AS store_name,

  coop.product_id,
  prd.name AS product_name,
  prd.price AS product_price,
  prd.capacity_text as product_capacity,
  prd.sell_unit_text AS product_sell_unit,
  
  prd.origin_id AS origin_product_id,
  origin_prd.name AS origin_product_name,
  origin_prd.price AS origin_product_price,
  origin_prd.capacity_text as origin_product_capacity,
  origin_prd.sell_unit_text AS origin_product_sell_unit,
  origin_prd.purchase_unit AS origin_product_purchase_unit,
  origin_prd.purchase_qty AS origin_product_purchase_qty,

  coop.category_id,
  ct.name AS category_name,

  (
    SELECT sum(oi.quantity)
    FROM public.order_items oi
    WHERE oi.coop_id = coop.id
      AND oi.status IN ('CREATED', 'COMPLETED')
  ) AS ordered_quantity,

  -- 발주 정보 (없을 수도 있음)
  p.id AS purchase_id,
  p.status AS purchase_status,
  p.quantity AS purchase_quantity,
  p.price AS purchase_price,
  p.unit AS purchase_unit,
  p.total_price AS purchase_total_price,
  p.requested_date,
  p.approved_date,
  p.shipped_date,
  p.cancelled_date,
  p.rejected_date,
  p.rejection_reason,
  p.notes,

  coop.created_at,
  coop.updated_at

FROM public.coops coop
JOIN public.stores store ON coop.store_id = store.id
JOIN public.products prd ON coop.product_id = prd.id
LEFT JOIN public.products origin_prd ON prd.origin_id = origin_prd.id
JOIN public.categories ct ON coop.category_id = ct.id
LEFT JOIN public.purchases p ON p.coop_id = coop.id
;

COMMENT ON VIEW public.store_purchase_view IS '매장용 발주 정보 포함 공동구매 뷰';

-- ==============================
-- 9) 본사용 뷰 (purchases 메인)
-- ==============================
CREATE OR REPLACE VIEW public.hq_purchase_view
WITH (security_invoker = true) AS
SELECT
  p.id AS purchase_id,
  p.status AS purchase_status,
  p.quantity AS purchase_quantity,
  p.price AS purchase_price,
  p.unit AS purchase_unit,
  p.total_price AS purchase_total_price,
  p.requested_date,
  p.approved_date,
  p.shipped_date,
  p.cancelled_date,
  p.rejected_date,
  p.rejection_reason,
  p.notes,

  p.store_id,
  store.name AS store_name,

  p.coop_id,
  coop.name AS coop_name,
  coop.sales_date,
  coop.sales_price,

  p.product_id AS origin_product_id,
  origin_prd.name AS origin_product_name,
  origin_prd.price AS origin_product_price,
  origin_prd.capacity_text as origin_product_capacity,
  origin_prd.sell_unit_text AS origin_product_sell_unit,
  origin_prd.purchase_unit AS origin_product_purchase_unit,
  origin_prd.purchase_qty AS origin_product_purchase_qty,

  coop.product_id AS product_id,
  prd.name AS product_name,

  coop.category_id,
  ct.name AS category_name,

  (
    SELECT sum(oi.quantity)
    FROM public.order_items oi
    WHERE oi.coop_id = coop.id
      AND oi.status IN ('CREATED', 'COMPLETED')
  ) AS coop_ordered_quantity,

  p.created_at,
  p.updated_at

FROM public.purchases p
JOIN public.stores store ON p.store_id = store.id
JOIN public.coops coop ON p.coop_id = coop.id
JOIN public.products prd ON coop.product_id = prd.id
JOIN public.products origin_prd ON p.product_id = origin_prd.id
JOIN public.categories ct ON coop.category_id = ct.id
;

COMMENT ON VIEW public.hq_purchase_view IS '본사용 발주 관리 뷰';

-- Realtime을 사용한다면 추천
ALTER TABLE public.purchases REPLICA IDENTITY FULL;

