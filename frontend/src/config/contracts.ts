// 合约配置
export const CONTRACT_CONFIG = {
  // 开发环境配置
  development: {
    PACKAGE_ID: '0x452132cebeab22eb484ea649bf5f2145b1eb5d49a1bf5993ed6a3bfe2e741d24', // 测试网包ID（本地也指向测试网）
    MODULE_NAME: 'dao',
    FUNCTION_NAME: 'initialize_dao',
    PROPOSAL_MODULE: 'proposal',
    PROPOSAL_FUNCTIONS: {
      CREATE_PROPOSAL: 'create_proposal',
      APPROVE_PROPOSAL: 'approve_proposal',
    },
    NETWORK: 'testnet',
  },
  
  // 测试网配置
  testnet: {
    PACKAGE_ID: '0x452132cebeab22eb484ea649bf5f2145b1eb5d49a1bf5993ed6a3bfe2e741d24', // 来自 programs/Move.lock 的 latest-published-id
    MODULE_NAME: 'dao',
    FUNCTION_NAME: 'initialize_dao',
    PROPOSAL_MODULE: 'proposal',
    PROPOSAL_FUNCTIONS: {
      CREATE_PROPOSAL: 'create_proposal',
      APPROVE_PROPOSAL: 'approve_proposal',
    },
    NETWORK: 'testnet',
  },
  
  // 主网配置
  mainnet: {
    PACKAGE_ID: '0x0', // 主网还未部署
    MODULE_NAME: 'dao',
    FUNCTION_NAME: 'initialize_dao',
    PROPOSAL_MODULE: 'proposal',
    PROPOSAL_FUNCTIONS: {
      CREATE_PROPOSAL: 'create_proposal',
      APPROVE_PROPOSAL: 'approve_proposal',
    },
    NETWORK: 'mainnet',
  },
};

// 根据环境获取配置
export function getContractConfig(environment: 'development' | 'testnet' | 'mainnet' = 'development') {
  return CONTRACT_CONFIG[environment];
}

// 获取当前环境的配置
export function getCurrentContractConfig() {
  // 根据环境变量或当前域名判断环境
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return getContractConfig('development');
    }
    // 可以根据实际域名配置其他环境
  }
  
  return getContractConfig('development');
}

// 网络配置
export const NETWORK_CONFIG = {
  devnet: {
    name: 'Devnet',
    rpcUrl: 'https://fullnode.devnet.sui.io:443',
    explorerUrl: 'https://suiexplorer.com',
  },
  testnet: {
    name: 'Testnet',
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    explorerUrl: 'https://suiexplorer.com',
  },
  mainnet: {
    name: 'Mainnet',
    rpcUrl: 'https://fullnode.mainnet.sui.io:443',
    explorerUrl: 'https://suiexplorer.com',
  },
};
