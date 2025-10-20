-- ===================================================
-- users.sql : profiles + signup_approval_requests (+ realtime) with RLS policy
-- ===================================================

-- ==============================
-- 1) enum 타입
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
    CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END$$;

-- ==============================
-- 2) tables
-- ==============================

-- profiles 테이블: auth.users.id를 참조하며 ON DELETE CASCADE 적용
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  profile_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.profiles IS '사용자 프로필';

-- signup_approval_requests 테이블: 회원가입 등 승인 요청 관리
CREATE TABLE public.signup_approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- 요청자
  approver_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,          -- 승인자(본사)
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
  status approval_status NOT NULL DEFAULT 'pending',
  reason text NOT NULL DEFAULT '신규 가입 승인 요청',
  requested_at timestamptz,
  approved_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.signup_approval_requests IS '회원가입 승인 요청 관리 테이블';

-- ==============================
-- 3) triggers
-- ==============================
CREATE TRIGGER trg_update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_signup_approval_requests_updated_at
BEFORE UPDATE ON public.signup_approval_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================
-- 4) RLS 활성화
-- ==============================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signup_approval_requests ENABLE ROW LEVEL SECURITY;

-- ==============================
-- 5) RLS 정책
-- ==============================
-- profiles: (필요시 정책 추가)
-- 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "users can select their profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());
-- 사용자는 자신의 프로필만 생성 가능
CREATE POLICY "users can insert their profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());
-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "users can update their profiles"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "users can view their signup_approval_requests"
  ON public.signup_approval_requests
  FOR SELECT
  USING (applicant_id = auth.uid());
CREATE POLICY "users can insert their signup_approval_requests"
  ON public.signup_approval_requests
  FOR INSERT
  WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "users can update their signup_approval_requests"
  ON public.signup_approval_requests
  FOR UPDATE
  USING (applicant_id = auth.uid());
CREATE POLICY "users can delete their signup_approval_requests"
  ON public.signup_approval_requests
  FOR DELETE
  USING (applicant_id = auth.uid());

-- signup_approval_requests: HQ 멤버는 모든 요청을 관리 가능
CREATE POLICY "hq members can manage all signup_approval_requests"
  ON public.signup_approval_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.store_members sm
      JOIN public.stores s ON s.id = sm.store_id
      WHERE sm.user_id = auth.uid()
        AND s.type = 'hq'
    )
  );

-- ==============================
-- 6) Realtime publication (supabase_realtime)
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR TABLE public.signup_approval_requests, public.profiles;
  ELSE
    -- 테이블이 등록되어 있는지 확인 후 없으면 추가
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'signup_approval_requests'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.signup_approval_requests;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
  END IF;
END$$;

-- (Supabase에서 UPDATE/DELETE 이벤트의 row data를 위해 필요)
-- ALTER TABLE public.signup_approval_requests REPLICA IDENTITY FULL;
-- ↑ UPDATE/DELETE 이벤트 발생 시, 변경 전(old) row의 전체 데이터를 Supabase Realtime payload에 포함시킴
-- (old row snapshot이 프론트엔드로 전달되어야 할 때만 활성화)
