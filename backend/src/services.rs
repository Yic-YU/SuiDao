use crate::models::*;
use crate::sui_client::SuiClient;
use crate::database::Database;
use anyhow::Result;
use std::time::Duration;
use tokio::time::sleep;
use tracing::{info, error};

pub async fn start_chain_monitor(state: crate::AppState) -> Result<()> {
    info!("启动链上监控服务...");
    
    loop {
        match monitor_chain_events(&state).await {
            Ok(_) => {
                info!("链上事件监控完成");
            }
            Err(e) => {
                error!("链上事件监控失败: {}", e);
            }
        }
        
        // 每30秒检查一次
        sleep(Duration::from_secs(30)).await;
    }
}

async fn monitor_chain_events(state: &crate::AppState) -> Result<()> {
    // 监控DAO创建事件
    match state.sui_client.query_dao_created_events(50).await {
        Ok(events) => {
            for event in events {
                if let Err(e) = state.database.handle_dao_created_event(&event).await {
                    error!("处理DAO创建事件失败: {}", e);
                }
            }
        }
        Err(e) => {
            error!("查询DAO创建事件失败: {}", e);
        }
    }

    // 监控提案创建事件
    match state.sui_client.query_proposal_created_events(50).await {
        Ok(events) => {
            for event in events {
                if let Err(e) = state.database.handle_proposal_created_event(&event).await {
                    error!("处理提案创建事件失败: {}", e);
                }
            }
        }
        Err(e) => {
            error!("查询提案创建事件失败: {}", e);
        }
    }

    // 监控提案投票事件
    match state.sui_client.query_proposal_voted_events(50).await {
        Ok(events) => {
            for event in events {
                if let Err(e) = handle_proposal_voted_event(&state.database, &event).await {
                    error!("处理提案投票事件失败: {}", e);
                }
            }
        }
        Err(e) => {
            error!("查询提案投票事件失败: {}", e);
        }
    }

    // 监控提案批准事件
    match state.sui_client.query_proposal_approved_events(50).await {
        Ok(events) => {
            for event in events {
                if let Err(e) = handle_proposal_approved_event(&state.database, &event).await {
                    error!("处理提案批准事件失败: {}", e);
                }
            }
        }
        Err(e) => {
            error!("查询提案批准事件失败: {}", e);
        }
    }

    Ok(())
}

async fn handle_proposal_voted_event(
    database: &Database,
    event: &ProposalVotedEvent,
) -> Result<()> {
    // 更新提案的投票数据（按事件中的amount累加）
    database
        .apply_vote_event(
            &event.proposal_id,
            &event.vote_choice,
            event.amount,
            event.created_at,
        )
        .await
        .map(|_| ())
}

async fn handle_proposal_approved_event(
    database: &Database,
    event: &ProposalApprovedEvent,
) -> Result<()> {
    // 更新提案状态为活跃
    database
        .apply_approve_event(&event.proposal_id, event.created_at)
        .await
        .map(|_| ())
}
