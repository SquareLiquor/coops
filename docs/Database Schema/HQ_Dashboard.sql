-- ==============================
-- 본사 대시보드용 통계 VIEW
-- ==============================
-- 
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요:
-- 1. Supabase Dashboard 접속
-- 2. SQL Editor 메뉴 선택
-- 3. 아래 SQL 전체를 복사하여 실행
--
-- ==============================

-- 1. 가맹점 승인 상태별 집계 VIEW
CREATE OR REPLACE VIEW public.hq_approval_status_summary
WITH (security_invoker = true) AS
SELECT
  sar.status AS approval_status,
  COUNT(*) AS approval_count
FROM public.signup_approval_requests sar
WHERE sar.status IS NOT NULL
GROUP BY sar.status;

COMMENT ON VIEW public.hq_approval_status_summary IS '본사 가맹점 승인 상태별 집계';


-- 2. 전체 발주 상태별 집계 VIEW
CREATE OR REPLACE VIEW public.hq_purchase_status_summary
WITH (security_invoker = true) AS
SELECT
  p.status,
  COUNT(*) AS purchase_count,
  COALESCE(SUM(p.total_price), 0) AS total_amount
FROM public.purchases p
GROUP BY p.status;

COMMENT ON VIEW public.hq_purchase_status_summary IS '본사 전체 발주 상태별 집계';


-- 3. 가맹점 운영 현황 VIEW
CREATE OR REPLACE VIEW public.hq_store_status_summary
WITH (security_invoker = true) AS
SELECT
  COUNT(*) AS total_stores,
  COUNT(CASE WHEN s.active = true THEN 1 END) AS active_stores,
  COUNT(CASE WHEN s.active = false THEN 1 END) AS inactive_stores,
  COUNT(CASE WHEN s.type = 'branch' THEN 1 END) AS branch_stores,
  COUNT(CASE WHEN s.type = 'hq' THEN 1 END) AS hq_stores
FROM public.stores s;

COMMENT ON VIEW public.hq_store_status_summary IS '본사 가맹점 운영 현황 집계';


-- 4. 이번달 가맹점별 매출 통계 VIEW
CREATE OR REPLACE VIEW public.hq_monthly_store_sales
WITH (security_invoker = true) AS
SELECT
  o.store_id,
  s.name AS store_name,
  DATE_TRUNC('month', o.created_at) AS month_start,
  
  -- 총 매출 (완료된 주문만)
  COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o.total_price ELSE 0 END), 0) AS total_sales,
  
  -- 총 주문 건수
  COUNT(DISTINCT o.id) AS total_orders,
  
  -- 완료된 주문 건수
  COUNT(DISTINCT CASE WHEN o.status = 'COMPLETED' THEN o.id END) AS completed_orders

FROM public.orders o
JOIN public.stores s ON o.store_id = s.id
GROUP BY o.store_id, s.name, DATE_TRUNC('month', o.created_at);

COMMENT ON VIEW public.hq_monthly_store_sales IS '본사 월별 가맹점별 매출 통계';


-- 5. 전체 통합 매출 통계 VIEW
CREATE OR REPLACE VIEW public.hq_total_monthly_sales
WITH (security_invoker = true) AS
SELECT
  DATE_TRUNC('month', o.created_at) AS month_start,
  
  -- 전체 매출
  COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o.total_price ELSE 0 END), 0) AS total_sales,
  
  -- 전체 주문 건수
  COUNT(DISTINCT o.id) AS total_orders,
  
  -- 완료된 주문 건수
  COUNT(DISTINCT CASE WHEN o.status = 'COMPLETED' THEN o.id END) AS completed_orders,
  
  -- 활성 가맹점 수 (주문이 있는 가맹점)
  COUNT(DISTINCT o.store_id) AS active_store_count

FROM public.orders o
GROUP BY DATE_TRUNC('month', o.created_at);

COMMENT ON VIEW public.hq_total_monthly_sales IS '본사 전체 통합 매출 통계';


-- 6. 상품별 판매 현황 VIEW
CREATE OR REPLACE VIEW public.hq_product_sales_summary
WITH (security_invoker = true) AS
SELECT
  p.id AS product_id,
  p.name AS product_name,
  p.category_id,
  c.name AS category_name,
  
  -- 해당 상품으로 생성된 공동구매 수
  COUNT(DISTINCT co.id) AS coop_count,
  
  -- 총 주문량
  COALESCE(SUM((
    SELECT COALESCE(SUM(oi.quantity), 0)
    FROM public.order_items oi
    WHERE oi.coop_id = co.id
      AND oi.status IN ('CREATED', 'COMPLETED')
  )), 0) AS total_ordered_quantity,
  
  -- 진행중인 공동구매 수
  COUNT(DISTINCT CASE WHEN co.status = 'ONGOING' THEN co.id END) AS ongoing_coop_count

FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.coops co ON co.product_id = p.id
WHERE p.origin_id IS NULL  -- 본사 상품만
GROUP BY p.id, p.name, p.category_id, c.name;

COMMENT ON VIEW public.hq_product_sales_summary IS '본사 상품별 판매 현황 집계';


-- 7. 발주가 많은 상품 통계 VIEW
CREATE OR REPLACE VIEW public.hq_top_purchased_products
WITH (security_invoker = true) AS
SELECT
  p.id AS origin_product_id,
  p.name AS product_name,
  p.category_id,
  cat.name AS category_name,
  
  -- 발주 횟수
  COUNT(pur.id) AS purchase_count,
  
  -- 총 발주 수량
  COALESCE(SUM(pur.quantity), 0) AS total_quantity,
  
  -- 총 발주 금액
  COALESCE(SUM(pur.total_price), 0) AS total_amount

FROM public.products p
LEFT JOIN public.categories cat ON p.category_id = cat.id
LEFT JOIN public.purchases pur ON pur.product_id = p.id
WHERE p.origin_id IS NULL  -- 본사 상품만
  AND pur.status IN ('REQUESTED', 'APPROVED', 'DELIVERY_STARTED', 'DELIVERED')
GROUP BY p.id, p.name, p.category_id, cat.name
ORDER BY purchase_count DESC, total_quantity DESC;

COMMENT ON VIEW public.hq_top_purchased_products IS '본사 발주가 많은 상품 통계';


-- ==============================
-- 인덱스 최적화
-- ==============================

-- stores 테이블에 활성 상태 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_stores_active_type ON public.stores(active, type);
