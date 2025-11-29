
-- ==============================
-- 1) enum 타입
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sales_status') THEN
    CREATE TYPE sales_status AS ENUM (
      'PREPARING',     -- 판매 준비
      'ONGOING',       -- 판매 진행
      'ENDED',         -- 판매 종료
      'COMPLETED',     -- 판매 완료
      'STOPPED',       -- 판매 중지
      'PAUSED'         -- 판매 일시 정지
    );
  END IF;
END$$;

-- ==============================
-- 2) 테이블
-- ==============================
CREATE TABLE public.coops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE SET NULL,
  status sales_status NOT NULL,
  max_quantity integer NOT NULL,
  sales_price numeric NOT NULL,
  sales_date timestamptz NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.coops IS '공동구매 정보';

-- ==============================
-- 3) 인덱스
-- ==============================
CREATE INDEX idx_coops_store_id ON public.coops(store_id);
CREATE INDEX idx_coops_product_id ON public.coops(product_id);

-- ==============================
-- 4) 트리거
-- ==============================
CREATE TRIGGER trg_update_coops_updated_at
BEFORE UPDATE ON public.coops
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================
-- 5) Realtime publication (supabase_realtime)
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR TABLE public.coops;
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'coops'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.coops;
    END IF;
  END IF;
END$$;

-- ==============================
-- 6) RLS 활성화
-- ==============================
ALTER TABLE public.coops ENABLE ROW LEVEL SECURITY;

-- ==============================
-- 7) RLS 정책
-- ==============================
-- 모든 사용자 SELECT 허용
CREATE POLICY "coops select for all"
ON public.coops
FOR SELECT
USING (true);

-- store_member만 INSERT/UPDATE/DELETE 허용 (예시: store_id가 자신의 store)
CREATE POLICY "coops insert for store_member"
ON public.coops
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.store_members sm
  WHERE sm.user_id = auth.uid() AND sm.store_id = coops.store_id
));

CREATE POLICY "coops update for store_member"
ON public.coops
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.store_members sm
  WHERE sm.user_id = auth.uid() AND sm.store_id = coops.store_id
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.store_members sm
  WHERE sm.user_id = auth.uid() AND sm.store_id = coops.store_id
));

CREATE POLICY "coops delete for store_member"
ON public.coops
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.store_members sm
  WHERE sm.user_id = auth.uid() AND sm.store_id = coops.store_id
));


-- ==============================
-- 8) 주문정보가 포함된 뷰
-- ==============================
CREATE OR REPLACE VIEW public.coop_overview_view
WITH (security_invoker = true) AS
SELECT
  coop.id,
  coop.name,
  coop.description,

  coop.store_id,
  store.name AS store_name,

  coop.product_id,
  prd.name AS product_name,

  coop.category_id,
  ct.name AS category_name,

  coop.status,
  coop.sales_date,
  coop.sales_price,
  coop.max_quantity,

  (
    SELECT url
    FROM public.coop_images ci
    WHERE ci.coop_id = coop.id
      AND ci.representative = true
    ORDER BY ci.sort_order ASC NULLS LAST
    LIMIT 1
  ) AS representative_image_url,

  COALESCE((
    SELECT json_agg(
      json_build_object(
        'id', ci.id,
        'url', ci.url,
        'representative', ci.representative,
        'sort_order', ci.sort_order,
        'created_at', ci.created_at
      )
      ORDER BY ci.sort_order ASC
    )
    FROM public.coop_images ci
    WHERE ci.coop_id = coop.id
  ), '[]'::json) AS images,


  COALESCE((
    SELECT SUM(oi.quantity)
    FROM public.order_items oi
    WHERE oi.coop_id = coop.id
      AND oi.status IN ('CREATED', 'COMPLETED')
  ), 0) AS ordered_quantity,

  coop.created_at,
  coop.updated_at

FROM public.coops coop
JOIN public.stores store ON coop.store_id = store.id
JOIN public.products prd ON coop.product_id = prd.id
JOIN public.categories ct ON coop.category_id = ct.id
;

COMMENT ON VIEW public.coop_overview_view IS '공동구매 목록 뷰';

-- 상태 검색용
CREATE INDEX idx_coops_status ON public.coops (status);
-- 판매일 정렬/검색용
CREATE INDEX idx_coops_sales_date ON public.coops (sales_date);
-- 카테고리 검색용
CREATE INDEX idx_coops_category ON public.coops (category_id);
-- 스토어 검색용
CREATE INDEX idx_coops_store ON public.coops (store_id);
-- 조건에 최적화된 다중 컬럼 인덱스
CREATE INDEX idx_order_items_coop_status ON public.order_items (coop_id, status);
CREATE INDEX idx_coop_images_coop_rep ON public.coop_images (coop_id, representative, created_at);

-- Realtime을 사용한다면 추천
ALTER TABLE public.order_items REPLICA IDENTITY FULL;