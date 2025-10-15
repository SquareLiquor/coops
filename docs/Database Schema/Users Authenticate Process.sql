-- ==============================
-- 1) 회원 가입 Trigger
-- ==============================
-- 1) trigger 함수 생성
-- create or replace function public.handle_user_signup()
-- returns trigger as $$
-- begin
--   -- 가입 시 store_type, store_id가 존재하면 store_members 등록
--   if new.raw_user_meta_data->>'store_id' is not null then
--     insert into public.store_members (store_id, user_id)
--     values ((new.raw_user_meta_data->>'store_id')::uuid, new.id);
--   end if;

--   -- role/status 업데이트는 Edge Function에서 처리
--   return new;
-- end;
-- $$ language plpgsql;


-- -- 2) trigger 생성
-- drop trigger if exists trg_handle_user_signup on auth.users;

-- create trigger trg_handle_user_signup
-- after insert on auth.users
-- for each row
-- execute function public.handle_user_signup();

-- ==============================
-- 2) app_metadata 업데이트 Edge Function
-- ==============================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

Deno.serve(async (req)=>{
  try {
    const { user_id, user_type } = await req.json();
    
    let approve_status = user_type === 'consumer' ? 'approved' : 'pending';
    
    // app_metadata 업데이트
    const { data: userData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      app_metadata: {
        user_type,
        approve_status
      }
    });
    
    if (updateError) throw updateError;
    
    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500
    });
  }
});



-- ==============================
-- 3) 승인 처리 Edge Function
-- ==============================
import { serve } from "https://deno.land/x/sift/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

serve(async (req) => {
  try {
    const body = await req.json();
    const { user_id } = body;

    if (!user_id) return new Response("user_id required", { status: 400 });

    // app_metadata 업데이트
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      app_metadata: { approve_status: "approved" },
    });

    // 승인 요청 테이블 업데이트

    // store_members 테이블 업데이트

    if (error) return new Response(error.message, { status: 500 });

    return new Response("User approved", { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
});
