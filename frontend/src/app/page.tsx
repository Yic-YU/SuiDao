'use client';

import { ConnectButton, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🚀 SuiDao
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            基于Sui区块链的去中心化应用
          </p>
        </header>

        {/* 网络状态显示 */}
        <NetworkStatus />

        {/* 钱包连接区域 */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
              连接钱包
            </h2>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        </div>

        {/* 账户信息 */}
        <ConnectedAccount />

        {/* 功能区域 */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🔧 开发工具
            </h3>
            <div className="space-y-2">
              <a 
                href="https://suiexplorer.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sui Explorer
              </a>
              <a 
                href="https://docs.sui.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sui 文档
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🐛 调试信息
            </h3>
            <div className="space-y-2 text-sm">
              <div className="text-gray-600 dark:text-gray-400">
                如果遇到钱包连接问题，请尝试：
              </div>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>刷新页面</li>
                <li>检查Sui钱包扩展是否最新</li>
                <li>确保钱包网络设置为Devnet</li>
                <li>检查浏览器控制台错误信息</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NetworkStatus() {
  return (
    <div className="max-w-md mx-auto mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
          📊 网络状态
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">当前网络:</span>
            <span className="text-green-600 font-medium">Devnet</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">状态:</span>
            <span className="text-green-600 font-medium">已连接</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectedAccount() {
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

function OwnedObjects({ address }: { address: string }) {
  const { data, isLoading, error } = useSuiClientQuery('getOwnedObjects', {
    owner: address,
  });

  if (isLoading) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          📦 拥有的对象
        </h3>
        <div className="text-gray-600 dark:text-gray-400 text-center py-4">
          加载中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          📦 拥有的对象
        </h3>
        <div className="text-red-600 dark:text-red-400 text-center py-4">
          加载失败: {error.message}
        </div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          📦 拥有的对象
        </h3>
        <div className="text-gray-600 dark:text-gray-400 text-center py-4">
          暂无对象
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        📦 拥有的对象 ({data.data.length})
      </h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {data.data.map((object) => (
          <div 
            key={object.data?.objectId}
            className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
          >
            <code className="text-xs text-gray-600 dark:text-gray-400">
              {object.data?.objectId?.slice(0, 8)}...{object.data?.objectId?.slice(-8)}
            </code>
            <a
              href={`https://suiexplorer.com/object/${object.data?.objectId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
            >
              查看
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
