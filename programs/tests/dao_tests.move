#[test_only]
module suidao::dao_tests {
    use sui::test_scenario::{Self as test, Scenario, next_tx, take_shared, return_shared};
    use sui::coin::{Self, TreasuryCap};
    use sui::test_utils;
    use suidao::dao::{Self, Config, DaoState};
    
    // 测试用的代币类型
    public struct TEST_TOKEN has drop {}

    // 测试地址常量
    const ADMIN: address = @0xA;
    const SIGNER1: address = @0xB;
    const SIGNER2: address = @0xC;
    const SIGNER3: address = @0xD;
    const NON_SIGNER: address = @0xE;

    // =========== 辅助函数 ===========

    /// 创建测试代币的TreasuryCap
    fun create_test_token_cap(scenario: &mut Scenario): TreasuryCap<TEST_TOKEN> {
        let ctx = test::ctx(scenario);
        let (treasury_cap, metadata) = coin::create_currency(
            TEST_TOKEN {},
            8, // decimals
            b"TEST",
            b"Test Token",
            b"A test token for DAO testing",
            option::none(),
            ctx
        );
        
        // 转移metadata到发送者并返回treasury_cap
        transfer::public_freeze_object(metadata);
        treasury_cap
    }

    /// 创建初始签名者列表
    fun create_initial_signers(): vector<address> {
        vector[ADMIN, SIGNER1, SIGNER2, SIGNER3]
    }

    // =========== Config 初始化测试 ===========

    #[test]
    fun test_config_initialization() {
        let mut scenario = test::begin(ADMIN);
        
        // 模拟模块初始化
        {
            dao::init_for_testing(test::ctx(&mut scenario));
        };
        
        // 检查Config是否被正确创建和共享
        next_tx(&mut scenario, ADMIN);
        {
            let config = take_shared<Config>(&scenario);
            
            // 验证Config的字段
            assert!(config.admin() == ADMIN, 0);
            assert!(config.developer_wallet() == ADMIN, 1);
            
            return_shared(config);
        };
        
        test::end(scenario);
    }

    // =========== DAO 创建测试 ===========

    #[test]
    fun test_dao_creation_success() {
        let mut scenario = test::begin(ADMIN);
        
        // 创建测试代币cap
        let treasury_cap = create_test_token_cap(&mut scenario);
        
        // 初始化DAO
        next_tx(&mut scenario, ADMIN);
        {
            let initial_signers = create_initial_signers();
            dao::initialize_dao<TEST_TOKEN>(
                &treasury_cap,
                initial_signers,
                3, // threshold
                86400000, // 24小时 (毫秒)
                100, // quorum
                500, // 5% staking yield rate (basis points)
                60, // 60% pass threshold
                1000, // min staking amount
                test::ctx(&mut scenario)
            );
        };
        
        // 验证DAO是否被正确创建
        next_tx(&mut scenario, ADMIN);
        {
            let dao_state = take_shared<DaoState<TEST_TOKEN>>(&scenario);
            
            // 验证DAO状态
            assert!(dao_state.authority() == ADMIN, 0);
            assert!(dao_state.threshold() == 3, 1);
            assert!(dao_state.vote_duration() == 86400000, 2);
            assert!(dao_state.quorum() == 100, 3);
            assert!(dao_state.staking_yield_rate() == 500, 4);
            assert!(dao_state.pass_threshold_percentage() == 60, 5);
            assert!(dao_state.min_staking_amount() == 1000, 6);
            
            // 验证签名者
            assert!(dao_state.is_signer(&ADMIN), 7);
            assert!(dao_state.is_signer(&SIGNER1), 8);
            assert!(dao_state.is_signer(&SIGNER2), 9);
            assert!(dao_state.is_signer(&SIGNER3), 10);
            assert!(!dao_state.is_signer(&NON_SIGNER), 11);
            
            // 验证签名者数量
            assert!(dao_state.signers_count() == 4, 12);
            
            return_shared(dao_state);
        };
        
        // 清理
        test_utils::destroy(treasury_cap);
        test::end(scenario);
    }

