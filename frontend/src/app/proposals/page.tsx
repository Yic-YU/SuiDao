'use client';

import { useState } from 'react';
import Link from 'next/link';

// 模拟提案数据
const mockProposals = [
  {
    id: '1',
    title: '增加Sui生态项目投资',
    description: '提议增加对Sui生态中新兴项目的投资，以促进生态发展',
    daoName: 'Sui生态DAO',
    daoId: '1',
    status: 'active',
    type: 'treasury',
    votesFor: 850,
    votesAgainst: 120,
    votesAbstain: 45,
    totalVotes: 1015,
    endTime: '2024-02-15T23:59:59Z',
    createdBy: '0x1234...5678',
  },
  {
    id: '2',
    title: '更新治理参数',
    description: '调整投票期限和执行延迟，提高治理效率',
    daoName: 'DeFi治理DAO',
    daoId: '2',
    status: 'executed',
    type: 'governance',
    votesFor: 720,
    votesAgainst: 89,
    votesAbstain: 23,
    totalVotes: 832,
    endTime: '2024-02-10T23:59:59Z',
    createdBy: '0x8765...4321',
  },
  {
    id: '3',
    title: 'NFT市场合作提案',
    description: '与知名NFT市场建立合作关系，扩大社区影响力',
    daoName: 'NFT收藏家DAO',
    daoId: '3',
    status: 'defeated',
    type: 'partnership',
    votesFor: 234,
    votesAgainst: 456,
    votesAbstain: 78,
    totalVotes: 768,
    endTime: '2024-02-05T23:59:59Z',
    createdBy: '0x9876...5432',
  },
];

export default function ProposalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filteredProposals = mockProposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.daoName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || proposal.status === filterStatus;
    const matchesType = filterType === 'all' || proposal.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'executed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'defeated':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '进行中';
      case 'executed':
        return '已执行';
      case 'defeated':
        return '已否决';
      case 'pending':
        return '待执行';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'treasury':
        return '金库';
      case 'governance':
        return '治理';
      case 'partnership':
        return '合作';
      default:
        return type;
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('zh-CN');
  };

  const calculateProgress = (votesFor: number, totalVotes: number) => {
    return totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white dark:text-slate-100 mb-4">
              📋 提案列表
            </h1>
            <p className="text-blue-100 dark:text-blue-200">
              查看和参与各种DAO治理提案
            </p>
          </div>

          {/* 搜索和筛选 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="搜索提案标题、描述或DAO名称..."
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
                  <option value="active">进行中</option>
                  <option value="executed">已执行</option>
                  <option value="defeated">已否决</option>
                  <option value="pending">待执行</option>
                </select>
              </div>
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">所有类型</option>
                  <option value="treasury">金库</option>
                  <option value="governance">治理</option>
                  <option value="partnership">合作</option>
                </select>
              </div>
            </div>
          </div>

          {/* 提案列表 */}
          <div className="grid gap-6">
            {filteredProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="space-y-4">
                  {/* 提案头部 */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {proposal.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(proposal.status)}`}>
                          {getStatusText(proposal.status)}
                        </span>
                        <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
                          {getTypeText(proposal.type)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {proposal.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>DAO: {proposal.daoName}</span>
                        <span>创建者: {proposal.createdBy}</span>
                        <span>截止时间: {formatTime(proposal.endTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 投票进度 */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">投票进度</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {proposal.totalVotes.toLocaleString()} 票
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProgress(proposal.votesFor, proposal.totalVotes)}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-green-600 dark:text-green-400 font-medium">
                          {proposal.votesFor.toLocaleString()}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">赞成</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-600 dark:text-red-400 font-medium">
                          {proposal.votesAgainst.toLocaleString()}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">反对</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600 dark:text-gray-400 font-medium">
                          {proposal.votesAbstain.toLocaleString()}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">弃权</div>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/proposals/${proposal.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      查看详情
                    </Link>
                    <Link
                      href={`/dao/${proposal.daoId}`}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      查看DAO
                    </Link>
                    {proposal.status === 'active' && (
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                        投票
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProposals.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                没有找到匹配的提案
              </div>
              <p className="text-gray-400 dark:text-gray-500">
                尝试调整搜索条件或查看其他DAO的提案
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
