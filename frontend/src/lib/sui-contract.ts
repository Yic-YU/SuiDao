import { Transaction } from '@mysten/sui/transactions';
import { getCurrentContractConfig } from '@/config/contracts';


// 使用更通用的类型来避免版本冲突
type SuiClientType = {
  getObject: (params: { id: string; options: { showContent: boolean; showDisplay: boolean } }) => Promise<unknown>;
  queryEvents: (params: { query: { MoveEventType: string }; limit: number; order: 'descending' | 'ascending' | null | undefined }) => Promise<{ data: unknown[] }>;
};



// DAO创建参数接口
export interface CreateDaoParams {
  initialSigners: string[];
  threshold: number;
  voteDurationMs: number;
  quorum: number;
  stakingYieldRate: number;
  passThresholdPercentage: number;
  minStakingAmount: number;
}

// 获取当前合约配置
const getContractConfig = () => getCurrentContractConfig();

/**
 * 构建创建DAO的交易
 */
export function buildCreateDaoTransaction(params: CreateDaoParams): Transaction {
  const tx = new Transaction();
  
  // 调用DAO合约的initialize_dao函数
  const config = getContractConfig();
  tx.moveCall({
    target: `${config.PACKAGE_ID}::${config.MODULE_NAME}::${config.FUNCTION_NAME}`,
    arguments: [
      // initial_signers: vector<address>
      tx.pure.vector('address', params.initialSigners),
      // threshold: u8
      tx.pure.u8(params.threshold),
      // vote_duration_ms: u64
      tx.pure.u64(params.voteDurationMs),
      // quorum: u32
      tx.pure.u32(params.quorum),
      // staking_yield_rate: u16
      tx.pure.u16(params.stakingYieldRate),
      // pass_threshold_percentage: u8
      tx.pure.u8(params.passThresholdPercentage),
      // min_staking_amount: u64
      tx.pure.u64(params.minStakingAmount),
    ],
  });

  return tx;
}

/**
 * 执行创建DAO交易
 */
