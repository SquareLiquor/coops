
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