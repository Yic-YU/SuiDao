use crate::models::*;
use anyhow::Result;
use sqlx::{PgPool, Row};
use sqlx::postgres::PgPoolOptions;
use std::time::Duration;
use tokio::time::sleep;
use tracing::{info, warn};
use uuid::Uuid;

#[derive(Clone)]
pub struct Database {
    pub(crate) pool: PgPool,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self> {
        // 为了容忍 Postgres 刚启动未就绪，这里增加重试与更小的连接池
        let mut last_err: Option<sqlx::Error> = None;
        for attempt in 1..=30u32 {
            match PgPoolOptions::new()
                .max_connections(5)
                .acquire_timeout(Duration::from_secs(5))
                .connect(database_url)
                .await
            {
                Ok(pool) => {
                    // 运行数据库迁移
                    sqlx::migrate!("./migrations").run(&pool).await?;
                    info!("数据库连接成功");
                    return Ok(Database { pool });
                }
                Err(e) => {
                    last_err = Some(e);
                    warn!("数据库未就绪，重试 {}/30...", attempt);
                    sleep(Duration::from_secs(2)).await;
                }
            }
        }

        Err(last_err.unwrap_or_else(|| sqlx::Error::PoolTimedOut).into())
    }

    // DAO相关操作
    pub async fn get_daos(&self) -> Result<Vec<Dao>> {
        let daos = sqlx::query_as::<_, Dao>(
            "SELECT * FROM daos ORDER BY created_at DESC"
        )
        .fetch_all(&self.pool)
        .await?;
        
        Ok(daos)
    }

