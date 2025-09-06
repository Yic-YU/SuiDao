SuiDao Backend (Axum + Postgres)

Overview
- Axum-based REST API to expose DAO and Proposal data.
- Background task polls Sui JSON-RPC for contract events and persists them to Postgres.

Quickstart
- Requirements: Rust, Docker (for Postgres), a `DATABASE_URL` env var, and Sui fullnode RPC URL.

1) Start Postgres via Docker
From `backend/`:

docker compose up -d

2) Env
Create a `.env` (or export env vars) in `backend/` (values match Docker Compose):

DATABASE_URL=postgres://suidao:suidao@localhost:5432/suidao
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
PACKAGE_ID=0x452132cebeab22eb484ea649bf5f2145b1eb5d49a1bf5993ed6a3bfe2e741d24
DAO_MODULE=dao
PROPOSAL_MODULE=proposal
PORT=3001

3) Run
From `backend/`:

cargo run

API
- GET /health — service health.
- GET /api/daos — list DAOs.
- GET /api/daos/:id — DAO details.
- GET /api/proposals — list proposals.
- GET /api/proposals/:id — proposal details.
- POST /api/proposals — create proposal (DB stub; integrate with on-chain as needed).
- POST /api/proposals/:id/vote — vote (DB stub; integrate with on-chain as needed).
- POST /api/proposals/:id/approve — approve (DB stub; integrate with on-chain as needed).

Notes
- Migrations run automatically on startup via `sqlx::migrate!`.
- Event polling uses `suix_queryEvents` with Move event types:
  - ${PACKAGE_ID}::${DAO_MODULE}::DaoCreated
  - ${PACKAGE_ID}::${PROPOSAL_MODULE}::ProposalCreated
  - ${PACKAGE_ID}::${PROPOSAL_MODULE}::ProposalVoted
  - ${PACKAGE_ID}::${PROPOSAL_MODULE}::ProposalApproved
- Inserts are idempotent via ON CONFLICT (id) DO NOTHING to avoid duplicates.
