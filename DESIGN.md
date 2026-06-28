# 🏗️ DESIGN.md — Shopping Cart Engine

> **Purpose:** This document explains the architecture, schema decisions, validation strategy, edge cases considered, and architectural trade-offs made during the development of the Shopping Cart Engine.

---

## 📐 Architecture Overview

### Layer Responsibilities

| Layer | Responsibility | Files |
|-------|---------------|-------|
| **Middleware** | Cross-cutting concerns: rate limiting, session management, input validation | `validate.middleware.ts` |
| **Routes** | Define API endpoints and map them to controllers | `cart.routes.ts`, `item.routes.ts`, `checkout.routes.ts` |
| **Controllers** | Handle HTTP requests/responses, delegate to services | `cart.controller.ts`, `item.controller.ts`, `checkout.controller.ts` |
| **Services** | Core business logic (pricing calculations) | `pricingEngine.ts` |
| **Models** | Database schema definitions and queries | `carts.model.ts`, `items.model.ts`, `user.model.ts` |
| **Config** | Centralized configuration for pricing rules and tiers | `pricing.config.ts`, `tier.config.ts` |

---

## 🗄️ Database Schema Design

### Why MongoDB?

We chose **MongoDB** (a NoSQL document database) for the following reasons:

| Reason | Explanation |
|--------|-------------|
| **Flexible Schema** | Cart items and user data can evolve without rigid migrations |
| **JSON-Native** | Seamless integration with JavaScript/TypeScript objects |
| **Nested Documents** | Cart items can be embedded within the cart document, reducing joins |
| **Horizontal Scaling** | Easy to scale if the application grows |

### Schema Diagram

<img width="1755" height="1182" alt="db_schema" src="https://github.com/user-attachments/assets/080a765f-37bc-4715-9c7e-32110311fa1f" />

### Schema Definitions

#### 1. User Collection (`user.model.ts`)

Session-based user tracking.

```typescript
interface IUser {
    _id: ObjectId;           // MongoDB auto-generated
    sessionId: string;      // Links to express-session
    createdAt: Date;         // Account creation timestamp
    lastActive: Date;        // Last activity timestamp
}
```

**Design Decisions:**
- Minimal schema — only session tracking, no PII (Personally Identifiable Information)
- `lastActive` helps with potential future cleanup of stale sessions

---

#### 2. Item Collection (`items.model.ts`)

The product catalog shared across all users.

```typescript
interface IItem {
    _id: ObjectId;              // MongoDB auto-generated
    productName: string;        // Display name
    price: number;              // Unit price in currency
    stockLeft: number;          // Available inventory
    category: ProductCategory;    // Enum: mobile, laptop, tablet, etc.
    createdAt: Date;
    updatedAt: Date;
}
```

**Design Decisions:**
- `stockLeft` is stored as a number (not boolean) to support future inventory tracking
- `category` uses a TypeScript enum for type safety at compile time
- No user association — items are global/catalog-level data

---

#### 3. Cart Collection (`carts.model.ts`)

User-specific shopping carts, identified by session.

```typescript
interface ICart {
    _id: ObjectId;
    sessionId: string;          // Links to express-session
    items: [
        {
            productId: ObjectId;  // Reference to items collection
            quantity: number;     // Items count
            priceAtAdd: number;   // Snapshot price (for price protection)
        }
    ];
    createdAt: Date;
    updatedAt: Date;
}
```

**Design Decisions:**
- **Embedded items array** instead of referencing a separate collection:
  - ✅ Faster reads (no joins needed)
  - ✅ Atomic updates to the entire cart
  - ❌ Slightly larger document size
- `priceAtAdd` stores the price at the time of adding to cart — protects users from price changes during their session
- `sessionId` links the cart to the user's express session

---

## ✅ Validation Strategy

### Why Zod?

| Alternative | Why Not Used | Why Zod Wins |
|-------------|-------------|--------------|
| Joi | Larger bundle size | Zod is zero-dependency, TypeScript-first |
| class-validator | Requires decorators & classes | Zod uses plain schemas, simpler |
| Manual validation | Error-prone, repetitive | Zod provides automatic type inference |

### Validation Flow

```
Request → Zod Schema → Validation Middleware → Controller → Service
              ↓
         Invalid? → Return 400 with structured error
```

### Schema Examples

#### Item Schema (`item.schema.ts`)

```typescript
import { z } from 'zod';

export const ProductCategoryEnum = z.enum([
    "mobile", "laptop", "tablet", "accessories",
    "wearable", "audio", "gaming", "fashion"
]);

export const addItemSchema = z.object({
    productName: z.string().min(1, "Product name is required").max(100),
    price: z.number().positive("Price must be positive"),
    stockLeft: z.number().int().nonnegative("Stock cannot be negative"),
    category: ProductCategoryEnum
});

export const addBulkItemsSchema = z.array(addItemSchema);
```

