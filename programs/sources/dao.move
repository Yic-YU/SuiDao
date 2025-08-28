// In sources/dao.move

/// A DAO module that combines multi-sig approval with token-based voting.
module suidao::dao {

    use sui::coin::TreasuryCap;
    use sui::balance::{Self, Balance};
    use sui::vec_set::{Self, VecSet};
    use sui::event;
    use std::string::String;
    use std::type_name;

    // =========== Errors ===========

    const EInvalidThreshold: u64 = 1;
    const EInvalidVoteDuration: u64 = 2;
    const ESignerAlreadyExists: u64 = 3;
    const EInvalidSigners: u64 = 4;
    const EAuthNotSigner: u64 = 5;

    // =========== Events ===========

    /// Emitted when the global config is created.
    public struct ConfigInitialized has copy, drop {
        config_id: ID,
        admin: address,
        developer_wallet: address,
    }

    /// Emitted when a new DAO is created.
    public struct DaoInitialized has copy, drop {
        dao_id: ID,
        authority: address,
        treasury_balance: u64,
        governance_token_type: String,
        threshold: u8,
        vote_duration: u64,
        quorum: u32,
        staking_yield_rate: u16,
        pass_threshold_percentage: u8,
        min_staking_amount: u64,
    }

    // =========== Objects ===========

    /// Global configuration for the entire package.
    public struct Config has key {
        id: UID,
        admin: address,
        developer_wallet: address,
    }

    /// The main state object for a single DAO instance.
    /// The generic type `T` represents the DAO's specific governance token.
    public struct DaoState<phantom T> has key {
        id: UID,
        authority: address,
        treasury: Balance<sui::sui::SUI>,
        governance_vault: Balance<T>,
        signers: VecSet<address>,
        threshold: u8,
        vote_duration: u64,
        total_staked_amount: u64,
        quorum: u32,
        staking_yield_rate: u16,
        pass_threshold_percentage: u8,
        min_staking_amount: u64,
    }

    // =========== Module Initializer (for Config) ===========

    /// Called once when the module is published.
    /// Initializes and shares the global `Config` object.
    fun init(ctx: &mut TxContext) {
        let admin = tx_context::sender(ctx);
        let config = Config {
            id: object::new(ctx),
            admin,
            developer_wallet: admin,
        };

        event::emit(ConfigInitialized {
            config_id: object::id(&config),
            admin: config.admin,
            developer_wallet: config.developer_wallet,
        });

        transfer::share_object(config);
    }

    // =========== Public Entry Functions ===========

    /// Initializes a new DAO.
    public fun initialize_dao<T>(
        _treasury_cap: &TreasuryCap<T>,
        initial_signers: vector<address>,
        threshold: u8,
        vote_duration_ms: u64,
        quorum: u32,
        staking_yield_rate: u16,
        pass_threshold_percentage: u8,
        min_staking_amount: u64,
        ctx: &mut TxContext
    ) {
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

        // The DAO creator (authority) does not have to be a signer by default,
        // but for many DAOs this is a good practice. We will enforce it here.
        assert!(vec_set::contains(&signers, &authority), EAuthNotSigner);
        assert!((signers.length() as u8) >= threshold, EInvalidThreshold);

        let dao_state = DaoState<T> {
            id: object::new(ctx),
            authority,
            treasury: balance::zero<sui::sui::SUI>(),
            governance_vault: balance::zero<T>(),
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
            governance_token_type: std::string::from_ascii(type_name::into_string(type_name::with_original_ids<T>())),
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

    /// Get the admin of the config
    public fun admin(config: &Config): address {
        config.admin
    }

    /// Get the developer wallet of the config
    public fun developer_wallet(config: &Config): address {
        config.developer_wallet
    }

    /// Get the authority of the DAO
    public fun authority<T>(dao: &DaoState<T>): address {
        dao.authority
    }

    /// Get the threshold of the DAO
    public fun threshold<T>(dao: &DaoState<T>): u8 {
        dao.threshold
    }

    /// Get the vote duration of the DAO
    public fun vote_duration<T>(dao: &DaoState<T>): u64 {
        dao.vote_duration
    }

    /// Get the quorum of the DAO
    public fun quorum<T>(dao: &DaoState<T>): u32 {
        dao.quorum
    }

    /// Get the staking yield rate of the DAO
    public fun staking_yield_rate<T>(dao: &DaoState<T>): u16 {
        dao.staking_yield_rate
    }

    /// Get the pass threshold percentage of the DAO
    public fun pass_threshold_percentage<T>(dao: &DaoState<T>): u8 {
        dao.pass_threshold_percentage
    }

    /// Get the minimum staking amount of the DAO
    public fun min_staking_amount<T>(dao: &DaoState<T>): u64 {
        dao.min_staking_amount
    }

    /// Check if an address is a signer
    public fun is_signer<T>(dao: &DaoState<T>, addr: &address): bool {
        vec_set::contains(&dao.signers, addr)
    }

    /// Get the number of signers
    public fun signers_count<T>(dao: &DaoState<T>): u64 {
        dao.signers.length()
    }

    // =========== Test-only Functions ===========

    #[test_only]
    /// Initialize the module for testing
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}