'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function CreateDaoPage() {
  const account = useCurrentAccount();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    symbol: '',
    quorum: 1,
    votingPeriod: 7,
    executionDelay: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      alert('请先连接钱包');
      return;
    }
    
    // TODO: 实现DAO创建逻辑
    console.log('创建DAO:', formData);
    alert('DAO创建功能开发中...');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-400 to-indigo-600 dark:from-blue-950 dark:via-blue-700 dark:to-indigo-800">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-400 to-indigo-600 dark:from-blue-950 dark:via-blue-700 dark:to-indigo-800">
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
              </div>

              {/* 提交按钮 */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  创建DAO
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
