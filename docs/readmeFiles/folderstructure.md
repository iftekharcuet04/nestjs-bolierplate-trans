## Backend Folder Structure

This project is built with NestJS, Prisma for database interactions, and configured with Prettier and ESLint for code formatting and linting.

The project's graphql part follows the following folder structure:
</br>

```js
├── src
│   ├── modules
│   │   ├── users
│   │   │   ├── dto                  # Data Transfer Objects
│   │   │   ├── users.resolver.ts    # Users resolver
│   │   │   ├── users.module.ts      # Users module
│   │   │   ├── users.service.ts     # Users service
│   │   └── other-module             # Another feature module
│   │       ├── dto
│   │       ├── other.resolver.ts
│   │       ├── other.module.ts
│   │       ├── other.service.ts
│   ├── common                       # Common utilities and components
│   │   ├── decorators
│   │   ├── filters
│   │   ├── guards
│   │   ├── interceptors
│   │   ├── pipes
│   ├── app.resolver.ts            # Main application resolver
│   ├── app.module.ts                # Main application module
│   ├── app.service.ts               # Main application service
│   ├── main.ts                      # Entry point
├── prisma
│   ├── schema.prisma                # Prisma schema
│   ├── migrations                   # Database migrations
├── .eslintrc.js                     # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── .prettierignore                  # Files to ignore by Prettier
├── tsconfig.json                    # TypeScript configuration
├── nest-cli.json                    # Nest CLI configuration
├── package.json                     # Node dependencies and scripts
├── README.md                        # Project documentation
```

The project's rest api follows the following folder structure:
</br>

```js
├── locales
├── src
│   ├── modules
│   │   ├── users
│   │   │   ├── dto                  # Data Transfer Objects
│   │   │   ├── users.controller.ts  # Users controller
│   │   │   ├── users.module.ts      # Users module
│   │   │   ├── users.service.ts     # Users service
│   │   └── other-module             # Another feature module
│   │       ├── dto
│   │       ├── other.controller.ts
│   │       ├── other.module.ts
│   │       ├── other.service.ts
│   ├── common                       # Common utilities and components
│   │   ├── decorators
│   │   ├── filters
│   │   ├── guards
│   │   ├── interceptors
│   │   ├── pipes
│   ├── app.controller.ts            # Main application controller
│   ├── app.module.ts                # Main application module
│   ├── app.service.ts               # Main application service
│   ├── main.ts                      # Entry point
├── prisma
│   ├── schema.prisma                # Prisma schema
│   ├── migrations                   # Database migrations
├── .eslintrc.js                     # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── .prettierignore                  # Files to ignore by Prettier
├── tsconfig.json                    # TypeScript configuration
├── nest-cli.json                    # Nest CLI configuration
├── package.json                     # Node dependencies and scripts
├── README.md                        # Project documentation
```