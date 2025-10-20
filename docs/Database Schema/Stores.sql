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
  address text,
  address_detail text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  place_id text,
  phone text,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
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
-- store_members: 자신이 속한 store 조회 가능
-- store.owner: 자신이 owner인 store 조회 가능
-- store.type = 'hq': 모든 store 조회 가능
CREATE POLICY "store select for members or owner or HQ"
ON public.stores
FOR SELECT
USING (
    type = 'hq'  -- HQ는 모든 조회 가능
    OR owner_id = auth.uid()  -- 자신이 owner인 store
    OR id IN (
        SELECT store_id FROM public.store_members WHERE user_id = auth.uid()
    )
);

-- store 생성 정책
-- store.type = 'hq' 사용자는 store 생성 가능
-- 일반 사용자는 생성 불가
CREATE POLICY "store insert for HQ"
ON public.stores
FOR INSERT
WITH CHECK (
    type = 'hq' AND auth.uid() IS NOT NULL
);

-- store 수정 정책
-- store.owner: 자신이 owner인 store 수정 가능
-- store.owner 변경: 단, owner는 한 명만 유지 (owner_id = auth.uid())
-- HQ 유저: 모든 store 수정 가능
CREATE POLICY "store update for owner or HQ"
ON public.stores
FOR UPDATE
USING (
    type = 'hq'  -- HQ 유저는 모든 store
    OR owner_id = auth.uid()  -- owner 자신
)
WITH CHECK (
    type = 'hq' OR owner_id = auth.uid()  -- owner_id 변경 가능할 때만
);

-- store 삭제 정책
-- HQ 유저만 삭제 가능
CREATE POLICY "store delete for HQ"
ON public.stores
FOR DELETE
USING (
    type = 'hq'
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
