# Database Knowledge — Production City

## D1 Binding Name Convention

The canonical D1 binding name is **`DB`**. All `wrangler.toml` files must declare:

```toml
[[d1_databases]]
binding = "DB"
```

This binding name is used in:
- `wrangler d1 migrations apply DB --local`
- `wrangler d1 migrations list DB --local`
- Worker code: `env.DB` in the request handler

## Migration Generation Workflow

Always verify flags before running migration commands:

```bash
# 1. Verify available flags (Prisma versions may differ)
pnpm exec prisma migrate diff --help

# 2. Generate migration SQL
# Prisma 7.5 removed --from-local-d1. Point prisma.config.ts at the intended
# local datasource first, then use the config-backed flags for the installed CLI.
pnpm exec prisma migrate diff \
  --from-config-datasource \
  --to-schema ./prisma/schema.prisma \
  --script \
  --output ./prisma/migrations/<timestamp>_<description>/migration.sql

# 3. Apply locally
wrangler d1 migrations apply DB --local

# 4. Verify no pending migrations
wrangler d1 migrations list DB --local
```

## Rolling Back

D1 has no transactional DDL rollback. Use **forward-only compensating migrations**:

1. Never attempt to undo a migration by reverting SQL
2. Generate a new migration that reverses the schema change
3. Apply the compensating migration through the normal CI pipeline

Design migrations to be safe for compensation: avoid destructive changes (column drops, type changes) in the same migration as additive ones.

## Future PostgreSQL Migration Checklist

When migrating from D1 (SQLite) to PostgreSQL:

- [ ] Change Prisma provider in `schema.prisma` from `sqlite` to `postgresql`
- [ ] Swap `@prisma/adapter-d1` for PostgreSQL adapter
- [ ] Review all migration SQL files (TEXT datetimes -> TIMESTAMPTZ)
- [ ] Review Prisma Client instantiation in Workers (adapter/binding changes)
- [ ] Review seed scripts for SQLite-specific syntax
- [ ] Add PostgreSQL extensions (TimescaleDB, PostGIS, PGVector)
- [ ] Application data access code (Prisma Client) should NOT need changes
