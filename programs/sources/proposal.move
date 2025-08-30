#[allow(unused_field)]
module suidao::proposal {
    use std::string::String;

    use sui::vec_set;
    use sui::clock;
    use suidao::dao;

    // --- ProposalType Variants ---
    // The following structs correspond to the variants of the `ProposalType` enum in the Anchor model.

    /// Data for proposals that update the DAO's configuration.
    /// Corresponds to the inner `DaoUpdateAction` within `ProposalType::UpdateDao`.
    /// Each action is a separate struct for type safety.
    public struct UpdateThresholdAction has copy, store, drop { new_threshold: u8 }
    public struct UpdateVoteDurationAction has copy, store, drop { new_vote_duration_ms: u64 }
    public struct UpdateQuorumAction has copy, store, drop { new_quorum: u32 }
    public struct UpdateStakingYieldAction has copy, store, drop { new_staking_yield_rate: u16 }
    public struct UpdatePassThresholdAction has copy, store, drop { new_pass_threshold_percentage: u8 }
    public struct UpdateMinStakingAction has copy, store, drop { new_min_staking_amount: u64 }

    /// A wrapper for different DAO update actions.
    /// In a valid instance, exactly one field should be `Some`.
    public struct DaoUpdateAction has store, drop {
        update_threshold: option::Option<UpdateThresholdAction>,
        update_vote_duration: option::Option<UpdateVoteDurationAction>,
        update_quorum: option::Option<UpdateQuorumAction>,
        update_staking_yield: option::Option<UpdateStakingYieldAction>,
        update_pass_threshold: option::Option<UpdatePassThresholdAction>,
        update_min_staking: option::Option<UpdateMinStakingAction>,
    }

    /// Data for a proposal to update the DAO.
    /// Corresponds to `ProposalType::UpdateDao`.
    public struct UpdateDao has store, drop {
        action: DaoUpdateAction,
    }

    /// Data for a proposal to withdraw funds from the treasury.
    /// Corresponds to `ProposalType::WithdrawTreasury`.
    public struct WithdrawTreasury has copy, store, drop {
        amount: u64,
        recipient: address,
    }

    /// This struct acts as a Move equivalent of the Rust `ProposalType` enum.
    /// It uses `Option` to hold one of the possible proposal variants.
    /// In any valid `ProposalType` instance, exactly one of the fields should be `Some`.
    public struct ProposalType has store, drop {
        update_dao: option::Option<UpdateDao>,
        withdraw_treasury: option::Option<WithdrawTreasury>,
    }


    // --- Proposal Object ---

    /// Represents a governance proposal for the DAO.
    /// This is a Sui Object, equivalent to the `Proposal` account in the Anchor model.
    public struct Proposal has key {
        id: object::UID,
        /// The ID of the `DaoState` object this proposal belongs to.
        dao_state_id: object::ID,
        /// The address of the proposer (must be a DAO signer).
        proposer: address,
        /// A unique, auto-incrementing ID for the proposal within its DAO.
        proposal_id: u64,
        /// The actual content and action of the proposal.
        proposal_type: ProposalType,
        /// A set of signer addresses that have approved the proposal (for multi-sig stage).
        approvals: vec_set::VecSet<address>,
        /// The title of the proposal.
        title: String,
        /// A detailed description of the proposal.
        description: String,
        /// The total number of stake-weighted "yes" votes.
        yes_votes: u64,
        /// The total number of stake-weighted "no" votes.
        no_votes: u64,
        /// The number of unique voters who have participated.
        voter_count: u32,
        /// The timestamp (in milliseconds) when the voting period ends.
        end_time: u64,
        /// A flag indicating whether the proposal has been executed.
        executed: bool,
        /// The timestamp (in milliseconds) when the proposal was created.
        created_at: u64,
        /// The timestamp (in milliseconds) when the multi-sig approval threshold was met.
        approved_at: option::Option<u64>,
    }

    // =========== Errors ===========

    /// The proposer is not a registered signer in the DAO.
    const EPROPOSER_NOT_SIGNER: u64 = 101;
    /// The address trying to approve the proposal is not a registered signer.
    const EAPPROVER_NOT_SIGNER: u64 = 102;
    /// The proposal has already met its approval threshold and is in the voting phase.
    const EPROPOSAL_VOTING_STARTED: u64 = 103;
    /// The signer has already approved this proposal.
    const EALREADY_APPROVED: u64 = 104;


    // =========== Public Functions ===========

