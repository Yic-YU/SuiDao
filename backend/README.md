# SuiDao Backend

Rust backend service that polls Sui RPC for contract events and exposes DAO and proposal lists for the frontend.

## Running

```bash
cd backend
cargo run
```

The service listens on `0.0.0.0:3000` by default. Set the `SUI_RPC_URL` environment variable to configure the RPC endpoint.
