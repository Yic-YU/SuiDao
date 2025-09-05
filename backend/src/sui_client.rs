use crate::models::*;
use anyhow::{anyhow, Result};
use serde_json::Value;
use sui_sdk::{rpc_types::{EventFilter, SuiEvent}, SuiClient as SdkClient, SuiClientBuilder};
use sui_types::parse_sui_struct_tag;

#[derive(Clone)]
pub struct SuiClient {
    sdk: SdkClient,
    package_id: String,
    dao_module: String,
    proposal_module: String,
}

impl SuiClient {
    pub async fn new(
        rpc_url: &str,
        package_id: String,
        dao_module: String,
        proposal_module: String,
    ) -> Result<Self> {
        let sdk = SuiClientBuilder::default().build(rpc_url).await?;
        Ok(SuiClient {
            sdk,
            package_id,
            dao_module,
            proposal_module,
        })
    }

    // 查询DAO创建事件
    pub async fn query_dao_created_events(&self, limit: u32) -> Result<Vec<DaoCreatedEvent>> {
        let ty = format!("{}::{}::DaoCreated", self.package_id, self.dao_module);
        let tag = parse_sui_struct_tag(&ty)?;
        let page = self
            .sdk
            .event_api()
            .query_events(
                EventFilter::MoveEventType(tag),
                None,
                Some(limit as usize),
                true,
            )
            .await?;

        let events = page
            .data
            .iter()
            .filter_map(|e| Self::map_dao_created(e).ok())
            .collect();

        Ok(events)
    }

    // 查询提案创建事件
    pub async fn query_proposal_created_events(&self, limit: u32) -> Result<Vec<ProposalCreatedEvent>> {
        let ty = format!("{}::{}::ProposalCreated", self.package_id, self.proposal_module);
        let tag = parse_sui_struct_tag(&ty)?;
        let page = self
            .sdk
            .event_api()
            .query_events(
                EventFilter::MoveEventType(tag),
                None,
                Some(limit as usize),
                true,
            )
            .await?;

        let events = page
            .data
            .iter()
            .filter_map(|e| Self::map_proposal_created(e).ok())
            .collect();

        Ok(events)
    }

    // 查询提案投票事件
    pub async fn query_proposal_voted_events(&self, limit: u32) -> Result<Vec<ProposalVotedEvent>> {
        let ty = format!("{}::{}::ProposalVoted", self.package_id, self.proposal_module);
        let tag = parse_sui_struct_tag(&ty)?;
        let page = self
            .sdk
            .event_api()
            .query_events(
                EventFilter::MoveEventType(tag),
                None,
                Some(limit as usize),
                true,
            )
            .await?;

        let events = page
            .data
            .iter()
            .filter_map(|e| Self::map_proposal_voted(e).ok())
            .collect();

        Ok(events)
    }

    // 查询提案批准事件
    pub async fn query_proposal_approved_events(&self, limit: u32) -> Result<Vec<ProposalApprovedEvent>> {
        let ty = format!("{}::{}::ProposalApproved", self.package_id, self.proposal_module);
        let tag = parse_sui_struct_tag(&ty)?;
        let page = self
            .sdk
            .event_api()
            .query_events(
                EventFilter::MoveEventType(tag),
                None,
                Some(limit as usize),
                true,
            )
            .await?;

        let events = page
            .data
            .iter()
            .filter_map(|e| Self::map_proposal_approved(e).ok())
            .collect();

        Ok(events)
    }

    // 解析器
    fn map_dao_created(e: &SuiEvent) -> Result<DaoCreatedEvent> {
        let parsed = e
            .parsed_json
            .as_object()
            .ok_or_else(|| anyhow!("missing parsed_json"))?;

        let dao_id = parsed
            .get("dao_id")
            .and_then(Value::as_str)
            .ok_or_else(|| anyhow!("dao_id missing"))?
            .to_string();
        let creator = parsed
            .get("creator")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_string();
        let initial_signers = parsed
            .get("initial_signers")
            .and_then(Value::as_array)
            .unwrap_or(&vec![])
            .iter()
            .filter_map(|v| v.as_str().map(|s| s.to_string()))
            .collect::<Vec<_>>();
        let threshold = parsed
            .get("threshold")
            .and_then(Value::as_i64)
            .unwrap_or(0) as i32;

        Ok(DaoCreatedEvent {
            dao_id,
            creator,
            initial_signers,
            threshold,
            created_at: chrono::Utc::now(),
        })
    }

    fn map_proposal_created(e: &SuiEvent) -> Result<ProposalCreatedEvent> {
        let parsed = e
            .parsed_json
            .as_object()
            .ok_or_else(|| anyhow!("missing parsed_json"))?;

        Ok(ProposalCreatedEvent {
            proposal_id: parsed
                .get("proposal_id")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string(),
            dao_id: parsed
                .get("dao_id")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string(),
            creator: parsed
                .get("creator")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string(),
            title: parsed
                .get("title")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string(),
            description: parsed
                .get("description")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string(),
            proposal_type: parsed
                .get("proposal_type")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string(),
            created_at: chrono::Utc::now(),
        })
    }

    fn map_proposal_voted(e: &SuiEvent) -> Result<ProposalVotedEvent> {
        let parsed = e
            .parsed_json
            .as_object()
            .ok_or_else(|| anyhow!("missing parsed_json"))?;

        Ok(ProposalVotedEvent {
            proposal_id: parsed
                .get("proposal_id")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string(),
            voter: parsed
                .get("voter")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string(),
            vote_choice: parsed
                .get("vote_choice")
                .and_then(Value::as_str)
                .unwrap_or("for")
                .to_string(),
            amount: parsed
                .get("amount")
                .and_then(Value::as_i64)
                .unwrap_or(1) as i32,
            created_at: chrono::Utc::now(),
        })
    }

    fn map_proposal_approved(e: &SuiEvent) -> Result<ProposalApprovedEvent> {
        let parsed = e
            .parsed_json
            .as_object()
            .ok_or_else(|| anyhow!("missing parsed_json"))?;

        Ok(ProposalApprovedEvent {
            proposal_id: parsed
                .get("proposal_id")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string(),
            approver: parsed
                .get("approver")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string(),
            created_at: chrono::Utc::now(),
        })
    }
}
