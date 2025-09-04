'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useSuiClient } from '@mysten/dapp-kit';
import { executeCreateProposal, CreateProposalParams, ProposalType, queryDaoEvents } from '@/lib/sui-contract';
import { getCurrentContractConfig } from '@/config/contracts';

export default function CreateProposalPage() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const signAndExecuteTransaction = useSignAndExecuteTransaction();
  
  const [formData, setFormData] = useState({
    daoStateId: '',
    title: '',
    description: '',
    proposalType: 'updateDao' as 'updateDao' | 'withdrawTreasury',
    
    // DAO更新参数
    updateThreshold: '',
    updateVoteDuration: '',
    updateQuorum: '',
    updateStakingYield: '',
    updatePassThreshold: '',
    updateMinStaking: '',
    
    // 金库提款参数
    withdrawAmount: '',
    withdrawRecipient: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [availableDaos, setAvailableDaos] = useState<Array<{id: string, name: string, threshold?: string, authority?: string}>>([]);
  const [isLoadingDaos, setIsLoadingDaos] = useState(false);

  // 加载可用的DAO列表
  useEffect(() => {
    const loadAvailableDaos = async () => {
      if (!suiClient) return;
      
      setIsLoadingDaos(true);
      try {
        const config = getCurrentContractConfig();
        
        // 方法1: 查询DAO初始化事件
        try {
          const events = await queryDaoEvents(suiClient, config.PACKAGE_ID, 'DaoInitialized', 50);
          
          const daos = events.map((event: any) => {
            const daoId = event.parsedJson?.dao_id || event.parsedJson?.dao_state_id;
            return {
              id: daoId,
              name: `DAO-${daoId?.slice(-8) || 'Unknown'}`,
              threshold: event.parsedJson?.threshold || 'N/A',
              authority: event.parsedJson?.authority || 'N/A'
            };
          }).filter(dao => dao.id); // 过滤掉无效的DAO ID
          
          if (daos.length > 0) {
            setAvailableDaos(daos);
            return;
          }
        } catch (eventError) {
          console.warn('查询DAO事件失败，尝试其他方法:', eventError);
        }
        
        // 方法2: 如果事件查询失败，尝试查询所有DAO对象
        try {
          const objects = await suiClient.getOwnedObjects({
            owner: account?.address || '',
            filter: {
              StructType: `${config.PACKAGE_ID}::dao::DaoState`
            },
            options: {
              showContent: true,
              showDisplay: true
            }
          });
          
          const daos = objects.data.map((obj: any) => ({
            id: obj.data?.objectId,
            name: `我的DAO-${obj.data?.objectId?.slice(-8) || 'Unknown'}`,
            threshold: obj.data?.content?.fields?.threshold || 'N/A',
            authority: obj.data?.content?.fields?.authority || 'N/A'
          }));
          
          if (daos.length > 0) {
            setAvailableDaos(daos);
            return;
          }
        } catch (objectError) {
          console.warn('查询DAO对象失败:', objectError);
        }
        
        // 方法3: 如果都失败了，显示提示信息
        setAvailableDaos([]);
        
      } catch (error) {
        console.error('加载DAO列表失败:', error);
        setAvailableDaos([]);
      } finally {
        setIsLoadingDaos(false);
      }
    };

    loadAvailableDaos();
  }, [suiClient, account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      alert('请先连接钱包');
      return;
    }

    if (!formData.daoStateId.trim()) {
      alert('请输入DAO状态ID');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('请填写提案标题和描述');
      return;
    }

    setIsLoading(true);
    setTxHash(null);

    try {
      // 构建提案类型
      const proposalType: ProposalType = {};

      if (formData.proposalType === 'updateDao') {
        const action: Record<string, unknown> = {};
        
        if (formData.updateThreshold) {
          action.updateThreshold = { newThreshold: parseInt(formData.updateThreshold) };
        }
        if (formData.updateVoteDuration) {
          action.updateVoteDuration = { newVoteDurationMs: parseInt(formData.updateVoteDuration) * 24 * 60 * 60 * 1000 };
        }
        if (formData.updateQuorum) {
          action.updateQuorum = { newQuorum: parseInt(formData.updateQuorum) };
        }
        if (formData.updateStakingYield) {
          action.updateStakingYield = { newStakingYieldRate: parseInt(formData.updateStakingYield) };
        }
        if (formData.updatePassThreshold) {
          action.updatePassThreshold = { newPassThresholdPercentage: parseInt(formData.updatePassThreshold) };
        }
        if (formData.updateMinStaking) {
          action.updateMinStaking = { newMinStakingAmount: parseInt(formData.updateMinStaking) * 1000000000 };
        }

        if (Object.keys(action).length > 0) {
          proposalType.updateDao = { action };
        }
      } else if (formData.proposalType === 'withdrawTreasury') {
        if (!formData.withdrawAmount || !formData.withdrawRecipient) {
          alert('请填写提款金额和接收地址');
          return;
        }
        proposalType.withdrawTreasury = {
          amount: parseInt(formData.withdrawAmount) * 1000000000, // 转换为SUI的最小单位
          recipient: formData.withdrawRecipient,
        };
      }

      // 检查是否至少有一个有效的提案类型
      if (Object.keys(proposalType).length === 0) {
        alert('请至少选择一个有效的提案类型和参数');
        return;
      }

      // 准备创建提案参数
      const createProposalParams: CreateProposalParams = {
        daoStateId: formData.daoStateId,
        title: formData.title,
        description: formData.description,
        proposalType,
      };

      // 执行创建提案交易
      const result = await executeCreateProposal(
        suiClient,
        signAndExecuteTransaction.mutateAsync,
        createProposalParams
      );

      if (result.success && result.txHash) {
        setTxHash(result.txHash);
        alert(`提案创建成功！交易哈希: ${result.txHash}`);
        
        // 清空表单
        setFormData({
          daoStateId: '',
          title: '',
          description: '',
          proposalType: 'updateDao',
          updateThreshold: '',
          updateVoteDuration: '',
          updateQuorum: '',
          updateStakingYield: '',
          updatePassThreshold: '',
          updateMinStaking: '',
          withdrawAmount: '',
          withdrawRecipient: '',
        });
      } else {
        alert(`提案创建失败: ${result.error}`);
      }
    } catch (error) {
      console.error('创建提案时发生错误:', error);
      alert('创建提案时发生错误，请查看控制台');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!account) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-yellow-50/90 dark:bg-yellow-900/20 backdrop-blur-sm border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <p className="text-yellow-800 dark:text-yellow-200">
                请先连接钱包以创建提案
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white dark:text-slate-100 mb-4">
              📝 创建新提案
            </h1>
            <p className="text-blue-100 dark:text-blue-200">
              为您的DAO创建治理提案，推动组织发展
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  基本信息
                </h3>
                
                <div>
                  <label htmlFor="daoStateId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    DAO状态ID *
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select
                        id="daoStateId"
                        name="daoStateId"
                        value={formData.daoStateId}
                        onChange={handleInputChange}
                        required
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        disabled={isLoadingDaos}
                      >
                        <option value="">
                          {isLoadingDaos ? '加载DAO列表中...' : availableDaos.length === 0 ? '未找到DAO，请手动输入ID' : '选择DAO或手动输入ID'}
                        </option>
                        {availableDaos.map((dao) => (
                          <option key={dao.id} value={dao.id}>
                            {dao.name} (阈值: {dao.threshold}) - {dao.id.slice(0, 8)}...
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLoadingDaos(true);
                          // 重新加载DAO列表
                          const loadAvailableDaos = async () => {
                            if (!suiClient) return;
                            try {
                              const config = getCurrentContractConfig();
                              const events = await queryDaoEvents(suiClient, config.PACKAGE_ID, 'DaoInitialized', 50);
                              const daos = events.map((event: any) => {
                                const daoId = event.parsedJson?.dao_id || event.parsedJson?.dao_state_id;
                                return {
                                  id: daoId,
                                  name: `DAO-${daoId?.slice(-8) || 'Unknown'}`,
                                  threshold: event.parsedJson?.threshold || 'N/A',
                                  authority: event.parsedJson?.authority || 'N/A'
                                };
                              }).filter(dao => dao.id);
                              setAvailableDaos(daos);
                            } catch (error) {
                              console.error('刷新DAO列表失败:', error);
                            } finally {
                              setIsLoadingDaos(false);
                            }
                          };
                          loadAvailableDaos();
                        }}
                        disabled={isLoadingDaos}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {isLoadingDaos ? '🔄' : '🔄'}
                      </button>
                    </div>
                    <input
                      type="text"
                      name="daoStateId"
                      value={formData.daoStateId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="或手动输入DAO状态对象的完整ID (例如: 0x1234...5678)"
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                    <p>💡 <strong>提示：</strong></p>
                    <ul className="ml-4 space-y-1">
                      <li>• 点击刷新按钮从链上获取最新的DAO列表</li>
                      <li>• 如果下拉列表为空，请先创建DAO或手动输入DAO状态对象ID</li>
                      <li>• DAO状态对象ID是创建DAO时返回的对象ID，格式如：0x1234...5678</li>
                      <li>• 您可以在 <a href="https://suiexplorer.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Sui Explorer</a> 上查看DAO对象</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    提案标题 *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="输入提案标题"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    提案描述 *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="详细描述您的提案内容和目标"
                  />
                </div>

                <div>
                  <label htmlFor="proposalType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    提案类型 *
                  </label>
                  <select
                    id="proposalType"
                    name="proposalType"
                    value={formData.proposalType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="updateDao">更新DAO配置</option>
                    <option value="withdrawTreasury">金库提款</option>
                  </select>
                </div>
              </div>

              {/* DAO更新参数 */}
              {formData.proposalType === 'updateDao' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    DAO配置更新参数
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    请至少填写一个要更新的参数，留空的参数将保持不变
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="updateThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        多签阈值
                      </label>
                      <input
                        type="number"
                        id="updateThreshold"
                        name="updateThreshold"
                        value={formData.updateThreshold}
                        onChange={handleInputChange}
                        min="1"
                        max="10"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="新的多签阈值"
                      />
                    </div>

                    <div>
                      <label htmlFor="updateVoteDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        投票期限 (天)
                      </label>
                      <input
                        type="number"
                        id="updateVoteDuration"
                        name="updateVoteDuration"
                        value={formData.updateVoteDuration}
                        onChange={handleInputChange}
                        min="1"
                        max="30"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="新的投票期限"
                      />
                    </div>

                    <div>
                      <label htmlFor="updateQuorum" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        法定人数
                      </label>
                      <input
                        type="number"
                        id="updateQuorum"
                        name="updateQuorum"
                        value={formData.updateQuorum}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="新的法定人数"
                      />
                    </div>

                    <div>
                      <label htmlFor="updateStakingYield" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        质押收益率 (%)
                      </label>
                      <input
                        type="number"
                        id="updateStakingYield"
                        name="updateStakingYield"
                        value={formData.updateStakingYield}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="新的质押收益率"
                      />
                    </div>

                    <div>
                      <label htmlFor="updatePassThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        通过阈值 (%)
                      </label>
                      <input
                        type="number"
                        id="updatePassThreshold"
                        name="updatePassThreshold"
                        value={formData.updatePassThreshold}
                        onChange={handleInputChange}
                        min="1"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="新的通过阈值"
                      />
                    </div>

                    <div>
                      <label htmlFor="updateMinStaking" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        最小质押量 (SUI)
                      </label>
                      <input
                        type="number"
                        id="updateMinStaking"
                        name="updateMinStaking"
                        value={formData.updateMinStaking}
                        onChange={handleInputChange}
                        min="0.1"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="新的最小质押量"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 金库提款参数 */}
              {formData.proposalType === 'withdrawTreasury' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    金库提款参数
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        提款金额 (SUI) *
                      </label>
                      <input
                        type="number"
                        id="withdrawAmount"
                        name="withdrawAmount"
                        value={formData.withdrawAmount}
                        onChange={handleInputChange}
                        required
                        min="0.1"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="提款金额"
                      />
                    </div>

                    <div>
                      <label htmlFor="withdrawRecipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        接收地址 *
                      </label>
                      <input
                        type="text"
                        id="withdrawRecipient"
                        name="withdrawRecipient"
                        value={formData.withdrawRecipient}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="0x..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 交易状态显示 */}
              {txHash && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    ✅ 提案创建成功！交易哈希: 
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
                  {isLoading ? '创建中...' : '创建提案'}
                </button>
              </div>
            </form>
          </div>

          {/* 使用说明 */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              💡 参数填写指南
            </h3>
            <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
              <div>
                <p className="font-medium">📋 基本信息参数：</p>
                <ul className="ml-4 space-y-1">
                  <li>• <strong>DAO状态ID:</strong> 
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>- 点击刷新按钮从链上获取已创建的DAO列表</li>
                      <li>- 从下拉列表选择DAO，或手动输入完整的对象ID</li>
                      <li>- 格式：0x开头的64位十六进制字符串（如：0x1234...5678）</li>
                      <li>- 获取方式：创建DAO时返回的对象ID，或在Sui Explorer上查看</li>
                    </ul>
                  </li>
                  <li>• <strong>提案标题:</strong> 简洁明了的提案名称，建议不超过50个字符</li>
                  <li>• <strong>提案描述:</strong> 详细说明提案的背景、目标和预期影响</li>
                  <li>• <strong>提案类型:</strong> 选择&quot;更新DAO配置&quot;或&quot;金库提款&quot;</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">⚙️ DAO配置更新参数：</p>
                <ul className="ml-4 space-y-1">
                  <li>• <strong>多签阈值:</strong> 1-10之间的整数，表示需要多少个签名者批准</li>
                  <li>• <strong>投票期限:</strong> 1-30天，社区投票的持续时间</li>
                  <li>• <strong>法定人数:</strong> 参与投票的最小人数要求</li>
                  <li>• <strong>质押收益率:</strong> 0-100%，DAO代币的年化收益率</li>
                  <li>• <strong>通过阈值:</strong> 1-100%，提案通过所需的最低赞成票比例</li>
                  <li>• <strong>最小质押量:</strong> 以SUI为单位，参与治理的最小质押要求</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">💰 金库提款参数：</p>
                <ul className="ml-4 space-y-1">
                  <li>• <strong>提款金额:</strong> 以SUI为单位，要提取的资金数量</li>
                  <li>• <strong>接收地址:</strong> 资金接收方的Sui地址（0x开头）</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">🔄 提案流程：</p>
                <ul className="ml-4 space-y-1">
                  <li>• <strong>创建阶段:</strong> 填写表单并提交到区块链</li>
                  <li>• <strong>多签阶段:</strong> DAO签名者审查和批准提案</li>
                  <li>• <strong>投票阶段:</strong> 社区成员参与投票表决</li>
                  <li>• <strong>执行阶段:</strong> 根据投票结果自动执行或否决</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
