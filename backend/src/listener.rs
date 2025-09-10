use std::sync::Arc;
use anyhow::Result;
use tokio::time::{sleep, Duration};
use serde_json::Value;

use crate::types::{AppState, Dao, Proposal};

/// Continuously poll the Sui RPC for events and update shared state.
pub async fn start_event_listener(state: Arc<AppState>, rpc_url: String) -> Result<()> {
    let client = reqwest::Client::new();
    let mut cursor: Option<Value> = None;

    loop {
        let params = serde_json::json!({
            "query": { "All": [] },
            "cursor": cursor,
            "limit": 50
        });
        let body = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "suix_getEvents",
            "params": params
        });

        if let Ok(resp) = client.post(&rpc_url).json(&body).send().await {
            if let Ok(json) = resp.json::<Value>().await {
                if let Some(data) = json.get("result").and_then(|r| r.get("data")).and_then(|d| d.as_array()) {
                    for event in data {
                        if let Some(event_type) = event.get("type").and_then(|v| v.as_str()) {
                            if let Some(parsed) = event.get("parsedJson") {
                                if event_type.contains("DaoCreated") {
                                    if let Some(name) = parsed.get("name").and_then(|v| v.as_str()) {
                                        let id = parsed.get("id").and_then(|v| v.as_str()).unwrap_or_default().to_string();
                                        let dao = Dao { id, name: name.to_string() };
                                        state.daos.write().await.push(dao);
                                    }
                                } else if event_type.contains("ProposalCreated") {
                                    let id = parsed.get("id").and_then(|v| v.as_str()).unwrap_or_default().to_string();
                                    let dao_id = parsed.get("dao_id").and_then(|v| v.as_str()).unwrap_or_default().to_string();
                                    let title = parsed.get("title").and_then(|v| v.as_str()).unwrap_or_default().to_string();
                                    let description = parsed.get("description").and_then(|v| v.as_str()).unwrap_or_default().to_string();
                                    let proposal = Proposal { id, dao_id, title, description };
                                    state.proposals.write().await.push(proposal);
                                }
                            }
                        }
                    }
                }
                cursor = json.get("result").and_then(|r| r.get("nextCursor")).cloned();
            }
        }

        sleep(Duration::from_secs(5)).await;
    }
}
