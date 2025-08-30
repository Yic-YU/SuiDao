export default function NetworkStatus() {
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
