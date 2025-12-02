# 공동구매 쇼핑몰 (Coops)

공동구매를 통해 상품을 판매하는 쇼핑몰 플랫폼입니다.

## 기술 스택

- **Frontend**: SvelteKit + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Package Manager**: pnpm

## 프로젝트 설정

### 1. 의존성 설치

```sh
pnpm install
```

### 2. 데이터베이스 설정

Supabase Dashboard의 SQL Editor에서 다음 스크립트들을 순서대로 실행하세요:

1. `docs/Database Schema/Users.sql` - 사용자 및 인증
2. `docs/Database Schema/Stores.sql` - 매장 관리
3. `docs/Database Schema/Products.sql` - 상품 관리
4. `docs/Database Schema/Coops.sql` - 공동구매 관리
5. `docs/Database Schema/Orders.sql` - 주문 관리
6. `docs/Database Schema/Purchases.sql` - 발주 관리
7. `docs/Database Schema/Dashboard.sql` - **대시보드 통계 VIEW** (필수)

### 3. 환경 변수 설정

`.env` 파일을 생성하고 Supabase 설정을 추가하세요:

```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 개발

개발 서버를 시작합니다:

```sh
pnpm run dev

# 브라우저 자동 실행
pnpm run dev -- --open
```

## 빌드

프로덕션 빌드를 생성합니다:

```sh
pnpm run build
```

프로덕션 빌드를 미리보기:

```sh
pnpm run preview
```

## 프로젝트 구조

```
src/
├── lib/
│   ├── components/     # UI 컴포넌트
│   ├── database/       # DB 클라이언트 및 Repository
│   ├── services/       # 비즈니스 로직
│   ├── schemas/        # 유효성 검증 스키마
│   └── types/          # TypeScript 타입 정의
├── routes/
│   ├── (authenticated)/
│   │   ├── (consumer)/ # 소비자 페이지
│   │   ├── admin/      # 가맹점 관리자 페이지
│   │   └── hq/         # 본사 관리자 페이지
│   └── auth/           # 인증 페이지
└── docs/
    └── Database Schema/ # SQL 스크립트
```

## 주요 기능

### 가맹점 (Admin)

- 📊 **대시보드**: 매출, 주문, 발주 현황 한눈에 확인
- 🛒 **판매 상품 관리**: 공동구매 상품 등록 및 관리
- 📦 **주문 관리**: 고객 주문 확인 및 처리
- 🚚 **발주 관리**: 본사 상품 발주 신청 및 관리

### 본사 (HQ)

- 🏪 **가맹점 관리**: 매장 승인 및 관리
- 📦 **상품 관리**: 발주용 상품 등록
- 🚚 **발주 관리**: 가맹점 발주 승인 및 처리

### 소비자 (Consumer)

- 🛍️ **공동구매**: 매장별 공동구매 상품 조회 및 주문
- 📋 **주문 내역**: 나의 주문 확인 및 관리

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
