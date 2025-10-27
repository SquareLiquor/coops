/* 
- 본사
  1. 상품 생성 시 본사.product, 본사.stock_transactions(입고) 생성
  2. 상품 정보 변경 시 재고 관리 (출고, 입고, 조정) 시 stock_transactions 생성
- 가맹점
  1. 조회 시 본사.product + 가맹점.product + 가맹점.coops를 조합한 view를 조회 (left outer join)
  2. 최초 정보 변경 시 가맹점.product, 가맹점.coops, 가맹점.stocks 생성
  3. 1
 */

-- ===================================================
-- Products.sql : 상품, 공동구매, 재고 트랜잭션, 가맹점 상품 VIEW
-- ===================================================

-- ==============================
-- 1) enum 타입
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_transaction_type') THEN
    CREATE TYPE stock_transaction_type AS ENUM (
      'initial',      -- 초기 재고
      'inbound',      -- 입고 (본사→가맹점, 공급사→HQ)
      'outbound',     -- 출고 (HQ→가맹점, 매장 판매 포함)
      'adjustment'    -- 재고 조정 (폐기, 분실 등)
    );
  END IF;
END$$;

-- ==============================
-- 2) tables
-- ==============================

-- 카테고리 관리 테이블
CREATE TABLE public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.product_categories IS '상품 카테고리 관리 테이블';

-- products 테이블 (본사/가맹점 공통)
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  origin_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.product_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  initial_stock integer NOT NULL DEFAULT 0,
  date date,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.products IS '상품 정보 (본사/가맹점)';

-- 상품 이미지 테이블 (여러 개, 대표 이미지 포함)
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  is_representative boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.product_images IS '상품 이미지(여러 개, 대표 이미지 포함)';

-- 공동구매 테이블
CREATE TABLE public.coops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  status text NOT NULL, -- 모집중, 마감 등
  max_quantity integer NOT NULL,
  price numeric NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.coops IS '공동구매 정보 (재고에는 직접 영향 없음)';

-- 재고 트랜잭션 테이블
CREATE TABLE public.stock_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  type stock_transaction_type NOT NULL,
  quantity integer NOT NULL,
  ref_id uuid,
  source_store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL,
  target_store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.stock_transactions IS '상품 재고 변동 내역 (본사 출고 시 가맹점 입고 자동 처리)';

-- ==============================
-- 3) indexes
-- ==============================
CREATE INDEX idx_products_store_id ON public.products(store_id);
CREATE INDEX idx_products_origin_id ON public.products(origin_id);
CREATE INDEX idx_coops_store_id ON public.coops(store_id);
CREATE INDEX idx_coops_product_id ON public.coops(product_id);
CREATE INDEX idx_stock_transactions_product_id ON public.stock_transactions(product_id);
CREATE INDEX idx_stock_transactions_store_id ON public.stock_transactions(store_id);

-- ==============================
-- 4) triggers
-- ==============================
CREATE TRIGGER trg_update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================
-- 5) 가맹점 상품 통합 VIEW
-- ==============================
-- ===================================================
-- 가맹점 상품 통합 VIEW (실재고 + 공동구매 가능 수량 + 재고 경고)
-- ===================================================
CREATE OR REPLACE VIEW public.store_product_view AS
SELECT
    COALESCE(sp.id, hp.id) AS product_id,
    s.id AS store_id,
    COALESCE(sp.origin_id, hp.id) AS origin_id,
    COALESCE(sp.name, hp.name) AS name,
    COALESCE(sp.description, hp.description) AS description,
    COALESCE(sp.price, hp.price) AS price,
    COALESCE(sp.image_url, hp.image_url) AS image_url,
    COALESCE(sp.active, hp.active) AS active,
    COALESCE(sp.date, hp.date) AS date,
    
    -- ① 실제 재고 합계 (stock_transactions 기반)
    (
        SELECT COALESCE(SUM(st.quantity), 0)
        FROM public.stock_transactions st
        WHERE st.product_id = COALESCE(sp.id, hp.id)
          AND st.store_id = s.id
    ) AS stock_quantity,
    
    -- ④ 공동구매 정보
    c.id AS coop_id,
    c.status AS coop_status,
    c.max_quantity,
    c.price AS coop_price,
    c.start_at,
    c.end_at
    
    -- ⑤ 공동구매 참여 가능 수량
    -- c.max_quantity -
    -- COALESCE((
    --     SELECT SUM(o.quantity)
    --     FROM public.orders o
    --     WHERE o.coop_id = c.id
    --       AND o.status IN ('pending', 'completed')
    -- ), 0) AS coop_available_quantity

FROM public.stores s
-- 본사 상품
JOIN public.products hp
  ON hp.store_id = (SELECT id FROM public.stores WHERE type = 'hq' LIMIT 1)
-- 가맹점 상품(본사 상품 복사 가능)
LEFT JOIN public.products sp
  ON sp.origin_id = hp.id AND sp.store_id = s.id
-- 공동구매 (가맹점 기준)
LEFT JOIN public.coops c
  ON c.product_id = COALESCE(sp.id, hp.id)
  AND c.store_id = s.id

WHERE s.type = 'branch';


-- ==============================
-- 6) Realtime publication (supabase_realtime)
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR TABLE public.products, public.coops, public.stock_transactions;
  ELSE
    -- 테이블이 등록되어 있는지 확인 후 없으면 추가
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'coops'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.coops;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'stock_transactions'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_transactions;
    END IF;
  END IF;
END$$;

-- ==============================
-- 7) RLS 활성화
-- ==============================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;

-- ==============================
-- 8) RLS 정책 (예시, 실제 정책은 서비스 정책에 맞게 추가 필요)
-- ==============================

-- products: 모든 사용자 SELECT 허용 (예시)
CREATE POLICY "products select for all"
ON public.products
FOR SELECT
USING (true);

-- products: 모든 인증된 사용자 INSERT 허용
CREATE POLICY "products insert for authenticated"
ON public.products
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- products: 모든 인증된 사용자 UPDATE 허용
CREATE POLICY "products update for authenticated"
ON public.products
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- products: 모든 인증된 사용자 DELETE 허용
CREATE POLICY "products delete for authenticated"
ON public.products
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- coops: 모든 사용자 SELECT 허용 (예시)
CREATE POLICY "coops select for all"
ON public.coops
FOR SELECT
USING (true);

-- stock_transactions: 모든 사용자 SELECT 허용 (예시)
CREATE POLICY "stock_transactions select for all"
ON public.stock_transactions
FOR SELECT
USING (true);

-- products: 모든 인증된 사용자 INSERT 허용
CREATE POLICY "stock_transactions insert for authenticated"
ON public.stock_transactions
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- products: 모든 인증된 사용자 UPDATE 허용
CREATE POLICY "stock_transactions update for authenticated"
ON public.stock_transactions
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- products: 모든 인증된 사용자 DELETE 허용
CREATE POLICY "stock_transactions delete for authenticated"
ON public.stock_transactions
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- 실제 서비스에서는 INSERT/UPDATE/DELETE 정책을 별도로 설계 필요