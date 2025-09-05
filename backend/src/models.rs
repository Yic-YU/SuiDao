use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Dao {
    pub id: String,
    pub name: String,
    pub description: String,
    pub symbol: String,
    pub member_count: i32,
    pub proposal_count: i32,
    pub treasury: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Proposal {
    pub id: String,
    pub title: String,
    pub description: String,
    pub dao_state_id: String,
    pub status: String,
    pub proposal_type: String,
    pub votes_for: i32,
    pub votes_against: i32,
    pub total_votes: i32,
    pub end_time: Option<DateTime<Utc>>,
    pub created_by: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProposalRequest {
    pub dao_state_id: String,
    pub title: String,
    pub description: String,
    pub proposal_type: ProposalType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProposalResponse {
    pub success: bool,
    pub proposal_id: Option<String>,
    pub tx_hash: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoteRequest {
    pub voter_address: String,
    pub vote_choice: String, // "for" or "against"
    pub amount: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoteResponse {
    pub success: bool,
    pub tx_hash: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApproveRequest {
    pub approver_address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApproveResponse {
    pub success: bool,
    pub tx_hash: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProposalType {
    pub update_dao: Option<UpdateDaoAction>,
    pub withdraw_treasury: Option<WithdrawTreasuryAction>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateDaoAction {
    pub action: DaoUpdateAction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DaoUpdateAction {
    pub update_threshold: Option<ThresholdUpdate>,
    pub update_vote_duration: Option<VoteDurationUpdate>,
    pub update_quorum: Option<QuorumUpdate>,
    pub update_staking_yield: Option<StakingYieldUpdate>,
    pub update_pass_threshold: Option<PassThresholdUpdate>,
    pub update_min_staking: Option<MinStakingUpdate>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThresholdUpdate {
    pub new_threshold: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoteDurationUpdate {
    pub new_vote_duration_ms: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuorumUpdate {
    pub new_quorum: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StakingYieldUpdate {
    pub new_staking_yield_rate: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PassThresholdUpdate {
    pub new_pass_threshold_percentage: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MinStakingUpdate {
    pub new_min_staking_amount: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WithdrawTreasuryAction {
    pub amount: i64,
    pub recipient: String,
}

// 链上事件结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DaoCreatedEvent {
    pub dao_id: String,
    pub creator: String,
    pub initial_signers: Vec<String>,
    pub threshold: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProposalCreatedEvent {
    pub proposal_id: String,
    pub dao_id: String,
    pub creator: String,
    pub title: String,
    pub description: String,
    pub proposal_type: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProposalVotedEvent {
    pub proposal_id: String,
    pub voter: String,
    pub vote_choice: String,
    pub amount: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProposalApprovedEvent {
    pub proposal_id: String,
    pub approver: String,
    pub created_at: DateTime<Utc>,
}
