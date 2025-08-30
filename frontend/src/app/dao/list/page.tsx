'use client';

import { useState } from 'react';
import Link from 'next/link';

// 模拟DAO数据
const mockDaos = [
  {
    id: '1',
    name: 'Sui生态DAO',
    description: '专注于Sui区块链生态发展的去中心化组织',
    symbol: 'SUI',
    memberCount: 1250,
    proposalCount: 23,
    treasury: '125,000 SUI',
    status: 'active',
  },
  {
    id: '2',
    name: 'DeFi治理DAO',
    description: '去中心化金融协议的治理组织',
    symbol: 'DEFI',
    memberCount: 890,
    proposalCount: 15,
    treasury: '89,500 SUI',
    status: 'active',
  },
  {
    id: '3',
    name: 'NFT收藏家DAO',
    description: 'NFT收藏家和艺术家的社区组织',
    symbol: 'NFT',
    memberCount: 567,
    proposalCount: 8,
    treasury: '45,200 SUI',
    status: 'active',
  },
];

export default function DaoListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredDaos = mockDaos.filter(dao => {
    const matchesSearch = dao.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dao.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || dao.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white dark:text-slate-100 mb-4">
              🏛️ DAO列表
            </h1>
            <p className="text-blue-100 dark:text-blue-200">
              探索和参与各种去中心化自治组织
            </p>
          </div>

          {/* 搜索和筛选 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="搜索DAO名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">所有状态</option>
                  <option value="active">活跃</option>
                  <option value="inactive">非活跃</option>
                </select>
              </div>
              <Link
                href="/dao/create"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                创建DAO
              </Link>
            </div>
          </div>

          {/* DAO列表 */}
          <div className="grid gap-6">
            {filteredDaos.map((dao) => (
              <div
                key={dao.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {dao.name}
                      </h3>
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                        {dao.symbol}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        dao.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {dao.status === 'active' ? '活跃' : '非活跃'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {dao.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">成员数:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {dao.memberCount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">提案数:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {dao.proposalCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">金库:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {dao.treasury}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/dao/${dao.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        查看详情
                      </Link>
                      <Link
                        href={`/dao/${dao.id}/proposals`}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        查看提案
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDaos.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                没有找到匹配的DAO
              </div>
              <p className="text-gray-400 dark:text-gray-500">
                尝试调整搜索条件或创建新的DAO
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
