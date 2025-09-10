use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Dao {
    pub id: String,
    pub name: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Proposal {
    pub id: String,
    pub dao_id: String,
    pub title: String,
    pub description: String,
}

#[derive(Default)]
pub struct AppState {
    pub daos: RwLock<Vec<Dao>>,
    pub proposals: RwLock<Vec<Proposal>>,
}
