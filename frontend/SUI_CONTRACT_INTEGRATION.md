# Sui合约集成指南

## 概述

本项目使用Sui区块链的Move语言智能合约，通过`@mysten/sui` SDK与前端进行交互。

## 与Solana的区别

### Solana (Anchor)
- 使用 **IDL (Interface Definition Language)** 文件定义合约接口
- 通过 `@solana/web3.js` 和 `@project-serum/anchor` 进行交互
- IDL定义了合约的结构、函数和参数

### Sui (Move)
- 使用 **Move语言** 编写智能合约
- 通过 `@mysten/sui` SDK 进行交互
- 没有IDL概念，直接调用Move模块函数

## 项目结构

```
frontend/
├── src/
│   ├── lib/
│   │   └── sui-contract.ts      # Sui合约交互工具
│   ├── config/
│   │   └── contracts.ts         # 合约配置
│   └── app/dao/create/
│       └── page.tsx             # DAO创建页面
programs/
├── sources/
│   ├── dao.move                 # DAO核心合约
│   └── proposal.move            # 提案管理合约
└── Move.toml                    # Move包配置
```

## 核心概念

### 1. TransactionBlock
Sui使用`TransactionBlock`来构建交易，类似于Solana的`Transaction`：

```typescript
import { TransactionBlock } from '@mysten/sui';

const tx = new TransactionBlock();
tx.moveCall({
  target: `${packageId}::${moduleName}::${functionName}`,
  arguments: [
    tx.pure(param1),
    tx.pure(param2),
    // ...
  ],
});
```

### 2. MoveCall
每个合约调用都是一个`MoveCall`，指定：
- `target`: 合约地址和函数路径
- `arguments`: 函数参数

### 3. 合约地址格式
```
{packageId}::{moduleName}::{functionName}
```
例如：`0x123::dao::initialize_dao`

## 使用方法

### 1. 配置合约地址

在 `src/config/contracts.ts` 中配置不同环境的合约地址：

```typescript
export const CONTRACT_CONFIG = {
  development: {
    PACKAGE_ID: '0x0', // 本地部署的包ID
    MODULE_NAME: 'dao',
    FUNCTION_NAME: 'initialize_dao',
  },
  // ...
};
```

### 2. 构建交易

```typescript
import { buildCreateDaoTransaction } from '@/lib/sui-contract';

const tx = buildCreateDaoTransaction({
  initialSigners: [account.address],
  threshold: 1,
  voteDurationMs: 7 * 24 * 60 * 60 * 1000,
  quorum: 1,
  stakingYieldRate: 5,
  passThresholdPercentage: 51,
  minStakingAmount: 1000000000,
});
```

### 3. 执行交易

```typescript
import { executeCreateDao } from '@/lib/sui-contract';

const result = await executeCreateDao(
  suiClient,
  signAndExecuteTransactionBlock,
  createDaoParams
);
```

## 部署步骤

### 1. 编译Move合约

```bash
cd programs
sui move build
```

### 2. 部署到测试网

```bash
sui client publish --gas-budget 10000000 --network testnet
```

### 3. 更新配置

部署成功后，将返回的包ID更新到 `contracts.ts` 中：

```typescript
testnet: {
  PACKAGE_ID: '0x1234567890abcdef...', // 部署后的包ID
  // ...
}
```

## 错误处理

Sui合约的错误处理通过Move语言的`assert!`宏实现：

```move
assert!(threshold > 0, EInvalidThreshold);
assert!(vote_duration_ms > 0, EInvalidVoteDuration);
```

前端通过try-catch捕获交易执行错误：

```typescript
try {
  const result = await executeCreateDao(/* ... */);
  // 处理成功
} catch (error) {
  console.error('交易失败:', error);
  // 处理错误
}
```

## 事件监听

Sui支持事件查询，可以监听合约状态变化：

```typescript
import { queryDaoEvents } from '@/lib/sui-contract';

const events = await queryDaoEvents(
  suiClient,
  packageId,
  'DaoInitialized',
  50
);
```

## 最佳实践

1. **参数验证**: 在发送交易前验证所有参数
2. **错误处理**: 实现完善的错误处理和用户提示
3. **状态管理**: 使用React状态管理交易状态
4. **网络配置**: 根据环境自动选择正确的网络配置
5. **用户体验**: 提供交易进度反馈和结果展示

## 常见问题

### Q: 如何获取交易结果？
A: 通过交易哈希在Sui Explorer中查看，或使用`getObject`查询对象状态。

### Q: 如何处理并发交易？
A: 使用`useSignAndExecuteTransactionBlock`的队列机制，或在前端实现交易队列。

### Q: 如何优化Gas费用？
A: 合理设计交易结构，避免不必要的对象创建和转移。
