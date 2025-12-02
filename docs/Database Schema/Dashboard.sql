-- ==============================
-- 가맹점 대시보드용 통계 VIEW
-- ==============================
-- 
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요:
-- 1. Supabase Dashboard 접속
-- 2. SQL Editor 메뉴 선택
-- 3. 아래 SQL 전체를 복사하여 실행
--
-- ==============================

-- 1. 이번달 매출 및 주문 통계 VIEW
CREATE OR REPLACE VIEW public.store_monthly_sales_stats
WITH (security_invoker = true) AS
SELECT
  o.store_id,
  DATE_TRUNC('month', o.created_at) AS month_start,
  
  -- 총 매출 (완료된 주문만)
  COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o.total_price ELSE 0 END), 0) AS total_sales,
  
  -- 총 주문 건수
  COUNT(DISTINCT o.id) AS total_orders,
  
  -- 완료된 주문 건수
  COUNT(DISTINCT CASE WHEN o.status = 'COMPLETED' THEN o.id END) AS completed_orders,
  
  -- 취소된 주문 건수
  COUNT(DISTINCT CASE WHEN o.status = 'CANCELLED' THEN o.id END) AS cancelled_orders,
  
  -- 신규 주문 건수 (CREATED)
  COUNT(DISTINCT CASE WHEN o.status = 'CREATED' THEN o.id END) AS pending_orders,
  
  -- 평균 주문 금액
  COALESCE(AVG(CASE WHEN o.status = 'COMPLETED' THEN o.total_price END), 0) AS avg_order_amount

FROM public.orders o
GROUP BY o.store_id, DATE_TRUNC('month', o.created_at);

COMMENT ON VIEW public.store_monthly_sales_stats IS '가맹점별 월간 매출 및 주문 통계';


-- 2. 주문 상태별 카운트 VIEW
CREATE OR REPLACE VIEW public.store_order_status_summary
WITH (security_invoker = true) AS
SELECT
  o.store_id,
  o.status,
  COUNT(*) AS order_count,
  COALESCE(SUM(o.total_price), 0) AS total_amount
FROM public.orders o
GROUP BY o.store_id, o.status;

COMMENT ON VIEW public.store_order_status_summary IS '가맹점별 주문 상태별 집계';


-- 3. 발주 상태별 카운트 VIEW
CREATE OR REPLACE VIEW public.store_purchase_status_summary
WITH (security_invoker = true) AS
SELECT
  p.store_id,
  p.status,
  COUNT(*) AS purchase_count,
  COALESCE(SUM(p.total_price), 0) AS total_amount
FROM public.purchases p
GROUP BY p.store_id, p.status;

COMMENT ON VIEW public.store_purchase_status_summary IS '가맹점별 발주 상태별 집계';


-- 4. 진행중인 공동구매 통계 VIEW
CREATE OR REPLACE VIEW public.store_active_coops_stats
WITH (security_invoker = true) AS
SELECT
  c.store_id,
  c.status,
  COUNT(*) AS coop_count,
  COALESCE(SUM(c.max_quantity), 0) AS total_max_quantity,
  COALESCE(SUM((
    SELECT COALESCE(SUM(oi.quantity), 0)
    FROM public.order_items oi
    WHERE oi.coop_id = c.id
      AND oi.status IN ('CREATED', 'COMPLETED')
  )), 0) AS total_ordered_quantity
FROM public.coops c
WHERE c.status IN ('ONGOING', 'PREPARING')
GROUP BY c.store_id, c.status;

COMMENT ON VIEW public.store_active_coops_stats IS '가맹점별 진행중인 공동구매 통계';


-- ==============================
-- 인덱스 최적화
-- ==============================
-- orders 테이블에 월별 검색 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_store_created_month ON public.orders(store_id, DATE_TRUNC('month', created_at));

-- orders 테이블에 상태별 검색 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_store_status ON public.orders(store_id, status);

-- purchases 테이블에 상태별 검색 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_purchases_store_status ON public.purchases(store_id, status);

-- coops 테이블에 상태별 검색 최적화 인덱스 (이미 존재할 수 있음)
CREATE INDEX IF NOT EXISTS idx_coops_store_status ON public.coops(store_id, status);
