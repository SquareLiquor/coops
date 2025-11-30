-- TODO: policy 모두 임시 삭제된 상태, 나중에 복구 필요

-- ===================================================
-- schema.sql : stores + store_members (+ realtime) with HQ policy
-- ===================================================

-- 확장 설치 (UUID 생성)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================
-- 1) enum 타입
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'store_type') THEN
    CREATE TYPE store_type AS ENUM ('hq', 'branch');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'address_type') THEN
    CREATE TYPE address_type AS ENUM ('ROAD', 'JIBUN');
  END IF;
END$$;

-- ==============================
-- 2) helper: updated_at 트리거 함수
-- ==============================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================
-- 3) tables
-- ==============================

-- stores 테이블
CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type store_type NOT NULL DEFAULT 'branch',
  
  -- 주소 정보 (카카오맵 연동)
  address text NOT NULL,           -- 도로명 또는 지번 주소 (선택된 주소)
  address_detail text,             -- 상세주소 (동, 호수 등)
  address_type address_type NOT NULL DEFAULT 'ROAD', -- 주소 유형 (도로명 / 지번)
  road_address text,               -- 도로명 주소
  jibun_address text,              -- 지번 주소
  zipcode text,                    -- 우편번호
  building_name text,              -- 건물명
  
  -- 좌표 정보
  latitude numeric(10,7),          -- 위도
  longitude numeric(10,7),         -- 경도
  
  -- 기타
  phone text NOT NULL,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.stores IS '매장 정보 (hq / branch)';

-- store_members 테이블 (role 제거)
CREATE TABLE public.store_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (store_id, user_id)
);

COMMENT ON TABLE public.store_members IS '매장 - 사용자 관계 (중복 방지)';

-- ==============================
-- 4) indexes
-- ==============================
CREATE INDEX idx_store_members_store_id ON public.store_members(store_id);
CREATE INDEX idx_store_members_user_id ON public.store_members(user_id);

-- ==============================
-- 5) triggers
-- ==============================
CREATE TRIGGER trg_update_stores_updated_at
BEFORE UPDATE ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_update_store_members_updated_at
BEFORE UPDATE ON public.store_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================
-- 6) Realtime publication (supabase_realtime)
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR TABLE public.stores, public.store_members;
  ELSE
    -- 테이블이 등록되어 있는지 확인 후 없으면 추가
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'stores'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.stores;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'store_members'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.store_members;
    END IF;
  END IF;
END$$;

-- ==============================
-- 7) RLS 활성화
-- ==============================
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;

-- ==============================
-- 8) RLS 정책
-- ==============================

-- store 조회 정책
-- 모든 사용자 조회 가능
CREATE POLICY "store select for all"
ON public.stores
FOR SELECT
USING (true);

-- store 생성 정책
-- HQ 매장의 store_member만 생성 가능
CREATE POLICY "store insert for HQ members"
ON public.stores
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.store_members sm
        JOIN public.stores s ON s.id = sm.store_id
        WHERE sm.user_id = auth.uid()
          AND s.type = 'hq'
    )
);

-- store 수정 정책
-- HQ 매장의 store_member 또는 본인 매장의 store_member만 수정 가능
CREATE POLICY "store update for HQ or own store members"
ON public.stores
FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM public.store_members sm
        JOIN public.stores s ON s.id = sm.store_id
        WHERE sm.user_id = auth.uid()
          AND (s.type = 'hq' OR sm.store_id = public.stores.id)
    )
);

-- store 삭제 정책
-- HQ 매장의 store_member 또는 본인 매장의 store_member만 삭제 가능
CREATE POLICY "store delete for HQ or own store members"
ON public.stores
FOR DELETE
USING (
    EXISTS (
        SELECT 1
        FROM public.store_members sm
        JOIN public.stores s ON s.id = sm.store_id
        WHERE sm.user_id = auth.uid()
          AND (s.type = 'hq' OR sm.store_id = public.stores.id)
    )
);

-- store_members 조회 정책


-- store_members: 생성 정책



-- -- stores: 일반 멤버는 자기 매장만 조회 가능
-- CREATE POLICY "store members can view their store"
-- ON public.stores
-- FOR SELECT
-- USING (
--   EXISTS (
--     SELECT 1 FROM public.store_members sm
--     WHERE sm.user_id = auth.uid()
--       AND sm.store_id = public.stores.id
--   )
-- );

-- -- stores: owner는 자신의 store 조회 가능
-- CREATE POLICY "store owners can view their store"
-- ON public.stores
-- FOR SELECT
-- USING (public.stores.owner_id = auth.uid());

-- -- stores: HQ 멤버는 모든 store 조회 가능
-- CREATE POLICY "hq members can view all stores"
-- ON public.stores
-- FOR SELECT
-- USING (
--   EXISTS (
--     SELECT 1
--     FROM public.store_members sm
--     JOIN public.stores s ON s.id = sm.store_id
--     WHERE sm.user_id = auth.uid()
--       AND s.type = 'hq'
--   )
-- );

-- -- store_members: 사용자는 자기 membership만 조회 가능
-- CREATE POLICY "users can view their store_membership"
-- ON public.store_members
-- FOR SELECT
-- USING (public.store_members.user_id = auth.uid());

-- -- store_members: 같은 store 멤버들은 서로의 membership 조회 가능
-- CREATE POLICY "store members can view members in same store"
-- ON public.store_members
-- FOR SELECT
-- USING (
--   EXISTS (
--     SELECT 1 FROM public.store_members sm
--     WHERE sm.user_id = auth.uid()
--       AND sm.store_id = public.store_members.store_id
--   )
-- );

-- -- store_members: HQ 멤버는 모든 store_members 조회 가능
-- CREATE POLICY "hq members can view all store_members"
-- ON public.store_members
-- FOR SELECT
-- USING (
--   EXISTS (
--     SELECT 1
--     FROM public.store_members sm
--     JOIN public.stores s ON s.id = sm.store_id
--     WHERE sm.user_id = auth.uid()
--       AND s.type = 'hq'
--   )
-- );


-- ==============================
-- 9) 공용 조회용 뷰 생성
-- ==============================
-- 공용 조회용 뷰 생성
CREATE OR REPLACE VIEW public.stores_public AS
SELECT
  id,
  name,
  type,
  address,
  address_detail
FROM public.stores;

-- anon 사용자에게 SELECT 권한 부여
GRANT SELECT ON public.stores_public TO anon;