    /// Creates a new proposal for the DAO.
    /// Only a registered signer of the DAO can create a proposal.
    public fun create_proposal(
        dao_state: &mut dao::DaoState,
        title: String,
        description: String,
        proposal_type: ProposalType,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext,
    ) {
        let proposer = tx_context::sender(ctx);
        assert!(dao::is_signer(dao_state, &proposer), EPROPOSER_NOT_SIGNER);

        let mut approvals = vec_set::empty<address>();
        vec_set::insert(&mut approvals, proposer);

        // Assign the next available proposal ID by calling the DAO's helper function.
        let proposal_id = dao::next_proposal_id(dao_state);

        let proposal = Proposal {
            id: object::new(ctx),
            dao_state_id: object::id(dao_state),
            proposer,
            proposal_id,
            proposal_type,
            approvals,
            title,
            description,
            yes_votes: 0,
            no_votes: 0,
            voter_count: 0,
            end_time: 0, // Will be set upon multi-sig approval
            executed: false,
            created_at: clock::timestamp_ms(clock),
            approved_at: option::none(),
        };

        transfer::share_object(proposal);
    }

    /// Allows a signer to approve a proposal during the multi-sig phase.
    /// If the approval threshold is met, the proposal moves to the community voting phase.
    public fun approve_proposal(
        proposal: &mut Proposal,
        dao_state: &dao::DaoState,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let approver = tx_context::sender(ctx);

        // 1. Check permissions and proposal state.
        assert!(dao::is_signer(dao_state, &approver), EAPPROVER_NOT_SIGNER);
        assert!(option::is_none(&proposal.approved_at), EPROPOSAL_VOTING_STARTED);
        assert!(!vec_set::contains(&proposal.approvals, &approver), EALREADY_APPROVED);

        // 2. Add the approver to the set.
        vec_set::insert(&mut proposal.approvals, approver);

        // 3. Check if the multi-sig threshold has been met.
        if (vec_set::length(&proposal.approvals) >= (dao::threshold(dao_state) as u64)) {
            let now = clock::timestamp_ms(clock);
            proposal.approved_at = option::some(now);
            proposal.end_time = now + dao::vote_duration(dao_state);
        }
    }
    
    // =========== Public Getter Functions ===========

    /// Get the proposer address of the proposal
    public fun proposer(proposal: &Proposal): address {
        proposal.proposer
    }

    /// Get the proposal ID
    public fun proposal_id(proposal: &Proposal): u64 {
        proposal.proposal_id
    }

    /// Get the approvals count
    public fun approvals_count(proposal: &Proposal): u64 {
        proposal.approvals.length()
    }

    /// Check if an address has approved the proposal
    public fun has_approved(proposal: &Proposal, addr: &address): bool {
        proposal.approvals.contains(addr)
    }

    /// Get the approved_at timestamp
    public fun approved_at(proposal: &Proposal): &option::Option<u64> {
        &proposal.approved_at
    }

    /// Get the end_time timestamp
    public fun end_time(proposal: &Proposal): u64 {
        proposal.end_time
    }

    /// Check if the proposal is approved (has passed multi-sig stage)
    public fun is_approved(proposal: &Proposal): bool {
        option::is_some(&proposal.approved_at)
    }

    /// Get the creation time of the proposal
    public fun created_at(proposal: &Proposal): u64 {
        proposal.created_at
    }

    /// Get the title of the proposal
    public fun title(proposal: &Proposal): &String {
        &proposal.title
    }

    /// Get the description of the proposal
    public fun description(proposal: &Proposal): &String {
        &proposal.description
    }

    /// Get the proposal type
    public fun proposal_type(proposal: &Proposal): &ProposalType {
        &proposal.proposal_type
    }

    /// Get the DAO state ID this proposal belongs to
    public fun dao_state_id(proposal: &Proposal): object::ID {
        proposal.dao_state_id
    }

    /// Get the yes votes count
    public fun yes_votes(proposal: &Proposal): u64 {
        proposal.yes_votes
    }

    /// Get the no votes count
    public fun no_votes(proposal: &Proposal): u64 {
        proposal.no_votes
    }

    /// Get the voter count
    public fun voter_count(proposal: &Proposal): u32 {
        proposal.voter_count
    }

    /// Check if the proposal has been executed
    public fun is_executed(proposal: &Proposal): bool {
        proposal.executed
    }

    // =========== Public Constructor Functions ===========

    /// Create a new ProposalType for testing purposes
    public fun create_test_proposal_type(): ProposalType {
        ProposalType {
            update_dao: option::some(UpdateDao {
                action: DaoUpdateAction {
                    update_threshold: option::none(),
                    update_vote_duration: option::none(),
                    update_quorum: option::none(),
                    update_staking_yield: option::none(),
                    update_pass_threshold: option::none(),
                    update_min_staking: option::none(),
                }
            }),
            withdraw_treasury: option::none(),
        }
    }

}