export async function executeCreateDao(
  suiClient: SuiClientType,
  signAndExecuteTransactionBlock: (args: { transaction: Transaction }) => Promise<{ digest: string }>,
  params: CreateDaoParams
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // 构建交易
    const tx = buildCreateDaoTransaction(params);
    
    // 执行交易
    const result = await signAndExecuteTransactionBlock({ transaction: tx });
    
    return {
      success: true,
      txHash: result.digest,
    };
  } catch (error) {
    console.error('创建DAO失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 获取DAO状态
 */
export async function getDaoState(
  suiClient: SuiClientType,
  daoId: string
): Promise<unknown> {
  try {
    const daoObject = await suiClient.getObject({
      id: daoId,
      options: {
        showContent: true,
        showDisplay: true,
      },
    });
    
    return daoObject;
  } catch (error) {
    console.error('获取DAO状态失败:', error);
    throw error;
  }
}

/**
 * 查询DAO事件
 */
export async function queryDaoEvents(
  suiClient: SuiClientType,
  packageId: string,
  eventType: string,
  limit: number = 50
): Promise<unknown[]> {
  try {
    const config = getContractConfig();
    const events = await suiClient.queryEvents({
      query: {
        MoveEventType: `${packageId}::${config.MODULE_NAME}::${eventType}`,
      },
      limit,
      order: 'descending',
    });
    
    return events.data;
  } catch (error) {
    console.error('查询DAO事件失败:', error);
    throw error;
  }
}

// =========== 提案相关接口和函数 ===========

// 提案类型接口
export interface ProposalType {
  updateDao?: {
    action: {
      updateThreshold?: { newThreshold: number };
      updateVoteDuration?: { newVoteDurationMs: number };
      updateQuorum?: { newQuorum: number };
      updateStakingYield?: { newStakingYieldRate: number };
      updatePassThreshold?: { newPassThresholdPercentage: number };
      updateMinStaking?: { newMinStakingAmount: number };
    };
  };
  withdrawTreasury?: {
    amount: number;
    recipient: string;
  };
}

// 创建提案参数接口
export interface CreateProposalParams {
  daoStateId: string;
  title: string;
  description: string;
  proposalType: ProposalType;
}

/**
 * 构建创建提案的交易
 */
export function buildCreateProposalTransaction(params: CreateProposalParams): Transaction {
  const tx = new Transaction();
  
  const config = getContractConfig();

  // 通过链式 Move 调用先构造 ProposalType 再传入 create_proposal
  const proposalArg = buildProposalTypeViaMoveCall(tx, params.proposalType);

  tx.moveCall({
    target: `${config.PACKAGE_ID}::${config.PROPOSAL_MODULE}::${config.PROPOSAL_FUNCTIONS.CREATE_PROPOSAL}`,
    arguments: [
      tx.object(params.daoStateId),
      tx.pure.string(params.title),
      tx.pure.string(params.description),
      proposalArg,
      tx.sharedObjectRef({
        objectId: '0x6',
        initialSharedVersion: 1,
        mutable: false,
      }),
    ],
  });

  return tx;
}

function ensureSingle<T>(conds: T[]): number {
  let idx = -1;
  for (let i = 0; i < conds.length; i++) {
    if (conds[i]) {
      if (idx !== -1) throw new Error('仅允许提供一种提案子动作');
      idx = i;
    }
  }
  if (idx === -1) throw new Error('必须提供一种提案子动作');
  return idx;
}

function buildProposalTypeViaMoveCall(tx: Transaction, proposalType: ProposalType) {
  const config = getContractConfig();
  const mod = config.PROPOSAL_MODULE;

  if (proposalType.updateDao) {
    const a = proposalType.updateDao.action;
    const choices = [
      !!a.updateThreshold,
      !!a.updateVoteDuration,
      !!a.updateQuorum,
      !!a.updateStakingYield,
      !!a.updatePassThreshold,
      !!a.updateMinStaking,
    ];
    const which = ensureSingle(choices);

    switch (which) {
      case 0: {
        // make_update_threshold(u8)
        const v = a.updateThreshold!.newThreshold;
        return tx.moveCall({
          target: `${config.PACKAGE_ID}::${mod}::make_update_threshold`,
          arguments: [tx.pure.u8(v)],
        });
      }
      case 1: {
        // make_update_vote_duration(u64)
        const v = a.updateVoteDuration!.newVoteDurationMs;
        return tx.moveCall({
          target: `${config.PACKAGE_ID}::${mod}::make_update_vote_duration`,
          arguments: [tx.pure.u64(v)],
        });
      }
      case 2: {
        // make_update_quorum(u32)
        const v = a.updateQuorum!.newQuorum;
        return tx.moveCall({
          target: `${config.PACKAGE_ID}::${mod}::make_update_quorum`,
          arguments: [tx.pure.u32(v)],
        });
      }
      case 3: {
        // make_update_staking_yield(u16)
        const v = a.updateStakingYield!.newStakingYieldRate;
        return tx.moveCall({
          target: `${config.PACKAGE_ID}::${mod}::make_update_staking_yield`,
          arguments: [tx.pure.u16(v)],
        });
      }
      case 4: {
        // make_update_pass_threshold(u8)
        const v = a.updatePassThreshold!.newPassThresholdPercentage;
        return tx.moveCall({
          target: `${config.PACKAGE_ID}::${mod}::make_update_pass_threshold`,
          arguments: [tx.pure.u8(v)],
        });
      }
      case 5: {
        // make_update_min_staking(u64)
        const v = a.updateMinStaking!.newMinStakingAmount;
        return tx.moveCall({
          target: `${config.PACKAGE_ID}::${mod}::make_update_min_staking`,
          arguments: [tx.pure.u64(v)],
        });
      }
      default:
        throw new Error('未识别的提案子动作');
    }
  }

  if (proposalType.withdrawTreasury) {
    const { amount, recipient } = proposalType.withdrawTreasury;
    return tx.moveCall({
      target: `${config.PACKAGE_ID}::${mod}::make_withdraw_treasury`,
      arguments: [tx.pure.u64(amount), tx.pure.address(recipient)],
    });
  }

  throw new Error('无效的 ProposalType：必须指定 updateDao 或 withdrawTreasury');
}

/**
 * 执行创建提案交易
 */
export async function executeCreateProposal(
  suiClient: SuiClientType,
  signAndExecuteTransactionBlock: (args: { transaction: Transaction }) => Promise<{ digest: string }>,
  params: CreateProposalParams
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // 构建交易
    const tx = buildCreateProposalTransaction(params);
    
    // 执行交易
    const result = await signAndExecuteTransactionBlock({ transaction: tx });
    
    return {
      success: true,
      txHash: result.digest,
    };
  } catch (error) {
    console.error('创建提案失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 构建批准提案的交易
 */
export function buildApproveProposalTransaction(proposalId: string, daoStateId: string): Transaction {
  const tx = new Transaction();
  
  // 调用proposal合约的approve_proposal函数
  const config = getContractConfig();
  tx.moveCall({
    target: `${config.PACKAGE_ID}::${config.PROPOSAL_MODULE}::${config.PROPOSAL_FUNCTIONS.APPROVE_PROPOSAL}`,
    arguments: [
      // proposal: &mut Proposal
      tx.object(proposalId),
      // dao_state: &DaoState
      tx.object(daoStateId),
      // clock: &Clock
      tx.sharedObjectRef({
        objectId: '0x6',
        initialSharedVersion: 1,
        mutable: false,
      }),
    ],
  });

  return tx;
}

/**
 * 执行批准提案交易
 */
export async function executeApproveProposal(
  suiClient: SuiClientType,
  signAndExecuteTransactionBlock: (args: { transaction: Transaction }) => Promise<{ digest: string }>,
  proposalId: string,
  daoStateId: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // 构建交易
    const tx = buildApproveProposalTransaction(proposalId, daoStateId);
    
    // 执行交易
    const result = await signAndExecuteTransactionBlock({ transaction: tx });
    
    return {
      success: true,
      txHash: result.digest,
    };
  } catch (error) {
    console.error('批准提案失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 获取提案信息
 */
export async function getProposal(
  suiClient: SuiClientType,
  proposalId: string
): Promise<unknown> {
  try {
    const proposalObject = await suiClient.getObject({
      id: proposalId,
      options: {
        showContent: true,
        showDisplay: true,
      },
    });
    
    return proposalObject;
  } catch (error) {
    console.error('获取提案信息失败:', error);
    throw error;
  }
}

/**
 * 查询提案事件
 */
export async function queryProposalEvents(
  suiClient: SuiClientType,
  packageId: string,
  eventType: string,
  limit: number = 50
): Promise<unknown[]> {
  try {
    const events = await suiClient.queryEvents({
      query: {
        MoveEventType: `${packageId}::proposal::${eventType}`,
      },
      limit,
      order: 'descending',
    });
    
    return events.data;
  } catch (error) {
    console.error('查询提案事件失败:', error);
    throw error;
  }
}