#### Cart Schema (`cart.schema.ts`)

```typescript
export const addToCartSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().int().positive("Quantity must be at least 1")
});

export const addBulkToCartSchema = z.array(addToCartSchema);

export const deleteCartItemSchema = z.object({
    productId: z.string().min(1, "Product ID is required")
});
```

### Validation Middleware (`validate.middleware.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }

        // Replace req.body with parsed & typed data
        req.body = result.data;
        next();
    };
};
```

**Benefits of this approach:**
- ✅ **Type safety** — parsed data matches the schema type exactly
- ✅ **Clear errors** — clients get field-level error messages
- ✅ **Reusable** — same middleware works for all routes
- ✅ **Early failure** — invalid requests never reach controllers

---

## ⭐ Additional Features

### 🛡️ Rate Limiting

This project implements **API rate limiting** using the `express-rate-limit` middleware to protect the application from abuse, brute-force attacks, and excessive traffic.

#### Why Rate Limiting?

Rate limiting is a critical security mechanism that controls how many requests a client can make to the server within a specific time window. It helps:

| Threat | How Rate Limiting Helps |
|--------|------------------------|
| 🚫 **DoS / DDoS Attacks** | Prevents attackers from overwhelming the server with massive request volumes |
| 🤖 **Bot Abuse & Scraping** | Blocks automated scripts from repeatedly hitting public endpoints |
| 🔓 **Brute-Force Attempts** | Limits repeated login or sensitive API calls to prevent unauthorized access |
| ⚖️ **Fair Usage** | Ensures equal resource distribution among all users |

#### How It Works

The rate limiter tracks incoming requests by **client IP address** and enforces a cap on the number of requests allowed within a sliding time window.

**Key Configuration Parameters:**

| Parameter | Description | Example Value |
|-----------|-------------|---------------|
| `windowMs` | Time window in milliseconds for counting requests | `15 * 60 * 1000` (15 minutes) |
| `max` | Maximum number of requests allowed per IP per window | `100` requests |
| `message` | Response returned when limit is exceeded | `"Too many requests, please try again later."` |
| `standardHeaders` | Enables IETF standard `RateLimit-*` headers in responses | `true` |
| `legacyHeaders` | Enables legacy `X-RateLimit-*` headers | `false` |

#### Example Implementation

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                 // limit each IP to 100 requests per window
    message: {
        status: 429,
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.'
    },
    standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
});

// Apply to all routes
app.use('/api', limiter);
```

#### Error Response (429 — Too Many Requests)

When a client exceeds the limit, the API responds with:

```json
{
    "status": 429,
    "error": "Too many requests",
    "message": "You have exceeded the rate limit. Please try again later."
}
```

> 💡 **Note:** Rate limits are applied per IP address by default. In a production environment with load balancers or proxies, you may need to configure `trust proxy` settings in Express to correctly identify client IPs.

---

### 🔐 Session Authentication

User sessions are managed securely using `express-session` with a configurable secret key stored in the `.env` file. This ensures:

- Each user gets a unique session ID stored in a cookie
- Cart data is isolated per user session
- Session secrets are never hardcoded in the source code

> ⚠️ **Always set a strong, random `SESSION_SECRET` in your `.env` file before running the application.**

---

### ✅ Input Validation

All incoming API requests are validated using **Zod** schemas before reaching the controllers. This ensures:

- Type safety at runtime
- Clear, structured error messages for invalid inputs
- Protection against malformed or malicious data

---

### 🐳 Docker Containerization

The entire application stack (API + MongoDB) is containerized with Docker Compose for a one-command setup:

```bash
docker compose up
```

No local Node.js or MongoDB installation required!

---

### 📦 Bulk Operations

Both items and cart support efficient batch processing:
- **Add items in bulk** to the product catalog
- **Add multiple items to cart** in a single request
- Reduces API round-trips and improves performance

---

### 💰 Dynamic Pricing Engine

A dedicated `pricingEngine.ts` service calculates:
- **Tier-based pricing** (configured in `tier.config.ts`)
- **Offers and discounts** (configured in `pricing.config.ts`)
- **Cart-level perks** applied automatically at checkout

---

## 🧠 Edge Cases Considered

### 1. Cart Operations

| Edge Case | Handling Strategy |
|-----------|-------------------|
| **Adding item with 0 stock** | Rejected at validation (`quantity > 0`) |
| **Adding non-existent product** | Controller checks DB, returns 404 |
| **Adding duplicate product** | Increases quantity instead of creating new entry |
| **Deleting item not in cart** | Returns 404 with clear message |
| **Cart doesn't exist for session** | Auto-creates new cart on first add |
| **Price changes after adding to cart** | `priceAtAdd` snapshot protects user from sudden price hikes |

### 2. Checkout & Pricing

