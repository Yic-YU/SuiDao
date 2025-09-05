use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing::{info, Level};
use tracing_subscriber;

mod config;
mod database;
mod models;
mod services;
mod sui_client;

use config::Config;
use database::Database;
use models::*;
use services::*;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // 初始化日志
    tracing_subscriber::fmt()
        .with_max_level(Level::INFO)
        .init();

    info!("启动SuiDao后端服务...");

    // 加载配置
    let config = Config::load()?;
    info!("配置加载完成");

    // 初始化数据库
    let database = Database::new(&config.database_url).await?;
    info!("数据库连接成功");

    // 初始化Sui客户端（使用配置中的包和模块名）
    let sui_client = sui_client::SuiClient::new(
        &config.sui_rpc_url,
        config.package_id.clone(),
        config.dao_module.clone(),
        config.proposal_module.clone(),
    ).await?;
    info!("Sui客户端初始化完成");

    // 创建应用状态
    let app_state = AppState {
        database,
        sui_client,
        config,
    };

    // 启动链上监控服务
    let monitor_state = app_state.clone();
    tokio::spawn(async move {
        if let Err(e) = start_chain_monitor(monitor_state).await {
            tracing::error!("链上监控服务启动失败: {}", e);
        }
    });

    // 准备监听地址（避免所有权移动后再访问 app_state）
    let port = app_state.config.port;
    let addr = format!("0.0.0.0:{}", port);

    // 创建路由
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/daos", get(get_daos))
        .route("/api/daos/:id", get(get_dao_by_id))
        .route("/api/proposals", get(get_proposals))
        .route("/api/proposals/:id", get(get_proposal_by_id))
        .route("/api/proposals", post(create_proposal))
        .route("/api/proposals/:id/vote", post(vote_proposal))
        .route("/api/proposals/:id/approve", post(approve_proposal))
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(app_state);

    // 启动服务器
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    info!("服务器启动在 http://{}", addr);
    
    axum::serve(listener, app).await?;

    Ok(())
}

// 应用状态
#[derive(Clone)]
pub struct AppState {
    pub database: Database,
    pub sui_client: sui_client::SuiClient,
    pub config: Config,
}

// 健康检查
async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "message": "SuiDao后端服务运行正常"
    }))
}

// 获取DAO列表
async fn get_daos(State(state): State<AppState>) -> Result<Json<Vec<Dao>>, StatusCode> {
    match state.database.get_daos().await {
        Ok(daos) => Ok(Json(daos)),
        Err(e) => {
            tracing::error!("获取DAO列表失败: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 获取单个DAO
async fn get_dao_by_id(
    State(state): State<AppState>,
    axum::extract::Path(id): axum::extract::Path<String>,
) -> Result<Json<Option<Dao>>, StatusCode> {
    match state.database.get_dao_by_id(&id).await {
        Ok(dao) => Ok(Json(dao)),
        Err(e) => {
            tracing::error!("获取DAO详情失败: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 获取提案列表
async fn get_proposals(State(state): State<AppState>) -> Result<Json<Vec<Proposal>>, StatusCode> {
    match state.database.get_proposals().await {
        Ok(proposals) => Ok(Json(proposals)),
        Err(e) => {
            tracing::error!("获取提案列表失败: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 获取单个提案
async fn get_proposal_by_id(
    State(state): State<AppState>,
    axum::extract::Path(id): axum::extract::Path<String>,
) -> Result<Json<Option<Proposal>>, StatusCode> {
    match state.database.get_proposal_by_id(&id).await {
        Ok(proposal) => Ok(Json(proposal)),
        Err(e) => {
            tracing::error!("获取提案详情失败: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 创建提案
async fn create_proposal(
    State(state): State<AppState>,
    Json(payload): Json<CreateProposalRequest>,
) -> Result<Json<CreateProposalResponse>, StatusCode> {
    match state.database.create_proposal(payload).await {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            tracing::error!("创建提案失败: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 投票提案
async fn vote_proposal(
    State(state): State<AppState>,
    axum::extract::Path(id): axum::extract::Path<String>,
    Json(payload): Json<VoteRequest>,
) -> Result<Json<VoteResponse>, StatusCode> {
    match state.database.vote_proposal(&id, payload).await {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            tracing::error!("投票失败: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 批准提案
async fn approve_proposal(
    State(state): State<AppState>,
    axum::extract::Path(id): axum::extract::Path<String>,
    Json(payload): Json<ApproveRequest>,
) -> Result<Json<ApproveResponse>, StatusCode> {
    match state.database.approve_proposal(&id, payload).await {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            tracing::error!("批准提案失败: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
