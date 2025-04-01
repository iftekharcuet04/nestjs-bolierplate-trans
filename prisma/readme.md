# SLF Digital Card - Prisma Schema & Migrations

This is the SLF Digital Card project, built with NestJS and MySQL as the database, using Prisma as the ORM for database schema management and migrations. Prisma provides an intuitive API, allowing seamless interaction between the NestJS application and the MySQL database.

## Migrations Workflow

### 1. Define Your Database Schema

Modify the `prisma/schema.prisma` file to define your database models. Here's an example of a simple `User` model:

```prisma
model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
}
```

### 2. Generate a Migration

Once you've defined or updated the schema, generate a migration using Prisma:
Note: This command only for local.

```bash
npx prisma migrate dev --name <migration-name>
```

This command will:
- Create a new migration file in the `prisma/migrations/` directory.
- Apply the migration to the development database.

### 3. Apply Migrations in Staging/Production

To apply migrations in the staging or production environments, run the following command:

```bash
npx prisma migrate deploy
```

This command will execute all pending migrations on the database, ensuring your schema is up to date.

## Best Practices for Staging/Production Environments

1. **Staging Environment:**
   - Always test your migrations in a staging environment before applying them to production.
   - Ensure the staging environment mirrors your production environment as closely as possible.

2. **Production Environment:**
   - Back up your production database before applying new migrations.
   - Use the `npx prisma migrate deploy` command to safely apply migrations in production.
   - Monitor the application after migration to ensure everything is working correctly.


## Useful Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
