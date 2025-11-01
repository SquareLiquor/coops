-- 조회: 모든 사용자 가능, products 버킷만
create policy "Allow all selects on products bucket"
on storage.objects
for select
using (bucket_id = 'products');

-- 삽입: 로그인한 사용자만, products 버킷만
create policy "Allow inserts for authenticated users on products"
on storage.objects
for insert
with check (bucket_id = 'products' AND auth.uid() = owner);

-- 업데이트: 로그인한 사용자만 자신의 row, products 버킷만
create policy "Allow updates for owners on products"
on storage.objects
for update
using (bucket_id = 'products' AND auth.uid() = owner);

-- 삭제: 로그인한 사용자만 자신의 row, products 버킷만
create policy "Allow deletes for owners on products"
on storage.objects
for delete
using (bucket_id = 'products' AND auth.uid() = owner);
