#!/usr/bin/env bash
# post-start.sh — project-specific setup on every container start
# Runs automatically after post-create.sh completes (and on each devcontainer start).
# Idempotent: safe to run multiple times.
set -uo pipefail

WORKSPACE_DIR="${CONTAINER_WORKSPACE_FOLDER:-$(find /workspaces -mindepth 1 -maxdepth 1 -type d 2>/dev/null | head -1 || pwd)}"

echo "=== post-start: Production City ==="
cd "$WORKSPACE_DIR" || exit 1

###############################################################################
# Step runner — tracks pass/fail, never aborts
###############################################################################
declare -a STEP_RESULTS=()

run_step() {
    local name="$1"
    shift
    echo "--- [$name] ---"
    if "$@"; then
        STEP_RESULTS+=("✅ $name")
    else
        STEP_RESULTS+=("❌ $name")
        echo "⚠️  $name failed (non-fatal, continuing)"
    fi
    echo ""
}

###############################################################################
# 1. Prisma Client generation
###############################################################################
prisma_generate() {
    if [ ! -f "${WORKSPACE_DIR}/prisma/schema.prisma" ]; then
        echo "No prisma/schema.prisma found — skipping"
        return 0
    fi
    pnpm exec prisma generate
}

###############################################################################
# 2. D1 local migrations
# The binding name is read from wrangler.toml — update D1_BINDING_NAME below
# once wrangler.toml is configured for this project.
###############################################################################
d1_migrate() {
    if ! command -v wrangler &>/dev/null; then
        echo "wrangler not found — skipping D1 migrations"
        return 0
    fi

    if [ ! -f "${WORKSPACE_DIR}/prisma/schema.prisma" ]; then
        echo "No prisma schema — skipping migrations"
        return 0
    fi

    # Read the D1 binding name from wrangler.toml if possible
    local binding_name=""
    if [ -f "${WORKSPACE_DIR}/wrangler.toml" ]; then
        binding_name="$(grep -m1 'binding\s*=' "${WORKSPACE_DIR}/wrangler.toml" \
            | sed 's/.*=\s*"\?\([^"]*\)"\?.*/\1/' | tr -d ' ')"
    fi

    if [ -z "$binding_name" ]; then
        echo "D1 binding name not found in wrangler.toml — skipping migrations"
        echo "Update post-start.sh once wrangler.toml is configured"
        return 0
    fi

    echo "Applying D1 migrations (binding: $binding_name) ..."
    wrangler d1 migrations apply "$binding_name" --local
}

###############################################################################
# 3. Seed local database (idempotent)
###############################################################################
db_seed() {
    # Only seed if a seed script is configured in package.json
    if ! pnpm exec prisma --help &>/dev/null; then
        echo "prisma CLI not available — skipping seed"
        return 0
    fi

    if ! grep -q '"seed"' "${WORKSPACE_DIR}/package.json" 2>/dev/null \
        && ! grep -q '"seed"' "${WORKSPACE_DIR}/prisma/schema.prisma" 2>/dev/null; then
        echo "No seed configuration found — skipping"
        return 0
    fi

    pnpm db:seed 2>/dev/null || pnpm exec prisma db seed 2>/dev/null || true
}

###############################################################################
# Run all steps
###############################################################################
run_step "Prisma Client generation"  prisma_generate
run_step "D1 local migrations"       d1_migrate
run_step "Database seed"             db_seed

###############################################################################
# Summary
###############################################################################
echo "========================================="
echo "  post-start complete"
echo "========================================="
for result in "${STEP_RESULTS[@]}"; do
    echo "  $result"
done
echo "========================================="
