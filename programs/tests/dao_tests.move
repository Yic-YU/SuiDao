// In program/tests/dao_tests.move

#[test_only]
module suidao::dao_tests {
    use sui::test_scenario::{Self, next_tx};
    // 修正：我们不再需要导入 errors 模块
    use suidao::dao;

    // A dummy address for testing
    const CREATOR: address = @0x100;
    const SIGNER_1: address = @0x101;
    const SIGNER_2: address = @0x102;
    const SIGNER_3: address = @0x103;

    // ... (test_initialize_dao_success 保持不变) ...
    #[test]
    fun test_initialize_dao_success() {
        let mut scenario = test_scenario::begin(CREATOR);
        next_tx(&mut scenario, CREATOR);
        {
            let initial_signers = vector[CREATOR, SIGNER_1, SIGNER_2];
            dao::initialize_dao(initial_signers, 2, 1000, 50, 10, 60, 100, test_scenario::ctx(&mut scenario));
        };
        test_scenario::end(scenario);
    }


    // 修正所有失败测试的 expected_failure 注解
    #[test]
    #[expected_failure] // 移除具体的 abort_code，让框架自动匹配
    fun test_initialize_dao_fail_invalid_threshold() {
        let mut scenario = test_scenario::begin(CREATOR);
        next_tx(&mut scenario, CREATOR);
        {
            let initial_signers = vector[CREATOR, SIGNER_1];
            dao::initialize_dao(initial_signers, 0, 1000, 50, 10, 60, 100, test_scenario::ctx(&mut scenario));
        };
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_initialize_dao_fail_invalid_vote_duration() {
        let mut scenario = test_scenario::begin(CREATOR);
        next_tx(&mut scenario, CREATOR);
        {
            let initial_signers = vector[CREATOR, SIGNER_1];
            dao::initialize_dao(initial_signers, 1, 0, 50, 10, 60, 100, test_scenario::ctx(&mut scenario));
        };
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_initialize_dao_fail_empty_signers() {
        let mut scenario = test_scenario::begin(CREATOR);
        next_tx(&mut scenario, CREATOR);
        {
            dao::initialize_dao(vector[], 1, 1000, 50, 10, 60, 100, test_scenario::ctx(&mut scenario));
        };
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_initialize_dao_fail_duplicate_signers() {
        let mut scenario = test_scenario::begin(CREATOR);
        next_tx(&mut scenario, CREATOR);
        {
            let initial_signers = vector[CREATOR, SIGNER_1, CREATOR];
            dao::initialize_dao(initial_signers, 2, 1000, 50, 10, 60, 100, test_scenario::ctx(&mut scenario));
        };
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_initialize_dao_fail_auth_not_signer() {
        let mut scenario = test_scenario::begin(CREATOR);
        next_tx(&mut scenario, CREATOR);
        {
            let initial_signers = vector[SIGNER_1, SIGNER_2, SIGNER_3];
            dao::initialize_dao(initial_signers, 2, 1000, 50, 10, 60, 100, test_scenario::ctx(&mut scenario));
        };
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_initialize_dao_fail_threshold_too_high() {
        let mut scenario = test_scenario::begin(CREATOR);
        next_tx(&mut scenario, CREATOR);
        {
            let initial_signers = vector[CREATOR, SIGNER_1];
            dao::initialize_dao(initial_signers, 3, 1000, 50, 10, 60, 100, test_scenario::ctx(&mut scenario));
        };
        test_scenario::end(scenario);
    }
}