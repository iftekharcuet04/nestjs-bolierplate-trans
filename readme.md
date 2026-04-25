# NestJS Boilerplate

A high-throughput, modular, and strictly decoupled NestJS boilerplate designed for scalability and performance. Built with a focus on centralized message handling, internationalization (i18n), and database protection.

## 🚀 Tech Stack

- **Framework:** NestJS (Fastify)
- **Database:** MySQL / PostgreSQL (Prisma ORM)
- **Caching:** Redis (IORedis)
- **Queue:** BullMQ
- **API:** RESTful API (Strictly Decoupled)
- **Logging:** Pino (with request-id tracking)

## 🏗️ Core Architectural Features

### 1. Repository Pattern (Strictly Typed)

All database interactions are abstracted into a **strongly typed Repository layer**. This ensures business logic remains independent of the data persistence layer and facilitates easier testing and maintenance.

- **BaseRepository:** Generic CRUD operations with transaction support and flexible `select`/`include` options.

### 2. Unified Global Messaging

Every API response (Success or Error) follows a strictly defined JSON structure, ensuring consistent client-side handling:

- **GlobalExceptionFilter:** Centralized error handling for HTTP, Prisma, and generic exceptions.
- **ResponseFormatInterceptor:** Standardizes all successful responses.

### 3. High-Performance Translation (i18n)

Centralized message handling with a focus on speed:

- **Pre-loaded Locales:** Translations are loaded into memory on startup, eliminating blocking disk I/O during request cycles.
- **Regex-based Placeholders:** Optimized variable replacement in translation strings.

### 4. Database Protection (High-Performance Safeguards)

- **Global Concurrency Limiter (Semaphore):** Limits active concurrent queries (default 50) to prevent database saturation and system crashes.
- **Strict Query Limits:** Default pagination (`take: 100`) and a hard maximum cap on records fetched.
- **Circuit Breaker:** 2-second timeout threshold for all database operations.

## 📖 Standards & Documentation

For detailed coding standards, directory structures, and design principles, please refer to:

- [**PROJECT_STANDARDS.md**](../ai-rules/PROJECT_STANDARDS.md) - The source of truth for architectural rules.
- [**Install Guide**](./docs/readmeFiles/install.md) - Getting started with the environment.
- [**Folder Structure**](./docs/readmeFiles/folderstructure.md) - Module organization.

## 🛠️ Getting Started

1. **Setup Environment**: Copy `.env.example` to `.env` and configure your DATABASE_URL.
2. **Install Dependencies**: `pnpm install`
3. **Database Migration**: `npx prisma migrate dev`
4. **Start Development**: `npm run start:dev`

---

_Built with focus on performance, modularity, and database safety._
