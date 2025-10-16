/**
 * Central type definitions index
 *
 * Organized by domain and purpose for better scalability:
 *
 * Entities (Business Domain Objects):
 * - user.ts: User profiles, roles, permissions, authentication states
 * - store.ts: Store information, settings, members
 * - product.ts: Product catalog, inventory, pricing
 * - order.ts: Customer orders, payments, delivery
 * - purchase.ts: Purchase orders, suppliers, inventory management
 *
 * Common (Shared Utilities):
 * - form.ts: Form data structures and validation
 * - utils.ts: Pagination, sorting, filtering, common interfaces
 *
 * API (Request/Response Types):
 * - auth.ts: Authentication API contracts
 * - product.ts: Product management API contracts
 */

// Entity types (Business Domain)
export * from './entities'

// Common utility types
export * from './common'
