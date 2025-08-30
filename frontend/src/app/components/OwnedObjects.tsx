'use client';

import { useSuiClientQuery } from '@mysten/dapp-kit';

interface OwnedObjectsProps {
  address: string;
}

export default function OwnedObjects({ address }: OwnedObjectsProps) {
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