| Edge Case | Handling Strategy |
|-----------|-------------------|
| **Empty cart checkout** | Returns 400 with "Cart is empty" message |
| **Item out of stock at checkout** | Checks current stock, warns user |
| **Tier calculation with no items** | Returns base tier with zero totals |
| **Negative totals due to discounts** | Floor at 0 (never negative pricing) |

### 3. Session Management

| Edge Case | Handling Strategy |
|-----------|-------------------|
| **No session secret set** | App fails fast at startup with clear error |
| **Session expired** | Creates new session, new empty cart |
| **Concurrent requests from same session** | MongoDB atomic operations prevent race conditions |

### 4. Rate Limiting

| Edge Case | Handling Strategy |
|-----------|-------------------|
| **Proxy/load balancer IP** | Configurable `trust proxy` setting in Express |
| **Burst traffic** | Sliding window prevents sudden spikes |
| **429 response** | Includes `Retry-After` header for client backoff |

---

## ⚖️ Architectural Trade-offs

### 1. Embedded vs. Referenced Cart Items

| Approach | Chosen | Pros | Cons |
|----------|--------|------|------|
| **Embedded** (Selected) | ✅ | Fast reads, atomic updates, no joins | Document size grows with items |
| **Referenced** | ❌ | Smaller documents, reusable item data | Requires joins, more complex updates |

**Rationale:** Shopping carts are typically small (< 50 items). The read performance gain outweighs the document size concern.

### 2. Session-Based vs. JWT Authentication

| Approach | Chosen | Pros | Cons |
|----------|--------|------|------|
| **Session (Selected)** | ✅ | Simple, server-side control, easy invalidation | Requires session store, not ideal for mobile |
| **JWT** | ❌ | Stateless, works across domains | Token revocation is complex |

**Rationale:** For an internship project focused on cart functionality, session-based auth is simpler and sufficient. JWT would be over-engineering for this scope.

### 3. In-Memory vs. External Rate Limit Store

| Approach | Chosen | Pros | Cons |
|----------|--------|------|------|
| **In-Memory (Selected)** | ✅ | Zero setup, fast | Doesn't scale across instances |
| **Redis Store** | ❌ | Distributed, persistent | Adds infrastructure complexity |

**Rationale:** Single-instance Docker setup makes in-memory storage sufficient. For production with multiple instances, Redis would be recommended.

### 4. Zod vs. Joi Validation

| Approach | Chosen | Pros | Cons |
|----------|--------|------|------|
| **Zod (Selected)** | ✅ | TypeScript-native, zero deps, type inference | Smaller community than Joi |
| **Joi** | ❌ | Mature, widely used | Requires `@types/joi`, larger bundle |

**Rationale:** TypeScript-first approach aligns with the project's tech stack.

### 5. Docker Compose for Local Dev

| Approach | Chosen | Pros | Cons |
|----------|--------|------|------|
| **Docker Compose (Selected)** | ✅ | One-command setup, consistent environment | Slightly slower than native Node |
| **Local MongoDB** | ❌ | Faster, native feel | Requires local MongoDB installation |

**Rationale:** Eliminates "works on my machine" issues and simplifies onboarding for evaluators.

---

## 🔐 Security Considerations

| Layer | Measure |
|-------|---------|
| **Environment Variables** | All secrets (session secret, DB credentials) stored in `.env`, never committed |
| **Input Validation** | Zod schemas sanitize and validate all incoming data |
| **Rate Limiting** | Prevents brute-force and DoS attacks |
| **Session Security** | `httpOnly` cookies, configurable secret, secure in production |
| **No SQL Injection** | Mongoose parameterized queries prevent injection attacks |
| **CORS** | Configurable for production domains |

---

## 🚀 Future Improvements

| Improvement | Description |
|-------------|-------------|
| **Redis for Sessions** | Replace in-memory sessions with Redis for scalability |
| **Redis for Rate Limiting** | Distributed rate limiting across multiple instances |
| **JWT Authentication** | Replace session auth for mobile/API clients |
| **Inventory Locking** | Reserve stock during checkout to prevent overselling |
| **Payment Integration** | Stripe/PayPal integration for real checkout |
| **Admin Dashboard** | Web UI for managing items and viewing orders |
| **Unit Tests** | Jest + Supertest for controller and service testing |
| **API Documentation** | Swagger/OpenAPI auto-generated docs |

---

## 📝 Conclusion

The Shopping Cart Engine follows a **layered architecture** with clear separation of concerns. Key design decisions prioritize:

1. **Simplicity** — Easy to understand and extend
2. **Type Safety** — Full TypeScript + Zod validation
3. **Security** — Rate limiting, session management, input validation
4. **Developer Experience** — Docker Compose for one-command setup
5. **Performance** — Embedded cart items, efficient MongoDB queries

These trade-offs were made intentionally for an internship project scope, with clear paths for scaling to production.
