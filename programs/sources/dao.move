// In program/sources/dao.move

/// A DAO module that combines multi-sig approval with token-based voting.
module suidao::dao {
    // 不再需要导入 suidao::errors
    // use suidao::errors;

    use sui::balance::{Self, Balance};
    use sui::vec_set::{Self, VecSet};
    use sui::event;

    // =========== Errors (移到此处) ===========
    /// The provided threshold is invalid (e.g., 0 or greater than the number of signers).
    const EInvalidThreshold: u64 = 1;
    /// The vote duration is invalid (e.g., 0).
    const EInvalidVoteDuration: u64 = 2;
    /// The provided signer address already exists in the set.
    const ESignerAlreadyExists: u64 = 3;
    /// The list of initial signers is invalid (e.g., empty or contains duplicates).
    const EInvalidSigners: u64 = 4;
    /// The authority creating the DAO is not in the list of signers.
    const EAuthNotSigner: u64 = 5;


    // =========== Events ===========
    // ... (事件结构体保持不变) ...
    public struct DaoInitialized has copy, drop {
        dao_id: ID,
        authority: address,
        treasury_balance: u64,
        threshold: u8,
        vote_duration: u64,
        quorum: u32,
        staking_yield_rate: u16,
        pass_threshold_percentage: u8,
        min_staking_amount: u64,
    }


    // =========== Objects ===========
    // ... (DaoState 结构体保持不变) ...
    public struct DaoState has key {
        id: UID,
        authority: address,
        treasury: Balance<sui::sui::SUI>,
        governance_vault: Balance<sui::sui::SUI>,
        signers: VecSet<address>,
        threshold: u8,
        vote_duration: u64,
        total_staked_amount: u64,
        quorum: u32,
        staking_yield_rate: u16,
        pass_threshold_percentage: u8,
        min_staking_amount: u64,
    }

    // =========== Public Entry Functions ===========

    /// Initializes a new DAO.
    public fun initialize_dao(
        initial_signers: vector<address>,
        threshold: u8,
        vote_duration_ms: u64,
        quorum: u32,
        staking_yield_rate: u16,
        pass_threshold_percentage: u8,
        min_staking_amount: u64,
        ctx: &mut TxContext
    ) {
        // 更新 assert! 以使用本地错误码
        assert!(threshold > 0, EInvalidThreshold);
        assert!(vote_duration_ms > 0, EInvalidVoteDuration);
        assert!(!initial_signers.is_empty(), EInvalidSigners);

        let authority = tx_context::sender(ctx);
        let mut signers = vec_set::empty<address>();

        let mut i = 0;
        while (i < initial_signers.length()) {
            let signer = *initial_signers.borrow(i);
            assert!(!vec_set::contains(&signers, &signer), ESignerAlreadyExists);
            vec_set::insert(&mut signers, signer);
            i = i + 1;
        };

        assert!(vec_set::contains(&signers, &authority), EAuthNotSigner);
        assert!((signers.length() as u8) >= threshold, EInvalidThreshold);

        let dao_state = DaoState {
            id: object::new(ctx),
            authority,
            treasury: balance::zero<sui::sui::SUI>(),
            governance_vault: balance::zero<sui::sui::SUI>(),
            signers,
            threshold,
            vote_duration: vote_duration_ms,
            total_staked_amount: 0,
            quorum,
            staking_yield_rate,
            pass_threshold_percentage,
            min_staking_amount,
        };
        event::emit(DaoInitialized {
            dao_id: object::id(&dao_state),
            authority: dao_state.authority,
            treasury_balance: dao_state.treasury.value(),
            threshold: dao_state.threshold,
            vote_duration: dao_state.vote_duration,
            quorum: dao_state.quorum,
            staking_yield_rate: dao_state.staking_yield_rate,
            pass_threshold_percentage: dao_state.pass_threshold_percentage,
            min_staking_amount: dao_state.min_staking_amount,
        });
        transfer::share_object(dao_state);
    }

    // =========== Public Getter Functions ===========
    // ... (所有 Getter 函数保持不变) ...
    /// Get the authority of the DAO
    public fun authority(dao: &DaoState): address {
        dao.authority
    }

    /// Get the threshold of the DAO
    public fun threshold(dao: &DaoState): u8 {
        dao.threshold
    }

    /// Get the vote duration of the DAO
    public fun vote_duration(dao: &DaoState): u64 {
        dao.vote_duration
    }

    /// Get the quorum of the DAO
    public fun quorum(dao: &DaoState): u32 {
        dao.quorum
    }

    /// Get the staking yield rate of the DAO
    public fun staking_yield_rate(dao: &DaoState): u16 {
        dao.staking_yield_rate
    }

    /// Get the pass threshold percentage of the DAO
    public fun pass_threshold_percentage(dao: &DaoState): u8 {
        dao.pass_threshold_percentage
    }

    /// Get the minimum staking amount of the DAO
    public fun min_staking_amount(dao: &DaoState): u64 {
        dao.min_staking_amount
    }

    /// Check if an address is a signer
    public fun is_signer(dao: &DaoState, addr: &address): bool {
        vec_set::contains(&dao.signers, addr)
    }

    /// Get the number of signers
    public fun signers_count(dao: &DaoState): u64 {
        dao.signers.length()
    }
}