    pub async fn get_dao_by_id(&self, id: &str) -> Result<Option<Dao>> {
        let dao = sqlx::query_as::<_, Dao>(
            "SELECT * FROM daos WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(dao)
    }

    pub async fn create_dao(&self, dao: &Dao) -> Result<()> {
        sqlx::query(
            "INSERT INTO daos (id, name, description, symbol, member_count, proposal_count, treasury, status, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO NOTHING"
        )
        .bind(&dao.id)
        .bind(&dao.name)
        .bind(&dao.description)
        .bind(&dao.symbol)
        .bind(dao.member_count)
        .bind(dao.proposal_count)
        .bind(&dao.treasury)
        .bind(&dao.status)
        .bind(dao.created_at)
        .bind(dao.updated_at)
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }

    pub async fn update_dao(&self, id: &str, dao: &Dao) -> Result<()> {
        sqlx::query(
            "UPDATE daos SET name = $1, description = $2, symbol = $3, member_count = $4, 
             proposal_count = $5, treasury = $6, status = $7, updated_at = $8 
             WHERE id = $9"
        )
        .bind(&dao.name)
        .bind(&dao.description)
        .bind(&dao.symbol)
        .bind(dao.member_count)
        .bind(dao.proposal_count)
        .bind(&dao.treasury)
        .bind(&dao.status)
        .bind(dao.updated_at)
        .bind(id)
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }

    // 提案相关操作
    pub async fn get_proposals(&self) -> Result<Vec<Proposal>> {
        let proposals = sqlx::query_as::<_, Proposal>(
            "SELECT * FROM proposals ORDER BY created_at DESC"
        )
        .fetch_all(&self.pool)
        .await?;
        
        Ok(proposals)
    }

    pub async fn get_proposal_by_id(&self, id: &str) -> Result<Option<Proposal>> {
        let proposal = sqlx::query_as::<_, Proposal>(
            "SELECT * FROM proposals WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(proposal)
    }

    pub async fn create_proposal(&self, request: CreateProposalRequest) -> Result<CreateProposalResponse> {
        let proposal_id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now();
        
        // 将提案类型序列化为JSON
        let proposal_type_json = serde_json::to_string(&request.proposal_type)?;
        
        sqlx::query(
            "INSERT INTO proposals (id, title, description, dao_state_id, status, proposal_type, 
             votes_for, votes_against, total_votes, created_by, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)"
        )
        .bind(&proposal_id)
        .bind(&request.title)
        .bind(&request.description)
        .bind(&request.dao_state_id)
        .bind("pending")
        .bind(&proposal_type_json)
        .bind(0)
        .bind(0)
        .bind(0)
        .bind("system") // 这里应该从认证中获取
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await?;
        
        Ok(CreateProposalResponse {
            success: true,
            proposal_id: Some(proposal_id),
            tx_hash: None,
            error: None,
        })
    }

    pub async fn vote_proposal(&self, proposal_id: &str, request: VoteRequest) -> Result<VoteResponse> {
        // 这里应该调用Sui合约进行投票
        // 暂时只更新数据库
        let now = chrono::Utc::now();
        
        if request.vote_choice == "for" {
            sqlx::query(
                "UPDATE proposals SET votes_for = votes_for + 1, total_votes = total_votes + 1, updated_at = $1 WHERE id = $2"
            )
            .bind(now)
            .bind(proposal_id)
            .execute(&self.pool)
            .await?;
        } else if request.vote_choice == "against" {
            sqlx::query(
                "UPDATE proposals SET votes_against = votes_against + 1, total_votes = total_votes + 1, updated_at = $1 WHERE id = $2"
            )
            .bind(now)
            .bind(proposal_id)
            .execute(&self.pool)
            .await?;
        }
        
        Ok(VoteResponse {
            success: true,
            tx_hash: None,
            error: None,
        })
    }

    pub async fn approve_proposal(&self, proposal_id: &str, request: ApproveRequest) -> Result<ApproveResponse> {
        // 这里应该调用Sui合约进行批准
        // 暂时只更新数据库状态
        let now = chrono::Utc::now();
        
        sqlx::query(
            "UPDATE proposals SET status = 'active', updated_at = $1 WHERE id = $2"
        )
        .bind(now)
        .bind(proposal_id)
        .execute(&self.pool)
        .await?;
        
        Ok(ApproveResponse {
            success: true,
            tx_hash: None,
            error: None,
        })
    }

    // 事件处理
    pub async fn handle_dao_created_event(&self, event: &DaoCreatedEvent) -> Result<()> {
        let dao = Dao {
            id: event.dao_id.clone(),
            name: format!("DAO-{}", &event.dao_id[..8]),
            description: format!("由 {} 创建的DAO", event.creator),
            symbol: "DAO".to_string(),
            member_count: event.initial_signers.len() as i32,
            proposal_count: 0,
            treasury: "0 SUI".to_string(),
            status: "active".to_string(),
            created_at: event.created_at,
            updated_at: event.created_at,
        };
        
        self.create_dao(&dao).await?;
        Ok(())
    }

    pub async fn handle_proposal_created_event(&self, event: &ProposalCreatedEvent) -> Result<()> {
        let proposal = Proposal {
            id: event.proposal_id.clone(),
            title: event.title.clone(),
            description: event.description.clone(),
            dao_state_id: event.dao_id.clone(),
            status: "pending".to_string(),
            proposal_type: event.proposal_type.clone(),
            votes_for: 0,
            votes_against: 0,
            total_votes: 0,
            end_time: None,
            created_by: event.creator.clone(),
            created_at: event.created_at,
            updated_at: event.created_at,
        };
        
        // 插入提案
        sqlx::query(
            "INSERT INTO proposals (id, title, description, dao_state_id, status, proposal_type, 
             votes_for, votes_against, total_votes, created_by, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             ON CONFLICT (id) DO NOTHING"
        )
        .bind(&proposal.id)
        .bind(&proposal.title)
        .bind(&proposal.description)
        .bind(&proposal.dao_state_id)
        .bind(&proposal.status)
        .bind(&proposal.proposal_type)
        .bind(proposal.votes_for)
        .bind(proposal.votes_against)
        .bind(proposal.total_votes)
        .bind(&proposal.created_by)
        .bind(proposal.created_at)
        .bind(proposal.updated_at)
        .execute(&self.pool)
        .await?;
        
        // 更新DAO的提案计数
        sqlx::query(
            "UPDATE daos SET proposal_count = proposal_count + 1, updated_at = $1 WHERE id = $2"
        )
        .bind(proposal.updated_at)
        .bind(&proposal.dao_state_id)
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }

    // 根据投票事件更新投票计数
    pub async fn apply_vote_event(
        &self,
        proposal_id: &str,
        vote_choice: &str,
        amount: i32,
        ts: chrono::DateTime<chrono::Utc>,
    ) -> Result<()> {
        if vote_choice == "for" {
            sqlx::query(
                "UPDATE proposals SET votes_for = votes_for + $1, total_votes = total_votes + $1, updated_at = $2 WHERE id = $3",
            )
            .bind(amount)
            .bind(ts)
            .bind(proposal_id)
            .execute(&self.pool)
            .await?;
        } else if vote_choice == "against" {
            sqlx::query(
                "UPDATE proposals SET votes_against = votes_against + $1, total_votes = total_votes + $1, updated_at = $2 WHERE id = $3",
            )
            .bind(amount)
            .bind(ts)
            .bind(proposal_id)
            .execute(&self.pool)
            .await?;
        }
        Ok(())
    }

    // 根据批准事件更新状态
    pub async fn apply_approve_event(
        &self,
        proposal_id: &str,
        ts: chrono::DateTime<chrono::Utc>,
    ) -> Result<()> {
        sqlx::query(
            "UPDATE proposals SET status = 'active', updated_at = $1 WHERE id = $2",
        )
        .bind(ts)
        .bind(proposal_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}
