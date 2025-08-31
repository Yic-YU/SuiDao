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
