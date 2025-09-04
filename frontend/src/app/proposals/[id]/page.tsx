'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { getProposal, executeApproveProposal } from '@/lib/sui-contract';

// 提案详情接口
interface ProposalDetail {
  id: string;
  title: string;
  description: string;
  daoStateId: string;
  status: 'pending' | 'active' | 'executed' | 'defeated';
  type: 'updateDao' | 'withdrawTreasury';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  endTime: string;
  createdBy: string;
  createdAt: string;
  approvals: string[];
  threshold: number;
}

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  
  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [voteChoice, setVoteChoice] = useState<'for' | 'against' | null>(null);

  // 模拟提案数据（实际应用中应该从区块链获取）
  const mockProposal: ProposalDetail = {
    id: params.id as string,
    title: '增加Sui生态项目投资',
    description: '提议增加对Sui生态中新兴项目的投资，以促进生态发展。这将包括对DeFi协议、NFT市场、游戏项目等领域的投资，预计投资总额为100万SUI，投资期限为2年。我们相信这将为DAO成员带来可观的回报，同时推动整个Sui生态系统的发展。',
    daoStateId: '0x1234...5678',
    status: 'active',
    type: 'updateDao',
    votesFor: 850,
    votesAgainst: 120,
    totalVotes: 1015,
    endTime: '2024-02-15T23:59:59Z',
    createdBy: '0x1234...5678',
    createdAt: '2024-02-01T10:00:00Z',
    approvals: ['0x1234...5678', '0x8765...4321'],
    threshold: 3,
  };

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setProposal(mockProposal);
      setIsLoading(false);
    }, 1000);
  }, [params.id]);

  const handleApprove = async () => {
    if (!account || !proposal) return;
    
    setIsApproving(true);
    try {
      // 这里应该调用实际的批准提案函数
      // const result = await executeApproveProposal(suiClient, signAndExecuteTransaction.mutateAsync, proposal.id, proposal.daoStateId);
      
      // 模拟批准成功
      setTimeout(() => {
        alert('提案批准成功！');
        setIsApproving(false);
        // 刷新提案状态
        if (proposal) {
          setProposal({
            ...proposal,
            approvals: [...proposal.approvals, account.address],
          });
        }
      }, 2000);
    } catch (error) {
      console.error('批准提案失败:', error);
      alert('批准提案失败，请重试');
      setIsApproving(false);
    }
  };

  const handleVote = async () => {
    if (!account || !proposal || !voteChoice) return;
    
    setIsVoting(true);
    try {
      // 这里应该调用实际的投票函数
      // const result = await executeVote(suiClient, signAndExecuteTransaction.mutateAsync, proposal.id, voteChoice);
      
      // 模拟投票成功
      setTimeout(() => {
        alert('投票成功！');
        setIsVoting(false);
        setVoteChoice(null);
        // 刷新投票数据
        if (proposal) {
          setProposal({
            ...proposal,
            votesFor: voteChoice === 'for' ? proposal.votesFor + 100 : proposal.votesFor,
            votesAgainst: voteChoice === 'against' ? proposal.votesAgainst + 100 : proposal.votesAgainst,
            totalVotes: proposal.totalVotes + 100,
          });
        }
      }, 2000);
    } catch (error) {
      console.error('投票失败:', error);
      alert('投票失败，请重试');
      setIsVoting(false);
    }
  };

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
      case 'updateDao':
        return 'DAO配置更新';
      case 'withdrawTreasury':
        return '金库提款';
      default:
        return type;
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString('zh-CN');
  };

  const calculateProgress = (votesFor: number, totalVotes: number) => {
    return totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  };

  const canApprove = proposal && proposal.status === 'pending' && proposal.approvals.length < proposal.threshold;
  const canVote = proposal && proposal.status === 'active';
  const isApproved = proposal && proposal.approvals.length >= proposal.threshold;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载提案详情中...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">提案不存在</p>
          <Link
            href="/proposals/list"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors duration-200"
          >
            返回提案列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮 */}
          <div className="mb-6">
            <Link
              href="/proposals/list"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回提案列表
            </Link>
          </div>

          {/* 提案头部 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {proposal.title}
                  </h1>
                  <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(proposal.status)}`}>
                    {getStatusText(proposal.status)}
                  </span>
                  <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm px-3 py-1 rounded-full">
                    {getTypeText(proposal.type)}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  {proposal.description}
                </p>
              </div>
            </div>

            {/* 提案信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">DAO ID:</span> {proposal.daoStateId}
              </div>
              <div>
                <span className="font-medium">创建者:</span> {proposal.createdBy}
              </div>
              <div>
                <span className="font-medium">创建时间:</span> {formatTime(proposal.createdAt)}
              </div>
              {proposal.status === 'active' && (
                <div>
                  <span className="font-medium">截止时间:</span> {formatTime(proposal.endTime)}
                </div>
              )}
            </div>
          </div>

          {/* 多签阶段信息 */}
          {proposal.status === 'pending' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
                🔐 多签批准阶段
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-800 dark:text-yellow-200">
                    已批准: {proposal.approvals.length} / {proposal.threshold}
                  </span>
                  <div className="w-32 bg-yellow-200 dark:bg-yellow-700 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(proposal.approvals.length / proposal.threshold) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  已批准的签名者: {proposal.approvals.join(', ')}
                </div>
                {canApprove && (
                  <button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className={`px-6 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                      isApproving
                        ? 'bg-yellow-400 cursor-not-allowed'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {isApproving ? '批准中...' : '批准提案'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 投票阶段信息 */}
          {proposal.status === 'active' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                🗳️ 社区投票阶段
              </h3>
              <div className="space-y-4">
                {/* 投票进度 */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-800 dark:text-blue-200">投票进度</span>
                    <span className="text-blue-900 dark:text-blue-100 font-medium">
                      {proposal.totalVotes.toLocaleString()} 票
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(proposal.votesFor, proposal.totalVotes)}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-green-600 dark:text-green-400 font-medium text-lg">
                        {proposal.votesFor.toLocaleString()}
                      </div>
                      <div className="text-blue-700 dark:text-blue-300">赞成票</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 dark:text-red-400 font-medium text-lg">
                        {proposal.votesAgainst.toLocaleString()}
                      </div>
                      <div className="text-blue-700 dark:text-blue-300">反对票</div>
                    </div>
                  </div>
                </div>

                {/* 投票操作 */}
                {canVote && (
                  <div className="border-t border-blue-200 dark:border-blue-700 pt-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">参与投票</h4>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setVoteChoice('for')}
                        className={`px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                          voteChoice === 'for'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-100'
                        }`}
                      >
                        赞成
                      </button>
                      <button
                        onClick={() => setVoteChoice('against')}
                        className={`px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                          voteChoice === 'against'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-100'
                        }`}
                      >
                        反对
                      </button>
                      {voteChoice && (
                        <button
                          onClick={handleVote}
                          disabled={isVoting}
                          className={`px-6 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            isVoting
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isVoting ? '投票中...' : '提交投票'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Link
              href={`/dao/${proposal.daoStateId}`}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              查看DAO
            </Link>
            <Link
              href="/proposals"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              创建新提案
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
