-- ===================================================
-- Supabase: 발주 승인/수량 변경/취소 + 매장 주문 완료 + 재고 조정
-- ===================================================

-- ==========================================
-- Function: 상품 등록 시 초기 재고 트랜잭션 생성 (0 포함)
-- ==========================================
CREATE OR REPLACE FUNCTION public.trg_stock_on_product_insert()
RETURNS trigger AS $$
BEGIN
  -- 초기 재고가 0이거나 그 이상인 경우 모두 트랜잭션 생성
  INSERT INTO public.stock_transactions(
        product_id,
        store_id,
        type,
        quantity,
        source_store_id,
        target_store_id,
        reason,
        ref_id,
        created_at
    ) VALUES (
        NEW.id,
        NEW.store_id,
        'initial',
        NEW.initial_stock,
        NULL,
        NEW.store_id,
        '상품 등록 초기 재고',
        NEW.id,
        now()
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Trigger: products 테이블 AFTER INSERT 시 실행
-- ==========================================
CREATE TRIGGER trg_stock_on_product_insert
AFTER INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.trg_stock_on_product_insert();


-- 1️⃣ Stock Transaction 생성 함수 (기존과 동일)
CREATE OR REPLACE FUNCTION public.fn_create_stock_transaction(
    p_product_id uuid,
    p_quantity integer,
    p_source_store_id uuid,
    p_target_store_id uuid,
    p_reason text,
    p_ref_id uuid
)
RETURNS void AS $$
BEGIN
  IF p_quantity < 0 THEN
    INSERT INTO public.stock_transactions(
        product_id,
        store_id,
        type,
        quantity,
        source_store_id,
        target_store_id,
        reason,
        ref_id,
        created_at
    ) VALUES (
        p_product_id,
        p_source_store_id,
        'outbound',
        p_quantity,
        p_source_store_id,
        p_target_store_id,
        p_reason,
        p_ref_id,
        now()
    );
  END IF;

  IF p_quantity > 0 THEN
    INSERT INTO public.stock_transactions(
        product_id,
        store_id,
        type,
        quantity,
        source_store_id,
        target_store_id,
        reason,
        ref_id,
        created_at
    ) VALUES (
        p_product_id,
        p_target_store_id,
        'inbound',
        p_quantity,
        p_source_store_id,
        p_target_store_id,
        p_reason,
        p_ref_id,
        now()
    );
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 2️⃣ 발주 승인/수량 변경/취소 트리거
CREATE OR REPLACE FUNCTION public.trg_stock_on_purchase()
RETURNS trigger AS $$
DECLARE
  old_qty integer;
  qty_diff integer;
BEGIN
  old_qty := COALESCE(OLD.quantity, 0);

  -- ① 승인 시
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    PERFORM public.fn_create_stock_transaction(
      p_product_id      := NEW.product_id,
      p_quantity        := NEW.quantity,
      p_source_store_id := NEW.hq_store_id,
      p_target_store_id := NEW.store_id,
      p_reason          := '발주 출고',
      p_ref_id          := NEW.id
    );
  END IF;

  -- ② 수량 변경 시 (승인된 상태에서)
  IF NEW.status = 'approved' AND OLD.status = 'approved' AND NEW.quantity <> OLD.quantity THEN
    qty_diff := NEW.quantity - OLD.quantity;
    PERFORM public.fn_create_stock_transaction(
      p_product_id      := NEW.product_id,
      p_quantity        := qty_diff,
      p_source_store_id := NEW.hq_store_id,
      p_target_store_id := NEW.store_id,
      p_reason          := '발주 수량 변경 보정',
      p_ref_id          := NEW.id
    );
  END IF;

  -- ③ 취소 시
  IF NEW.status = 'cancelled' AND OLD.status = 'approved' THEN
    qty_diff := -OLD.quantity;
    PERFORM public.fn_create_stock_transaction(
      p_product_id      := OLD.product_id,
      p_quantity        := qty_diff,
      p_source_store_id := OLD.hq_store_id,
      p_target_store_id := OLD.store_id,
      p_reason          := '발주 취소 롤백',
      p_ref_id          := OLD.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_on_purchase
AFTER UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.trg_stock_on_purchase();

-- 3️⃣ 매장 주문 완료 시 Store 출고
CREATE OR REPLACE FUNCTION public.trg_stock_on_order_completed()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    PERFORM public.fn_create_stock_transaction(
      p_product_id      := NEW.product_id,
      p_quantity        := -NEW.quantity,
      p_source_store_id := NEW.store_id,
      p_target_store_id := NULL,
      p_reason          := '매장 판매 출고',
      p_ref_id          := NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_on_order_completed
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.trg_stock_on_order_completed();

-- 4️⃣ 재고 조정 (수동)
CREATE OR REPLACE FUNCTION public.fn_adjust_stock(
    p_product_id uuid,
    p_store_id uuid,
    p_quantity integer,
    p_reason text
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.stock_transactions(
      product_id,
      store_id,
      type,
      quantity,
      reason,
      created_at
  ) VALUES (
      p_product_id,
      p_store_id,
      'adjustment',
      p_quantity,
      p_reason,
      now()
  );
END;
$$ LANGUAGE plpgsql;