    #[test]
    fun test_dao_creation_with_minimum_signers() {
        let mut scenario = test::begin(ADMIN);
        
        let treasury_cap = create_test_token_cap(&mut scenario);
        
        next_tx(&mut scenario, ADMIN);
        {
            let initial_signers = vector[ADMIN]; // 只有一个签名者
            dao::initialize_dao<TEST_TOKEN>(
                &treasury_cap,
                initial_signers,
                1, // threshold = 1
                3600000, // 1小时
                50, // quorum
                1000, // 10% staking yield rate
                51, // 51% pass threshold  
                100, // min staking amount
                test::ctx(&mut scenario)
            );
        };
        
        next_tx(&mut scenario, ADMIN);
        {
            let dao_state = take_shared<DaoState<TEST_TOKEN>>(&scenario);
            
            assert!(dao_state.authority() == ADMIN, 0);
            assert!(dao_state.threshold() == 1, 1);
            assert!(dao_state.signers_count() == 1, 2);
            assert!(dao_state.is_signer(&ADMIN), 3);
            
            return_shared(dao_state);
        };
        
        test_utils::destroy(treasury_cap);
        test::end(scenario);
    }

    // =========== 错误条件测试 ===========

    #[test]
    #[expected_failure(abort_code = dao::EInvalidThreshold)]
    fun test_dao_creation_zero_threshold() {
        let mut scenario = test::begin(ADMIN);
        
        let treasury_cap = create_test_token_cap(&mut scenario);
        
        next_tx(&mut scenario, ADMIN);
        {
            let initial_signers = create_initial_signers();
            dao::initialize_dao<TEST_TOKEN>(
                &treasury_cap,
                initial_signers,
                0, // 无效的threshold = 0
                86400000,
                100,
                500,
                60,
                1000,
                test::ctx(&mut scenario)
            );
        };
        
        test_utils::destroy(treasury_cap);
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = dao::EInvalidVoteDuration)]
    fun test_dao_creation_zero_vote_duration() {
        let mut scenario = test::begin(ADMIN);
        
        let treasury_cap = create_test_token_cap(&mut scenario);
        
        next_tx(&mut scenario, ADMIN);
        {
            let initial_signers = create_initial_signers();
            dao::initialize_dao<TEST_TOKEN>(
                &treasury_cap,
                initial_signers,
                3,
                0, // 无效的投票持续时间 = 0
                100,
                500,
                60,
                1000,
                test::ctx(&mut scenario)
            );
        };
        
        test_utils::destroy(treasury_cap);
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = dao::EInvalidSigners)]
    fun test_dao_creation_empty_signers() {
        let mut scenario = test::begin(ADMIN);
        
        let treasury_cap = create_test_token_cap(&mut scenario);
        
        next_tx(&mut scenario, ADMIN);
        {
            let initial_signers = vector::empty<address>(); // 空的签名者列表
            dao::initialize_dao<TEST_TOKEN>(
                &treasury_cap,
                initial_signers,
                3,
                86400000,
                100,
                500,
                60,
                1000,
                test::ctx(&mut scenario)
            );
        };
        
        test_utils::destroy(treasury_cap);
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = dao::ESignerAlreadyExists)]
    fun test_dao_creation_duplicate_signers() {
        let mut scenario = test::begin(ADMIN);
        
        let treasury_cap = create_test_token_cap(&mut scenario);
        
        next_tx(&mut scenario, ADMIN);
        {
            let initial_signers = vector[ADMIN, SIGNER1, ADMIN]; // 重复的签名者
            dao::initialize_dao<TEST_TOKEN>(
                &treasury_cap,
                initial_signers,
                2,
                86400000,
                100,
                500,
                60,
                1000,
                test::ctx(&mut scenario)
            );
        };
        
        test_utils::destroy(treasury_cap);
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = dao::EAuthNotSigner)]
    fun test_dao_creation_authority_not_signer() {
        let mut scenario = test::begin(ADMIN);
        
        let treasury_cap = create_test_token_cap(&mut scenario);
        
        next_tx(&mut scenario, ADMIN);
        {
            let initial_signers = vector[SIGNER1, SIGNER2, SIGNER3]; // ADMIN不在签名者列表中
            dao::initialize_dao<TEST_TOKEN>(
                &treasury_cap,
                initial_signers,
                2,
                86400000,
                100,
                500,
                60,
                1000,
                test::ctx(&mut scenario)
            );
        };
        
        test_utils::destroy(treasury_cap);
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = dao::EInvalidThreshold)]
    fun test_dao_creation_threshold_too_high() {
        let mut scenario = test::begin(ADMIN);
        
        let treasury_cap = create_test_token_cap(&mut scenario);
        
        next_tx(&mut scenario, ADMIN);
        {
            let initial_signers = vector[ADMIN, SIGNER1]; // 只有2个签名者
            dao::initialize_dao<TEST_TOKEN>(
                &treasury_cap,
                initial_signers,
                3, // threshold > 签名者数量
                86400000,
                100,
                500,
                60,
                1000,
                test::ctx(&mut scenario)
            );
        };
        
        test_utils::destroy(treasury_cap);
        test::end(scenario);
    }

    // =========== 边界条件测试 ===========

    #[test]
    fun test_dao_creation_max_parameters() {
        let mut scenario = test::begin(ADMIN);
        
        let treasury_cap = create_test_token_cap(&mut scenario);
        
        next_tx(&mut scenario, ADMIN);
        {
            let initial_signers = create_initial_signers();
            dao::initialize_dao<TEST_TOKEN>(
                &treasury_cap,
                initial_signers,
                255, // 最大threshold
                18446744073709551615, // 最大u64值
                4294967295, // 最大u32值
                65535, // 最大u16值
                100, // 100% pass threshold
                18446744073709551615, // 最大u64值
                test::ctx(&mut scenario)
            );
        };
        
        next_tx(&mut scenario, ADMIN);
        {
            let dao_state = take_shared<DaoState<TEST_TOKEN>>(&scenario);
            
            assert!(dao_state.threshold() == 255, 0);
            assert!(dao_state.staking_yield_rate() == 65535, 1);
            assert!(dao_state.pass_threshold_percentage() == 100, 2);
            
            return_shared(dao_state);
        };
        
        test_utils::destroy(treasury_cap);
        test::end(scenario);
    }

    #[test]
    fun test_dao_creation_with_many_signers() {
        let mut scenario = test::begin(ADMIN);
        
        let treasury_cap = create_test_token_cap(&mut scenario);
        
        next_tx(&mut scenario, ADMIN);
        {
            // 创建包含10个签名者的列表
            let mut initial_signers = vector::empty<address>();
            vector::push_back(&mut initial_signers, ADMIN);
            vector::push_back(&mut initial_signers, @0x1);
            vector::push_back(&mut initial_signers, @0x2);
            vector::push_back(&mut initial_signers, @0x3);
            vector::push_back(&mut initial_signers, @0x4);
            vector::push_back(&mut initial_signers, @0x5);
            vector::push_back(&mut initial_signers, @0x6);
            vector::push_back(&mut initial_signers, @0x7);
            vector::push_back(&mut initial_signers, @0x8);
            vector::push_back(&mut initial_signers, @0x9);
            
            dao::initialize_dao<TEST_TOKEN>(
                &treasury_cap,
                initial_signers,
                7, // 70% threshold
                86400000,
                100,
                500,
                60,
                1000,
                test::ctx(&mut scenario)
            );
        };
        
        next_tx(&mut scenario, ADMIN);
        {
            let dao_state = take_shared<DaoState<TEST_TOKEN>>(&scenario);
            
            assert!(dao_state.signers_count() == 10, 0);
            assert!(dao_state.threshold() == 7, 1);
            
            return_shared(dao_state);
        };
        
        test_utils::destroy(treasury_cap);
        test::end(scenario);
    }
}
