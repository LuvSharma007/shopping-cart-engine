
<div align="center">

# Shopping Cart Engine

<p align="center">
  <b>A shopping cart & checkout system built with Node.js, Express & MongoDB</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
</p>

</div>

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#1-environment-setup)
  - [Run with Docker](#2-run-with-docker)
  - [View Logs](#3-view-api-logs)
  - [Database Access](#4-access-database)
- [Database Schema](#-database-schema)
- [API Testing Guide](#-api-testing-guide)
  - [1. Health Check](#1-health-check)
  - [2. Add Items to Database](#2-add-items-to-database)
  - [3. Manage Cart](#3-manage-cart)
  - [4. Checkout](#4-checkout)
- [Product Categories](#-product-categories)
- [Additional Features](#-additional-features)
- [License](#-license)

---

## Features

| Feature | Description |
|---------|-------------|
| **Cart Management** | Add, remove, and manage items in your shopping cart |
| **Pricing Engine** | Dynamic pricing with tier-based offers and discounts |
| **Bulk Operations** | Add single or multiple items at once |
| **Session Auth** | Secure user sessions with express-session |
| **Input Validation** | Schema validation powered by Zod |
| **Docker Ready** | Fully containerized with Docker Compose |
| **Rate Limiting** | API protection with express-rate-limiter |
| **MongoDB** | NoSQL database for flexible data storage |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Language** | TypeScript |
| **Database** | MongoDB |
| **Validation** | Zod |
| **Authentication** | Express Session |
| **Containerization** | Docker & Docker Compose |
| **Rate Limiting** | express-rate-limiter |

---

## Project Structure

```
shopping-cart-engine/
├── docker-compose.yaml          # Docker Compose configuration
├── Dockerfile                   # Docker image definition
├── package.json                 # Dependencies & scripts
├── package-lock.json            # Locked dependency versions
├── tsconfig.json                # TypeScript configuration
├── .env.example                 # Environment variables template
├── .env                         # Your local environment variables (create this!)
├── Readme.md                    # This file
│
└── src/
    ├── app.ts                   # Express app configuration
    ├── index.ts                 # Application entry point
    │
    ├── config/
    │   ├── pricing.config.ts    # Pricing rules & configuration
    │   └── tier.config.ts       # Tier-based offer configuration
    │
    ├── controllers/
    │   ├── cart.controller.ts   # Cart business logic
    │   ├── checkout.controller.ts # Checkout & pricing logic
    │   └── item.controller.ts   # Item management logic
    │
    ├── middleware/
    │   └── validate.middleware.ts # Zod validation middleware
    │
    ├── models/
    │   ├── carts.model.ts       # Cart data model
    │   ├── items.model.ts       # Item data model
    │   └── user.model.ts        # User data model
    │
    ├── routes/
    │   ├── cart.routes.ts       # Cart API routes
    │   ├── checkout.routes.ts   # Checkout API routes
    │   └── item.routes.ts       # Item API routes
    │
    ├── schemas/
    │   ├── cart.schema.ts       # Cart validation schemas
    │   └── item.schema.ts       # Item validation schemas
    │
    ├── services/
    │   ├── items.json           # Pre-defined items data
    │   └── pricingEngine.ts     # Pricing calculation engine
    │
    └── types/
        └── express-session.d.ts # TypeScript session type extensions
```

---

## Quick Start

### Prerequisites

Make sure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- API testing tool (Postman, Insomnia, or curl)

---

### 1️⃣ Environment Setup

> ⚠️ **IMPORTANT:** This step is **mandatory** before running the project!

Create a `.env` file in the **root directory** of the project and copy the variables from `.env.example`:

```bash
# Copy the example environment file
cp .env.example .env
```

Then, **open `.env` and set your secret key** for session management:

```bash
# Example .env content
SESSION_SECRET=your_super_secret_key_here_change_this
# ... other variables
```

> **Note:** Dont forget to set your session_key in .env file

---

### 2️⃣ Run with Docker

Start all services with a single command:

```bash
docker compose up
```

This will start:
- 🌐 **API Server** on port `3000`
- 🗄️ **MongoDB** database container

---

### 3️⃣ View API Logs

Open a **new terminal** in the same project directory and run:

```bash
docker compose logs api -f
```

This will show real-time logs from the API container.

---

### 4️⃣ Access Database

To inspect the MongoDB database directly, open a **new terminal** in the same project directory and run:

```bash
docker exec -it mongodb mongosh "mongodb://username99:password99@localhost:27017/my_database?authSource=admin"
```

> **Tip:** You can verify if items were saved successfully after adding them via the API.

---

## 🗄️ Database Schema

> *Database schema diagram is available in the project folder.*

The application uses MongoDB with the following main collections:

| Collection | Purpose |
|------------|---------|
| `items` | Product catalog (shared across all users) |
| `carts` | User shopping carts |
| `users` | User basic details |
| `session` | User session data |

---

## API Testing Guide

Follow these steps **in sequence** to test the application:

---

## Product Categories

Items can belong to any of the following categories:

| Category | Description |
|----------|-------------|
| `mobile` | Mobile phones & smartphones |
| `laptop` | Laptops & notebooks |
| `tablet` | Tablets & e-readers |
| `accessories` | Mobile & laptop accessories |
| `wearable` | Smartwatches & fitness bands |
| `audio` | Headphones, earphones & speakers |
| `gaming` | Gaming consoles & accessories |
| `fashion` | Fashion & lifestyle products |

---

---

### 1. Health Check

Verify the server is running:

```http
GET /
```

**Expected Response:**
```json
{
  "message": "Server is running"
}
```

---

### 2. Add Items to Database

Items in the database are **shared across all users**. There are two ways to add items:

#### Option A: Add Single Item

```http
POST /api/v1/item/add
Content-Type: application/json
```

**Request Body:**
```json
{
    "productName": "Wired Earphone Boat",
    "price": 1000,
    "stockLeft": 100,
    "category": "audio"
}
```

#### Option B: Add Bulk Items (Recommended)

```http
POST /api/v1/item/addBulk
Content-Type: application/json
```

**Request Body:** Copy the array from `src/services/items.json` and paste it into your API testing tool.

> ✅ **After adding items, verify in the database** using the MongoDB access command above.

---

### 3. Manage Cart

#### Add Single Item to Cart

```http
POST /api/v1/cart/add
Content-Type: application/json
```

**Request Body:**
```json
{
    "productId": "<paste-item-id-here>",
    "quantity": 1
}
```

#### Add Multiple Items to Cart (Batch)

```http
POST /api/v1/cart/addBulk
Content-Type: application/json
```

**Request Body:**
```json
[
    {"productId": "<item-id-1>", "quantity": 1},
    {"productId": "<item-id-2>", "quantity": 1}
]
```

#### Delete Item from Cart

```http
DELETE /api/v1/cart/deleteItem
Content-Type: application/json
```

**Request Body:**
```json
{
    "productId": "<item-id-to-remove>"
}
```

---

### 4. Checkout

Get your cart details with tier info, offers, perks, and discounts:

```http
GET /api/v1/checkout/details
```

> ⚠️ **Prerequisite:** You must have items in your cart (Step 3) before calling this endpoint.

## Additional Features

| Feature | Implementation |
|---------|---------------|
| 🛡️ **Rate Limiting** | Protected by `express-rate-limiter` to prevent abuse |
| 🔐 **Session Security** | Secure sessions with configurable secret keys |
| ✅ **Input Validation** | All API inputs validated with Zod schemas |
| 🐳 **Containerized** | One-command setup with Docker Compose |
| 📦 **Bulk Operations** | Efficient batch processing for items and cart |
| 💰 **Dynamic Pricing** | Tier-based pricing engine with offers & discounts |
<div align="center">
</div>

