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
      'INITIAL',      -- 초기 재고
      'INBOUND',      -- 입고 (본사→가맹점, 공급사→HQ)
      'OUTBOUND',     -- 출고 (HQ→가맹점, 매장 판매 포함)
      'ADJUSTMENT'    -- 재고 조정 (폐기, 분실 등)
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_type') THEN
    CREATE TYPE unit_type AS ENUM ('EA', 'BOX', 'PACK', 'SET', 'BAG');
  END IF;
END$$;

-- ==============================
-- 2) tables
-- ==============================

-- 카테고리 관리 테이블
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT categories_store_name_key UNIQUE (store_id, name)
);
COMMENT ON TABLE public.categories IS '상품 카테고리 관리 테이블';

-- products 테이블 (본사/가맹점 공통)
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  origin_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  initial_stock integer NOT NULL DEFAULT 0,
  capacity_text text,
  sell_unit_text text,
  purchase_unit text,
  purchase_qty numeric,
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
  representative boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.product_images IS '상품 이미지(여러 개, 대표 이미지 포함)';

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