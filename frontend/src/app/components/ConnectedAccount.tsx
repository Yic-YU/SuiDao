'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import OwnedObjects from './OwnedObjects';

export default function ConnectedAccount() {
  const account = useCurrentAccount();

  if (!account) {
    return (
      <div className="max-w-md mx-auto mb-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-center">
            请先连接钱包以查看账户信息
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          👤 账户信息
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">地址:</span>
            <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {account.address.slice(0, 8)}...{account.address.slice(-8)}
            </code>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">钱包:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {account.label || '未知钱包'}
            </span>
          </div>
        </div>
        
        {/* 拥有的对象 */}
        <OwnedObjects address={account.address} />
      </div>
    </div>
  );
}
