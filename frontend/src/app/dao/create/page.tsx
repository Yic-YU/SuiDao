'use client';

import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useSuiClient } from '@mysten/dapp-kit';
import { executeCreateDao, CreateDaoParams } from '@/lib/sui-contract';

export default function CreateDaoPage() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const signAndExecuteTransaction = useSignAndExecuteTransaction();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    symbol: '',
    quorum: 1,
    
    votingPeriod: 7,
    executionDelay: 1,
    threshold: 1,
    stakingYieldRate: 5,
    passThresholdPercentage: 51,
    minStakingAmount: 100,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      alert('请先连接钱包');
      return;
    }

    setIsLoading(true);
    setTxHash(null);

    try {
      // 准备DAO创建参数
      const createDaoParams: CreateDaoParams = {
        initialSigners: [account.address], // 当前用户作为初始签名者
        threshold: formData.threshold,
        voteDurationMs: formData.votingPeriod * 24 * 60 * 60 * 1000, // 转换为毫秒
        quorum: formData.quorum,
        stakingYieldRate: formData.stakingYieldRate,
        passThresholdPercentage: formData.passThresholdPercentage,
        minStakingAmount: formData.minStakingAmount * 1000000000, // 转换为SUI的最小单位
      };

      // 执行DAO创建交易
      const result = await executeCreateDao(
        suiClient,
        signAndExecuteTransaction.mutateAsync,
        createDaoParams
      );

      if (result.success && result.txHash) {
        setTxHash(result.txHash);
        alert(`DAO创建成功！交易哈希: ${result.txHash}`);
      } else {
        alert(`DAO创建失败: ${result.error}`);
      }
    } catch (error) {
      console.error('创建DAO时发生错误:', error);
      alert('创建DAO时发生错误，请查看控制台');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  if (!account) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-yellow-50/90 dark:bg-yellow-900/20 backdrop-blur-sm border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <p className="text-yellow-800 dark:text-yellow-200">
                请先连接钱包以创建DAO
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white dark:text-slate-100 mb-4">
              🏛️ 创建新DAO
            </h1>
            <p className="text-blue-100 dark:text-blue-200">
              创建一个去中心化自治组织，开始您的治理之旅
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* DAO名称 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  DAO名称 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="输入DAO名称"
                />
              </div>

              {/* DAO描述 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  DAO描述
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="描述您的DAO目标和愿景"
                />
              </div>

              {/* 代币符号 */}
              <div>
                <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  代币符号 *
                </label>
                <input
                  type="text"
                  id="symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  required
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="例如: DAO"
                />
              </div>

              {/* 治理参数 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    多签阈值 *
                  </label>
                  <input
                    type="number"
                    id="threshold"
                    name="threshold"
                    value={formData.threshold}
                    onChange={handleNumberChange}
                    required
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="quorum" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    法定人数 *
                  </label>
                  <input
                    type="number"
                    id="quorum"
                    name="quorum"
                    value={formData.quorum}
                    onChange={handleNumberChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="votingPeriod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    投票期限 (天) *
                  </label>
                  <input
                    type="number"
                    id="votingPeriod"
                    name="votingPeriod"
                    value={formData.votingPeriod}
                    onChange={handleNumberChange}
                    required
                    min="1"
                    max="30"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* 高级参数 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="stakingYieldRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    质押收益率 (%) *
                  </label>
                  <input
                    type="number"
                    id="stakingYieldRate"
                    name="stakingYieldRate"
                    value={formData.stakingYieldRate}
                    onChange={handleNumberChange}
                    required
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="passThresholdPercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    通过阈值 (%) *
                  </label>
                  <input
                    type="number"
                    id="passThresholdPercentage"
                    name="passThresholdPercentage"
                    value={formData.passThresholdPercentage}
                    onChange={handleNumberChange}
                    required
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="minStakingAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    最小质押量 (SUI) *
                  </label>
                  <input
                    type="number"
                    id="minStakingAmount"
                    name="minStakingAmount"
                    value={formData.minStakingAmount}
                    onChange={handleNumberChange}
                    required
                    min="0.1"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* 执行延迟 */}
              <div>
                <label htmlFor="executionDelay" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  执行延迟 (天) *
                </label>
                <input
                  type="number"
                  id="executionDelay"
                  name="executionDelay"
                  value={formData.executionDelay}
                  onChange={handleNumberChange}
                  required
                  min="0"
                  max="7"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* 交易状态显示 */}
              {txHash && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    ✅ DAO创建成功！交易哈希: 
                    <a 
                      href={`https://suiexplorer.com/txblock/${txHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline ml-1"
                    >
                      {txHash.slice(0, 8)}...{txHash.slice(-8)}
                    </a>
                  </p>
                </div>
              )}

              {/* 提交按钮 */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isLoading ? '创建中...' : '创建DAO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
