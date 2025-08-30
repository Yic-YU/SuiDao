#[test_only]
module suidao::dao_test {
    use sui::test_scenario::{Self as ts, next_tx};
    use sui::clock::{Self as clock};
    use suidao::dao;
    use suidao::proposal;

    const ADMIN: address = @0xA;
    const USER_1: address = @0xB;
    const USER_2: address = @0xC;
    const NON_SIGNER: address = @0xE;

    // --- DAO Initialization Tests (All Pass) ---

    #[test]
    fun test_initialize_dao_success() {
        let mut scenario = ts::begin(ADMIN);
        let signers = vector[ADMIN, USER_1, USER_2];
        next_tx(&mut scenario, ADMIN);
        dao::initialize_dao(signers, 2, 86400000, 50, 5, 51, 100, ts::ctx(&mut scenario));
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = dao::EInvalidThreshold)]
    fun test_initialize_dao_zero_threshold() {
        let mut scenario = ts::begin(ADMIN);
        let signers = vector[ADMIN, USER_1, USER_2];
        next_tx(&mut scenario, ADMIN);
        dao::initialize_dao(signers, 0, 86400000, 50, 5, 51, 100, ts::ctx(&mut scenario));
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = dao::EInvalidVoteDuration)]
    fun test_initialize_dao_zero_duration() {
        let mut scenario = ts::begin(ADMIN);
        let signers = vector[ADMIN, USER_1, USER_2];
        next_tx(&mut scenario, ADMIN);
        dao::initialize_dao(signers, 2, 0, 50, 5, 51, 100, ts::ctx(&mut scenario));
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = dao::EInvalidSigners)]
    fun test_initialize_dao_empty_signers() {
        let mut scenario = ts::begin(ADMIN);
        let signers = vector[];
        next_tx(&mut scenario, ADMIN);
        dao::initialize_dao(signers, 1, 86400000, 50, 5, 51, 100, ts::ctx(&mut scenario));
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = dao::EAuthNotSigner)]
    fun test_initialize_dao_auth_not_signer() {
        let mut scenario = ts::begin(USER_1);
        let signers = vector[ADMIN, USER_2];
        next_tx(&mut scenario, USER_1);
        dao::initialize_dao(signers, 2, 86400000, 50, 5, 51, 100, ts::ctx(&mut scenario));
        ts::end(scenario);
    }

    // --- Proposal Creation Tests (Corrected) ---

    #[test]
    fun test_create_proposal_success() {
        let mut scenario = ts::begin(ADMIN);
        let signers = vector[ADMIN, USER_1, USER_2];
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Tx 1: Initialize DAO. DaoState is implicitly passed to the next tx.
        next_tx(&mut scenario, ADMIN);
        dao::initialize_dao(signers, 2, 86400000, 50, 5, 51, 100, ts::ctx(&mut scenario));

        // Tx 2: Create Proposal.
        next_tx(&mut scenario, USER_1);
        let mut dao_state = ts::take_shared<dao::DaoState>(&scenario);
        proposal::create_proposal(
            &mut dao_state,
            std::string::utf8(b"Test Title"),
            std::string::utf8(b"Test Description"),
            proposal::create_test_proposal_type(),
            &clock,
            ts::ctx(&mut scenario)
        );
        ts::return_shared(dao_state);

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = proposal::EPROPOSER_NOT_SIGNER)]
    fun test_create_proposal_not_signer() {
        let mut scenario = ts::begin(ADMIN);
        let signers = vector[ADMIN, USER_1, USER_2];
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Tx 1: Initialize DAO.
        next_tx(&mut scenario, ADMIN);
        dao::initialize_dao(signers, 2, 86400000, 50, 5, 51, 100, ts::ctx(&mut scenario));

        // Tx 2: Attempt to create proposal as non-signer (this will fail).
        next_tx(&mut scenario, NON_SIGNER);
        let mut dao_state = ts::take_shared<dao::DaoState>(&scenario);
        proposal::create_proposal(
            &mut dao_state,
            std::string::utf8(b"Test Title"),
            std::string::utf8(b"Test Description"),
            proposal::create_test_proposal_type(),
            &clock,
            ts::ctx(&mut scenario)
        );
        ts::return_shared(dao_state); // This line won't be reached.

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // --- Proposal Approval Tests (Corrected) ---

    #[test]
    fun test_approve_proposal() {
        let mut scenario = ts::begin(ADMIN);
        let signers = vector[ADMIN, USER_1, USER_2];
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Tx 1: Initialize DAO.
        next_tx(&mut scenario, ADMIN);
        dao::initialize_dao(signers, 2, 86400000, 50, 5, 51, 100, ts::ctx(&mut scenario));

        // Tx 2: Create Proposal.
        next_tx(&mut scenario, ADMIN);
        let mut dao_state = ts::take_shared<dao::DaoState>(&scenario);
        proposal::create_proposal(
            &mut dao_state,
            std::string::utf8(b"Test Title"),
            std::string::utf8(b"Test Description"),
            proposal::create_test_proposal_type(),
            &clock,
            ts::ctx(&mut scenario)
        );
        ts::return_shared(dao_state);

        // Tx 3: Approve Proposal.
        next_tx(&mut scenario, USER_1);
        let dao_state = ts::take_shared<dao::DaoState>(&scenario);
        let mut proposal = ts::take_shared<proposal::Proposal>(&scenario);
        
        proposal::approve_proposal(&mut proposal, &dao_state, &clock, ts::ctx(&mut scenario));

        assert!(proposal::approvals_count(&proposal) == 2, 0);
        assert!(proposal::is_approved(&proposal), 0);
        
        ts::return_shared(dao_state);
        ts::return_shared(proposal);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = proposal::EAPPROVER_NOT_SIGNER)]
    fun test_approve_proposal_not_signer() {
        let mut scenario = ts::begin(ADMIN);
        let signers = vector[ADMIN, USER_1, USER_2];
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Tx 1: Initialize DAO.
        next_tx(&mut scenario, ADMIN);
        dao::initialize_dao(signers, 2, 86400000, 50, 5, 51, 100, ts::ctx(&mut scenario));

        // Tx 2: Create Proposal.
        next_tx(&mut scenario, ADMIN);
        let mut dao_state = ts::take_shared<dao::DaoState>(&scenario);
        proposal::create_proposal(
            &mut dao_state,
            std::string::utf8(b"Test"), std::string::utf8(b"Desc"), proposal::create_test_proposal_type(),
            &clock, ts::ctx(&mut scenario)
        );
        ts::return_shared(dao_state);

        // Tx 3: Attempt to approve as non-signer (this will fail).
        next_tx(&mut scenario, NON_SIGNER);
        let dao_state = ts::take_shared<dao::DaoState>(&scenario);
        let mut proposal = ts::take_shared<proposal::Proposal>(&scenario);
        proposal::approve_proposal(&mut proposal, &dao_state, &clock, ts::ctx(&mut scenario));
        // Unreachable code below
        ts::return_shared(dao_state);
        ts::return_shared(proposal); 

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = proposal::EALREADY_APPROVED)]
    fun test_approve_proposal_twice() {
        let mut scenario = ts::begin(ADMIN);
        let signers = vector[ADMIN, USER_1, USER_2];
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Tx 1: Initialize DAO.
        next_tx(&mut scenario, ADMIN);
        dao::initialize_dao(signers, 3, 86400000, 50, 5, 51, 100, ts::ctx(&mut scenario));

        // Tx 2: Create Proposal (ADMIN is first approver).
        next_tx(&mut scenario, ADMIN);
        let mut dao_state = ts::take_shared<dao::DaoState>(&scenario);
        proposal::create_proposal(
            &mut dao_state,
            std::string::utf8(b"Test"), std::string::utf8(b"Desc"), proposal::create_test_proposal_type(),
            &clock, ts::ctx(&mut scenario)
        );
        ts::return_shared(dao_state);

        // Tx 3: Attempt to approve again with the same user (this will fail).
        next_tx(&mut scenario, ADMIN);
        let dao_state = ts::take_shared<dao::DaoState>(&scenario);
        let mut proposal = ts::take_shared<proposal::Proposal>(&scenario);
        proposal::approve_proposal(&mut proposal, &dao_state, &clock, ts::ctx(&mut scenario));
        // Unreachable code below
        ts::return_shared(dao_state);
        ts::return_shared(proposal);

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}