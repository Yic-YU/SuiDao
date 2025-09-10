mod types;
mod listener;

use std::sync::Arc;
use axum::{extract::State, routing::get, Json, Router};
use types::{AppState, Dao, Proposal};
use listener::start_event_listener;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let state = Arc::new(AppState::default());
    let rpc_url = std::env::var("SUI_RPC_URL").unwrap_or_else(|_| "https://fullnode.testnet.sui.io/".to_string());
    tokio::spawn(start_event_listener(state.clone(), rpc_url));

    let app = Router::new()
        .route("/daos", get(list_daos))
        .route("/proposals", get(list_proposals))
        .with_state(state);

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("Backend listening on {addr}");
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;
    Ok(())
}

async fn list_daos(State(state): State<Arc<AppState>>) -> Json<Vec<Dao>> {
    let daos = state.daos.read().await.clone();
    Json(daos)
}

async fn list_proposals(State(state): State<Arc<AppState>>) -> Json<Vec<Proposal>> {
    let proposals = state.proposals.read().await.clone();
    Json(proposals)
}
