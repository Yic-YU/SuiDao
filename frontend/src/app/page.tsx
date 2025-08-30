'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import Link from 'next/link';

export default function Home() {
  const account = useCurrentAccount();

  return (
    <div className="relative min-h-screen">
      {/* 水滴背景装饰 */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        {/* 大水滴水印 */}
        <div className="absolute -left-32 -top-32 w-[500px] h-[500px] waterdrop"></div>
        <div className="absolute -left-20 -top-20 w-96 h-96 waterdrop-indigo"></div>
        
        {/* 中等水滴水印 */}
        <div className="absolute left-1/4 top-1/3 w-80 h-80 waterdrop"></div>
        <div className="absolute left-1/3 top-1/4 w-72 h-72 waterdrop-indigo"></div>
        
        {/* 小水滴水印 */}
        <div className="absolute right-1/4 bottom-1/4 w-48 h-48 waterdrop"></div>
        <div className="absolute right-1/3 bottom-1/3 w-40 h-40 waterdrop-indigo"></div>
        
        {/* 装饰性水滴 */}
        <div className="absolute right-32 top-32 w-32 h-32 waterdrop"></div>
        <div className="absolute left-1/2 top-1/2 w-24 h-24 waterdrop-indigo"></div>
        
        {/* 额外的小水滴装饰 */}
        <div className="absolute right-1/4 top-1/4 w-20 h-20 waterdrop"></div>
        <div className="absolute left-1/5 bottom-1/5 w-28 h-28 waterdrop-indigo"></div>
      </div>
      
      {/* 内容层 */}
      <div className="relative z-10 container mx-auto px-4 py-24">
        {/* 主标题区域 */}
        <div className="text-center mb-20">
          {/* 主标题 */}
          <h1 className="text-8xl font-bold text-white dark:text-slate-100 mb-8">
            SuiDAO Agora
          </h1>
          
          {/* Primary Slogan */}
          <div className="mb-12">
            <p className="text-3xl text-blue-100 dark:text-blue-200 font-medium leading-relaxed max-w-4xl mx-auto">
              From a single proposal to a community-built future.
            </p>
          </div>
          
          {/* Secondary Slogan */}
          <div className="mb-16">
            <p className="text-xl text-blue-100 dark:text-blue-200 leading-relaxed max-w-5xl mx-auto">
              SuiDAO, where On-Chain Collaboration happens. Propose, co-create, and govern the next wave of Sui innovation.
            </p>
          </div>
          
          {/* 按钮区域 */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {/* Access App 按钮 */}
            <Link
              href="/dao/create"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-lg px-12 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
            >
              Access App
            </Link>
            
            {/* Documentation 按钮 */}
            <a
              href="https://github.com/Yic-YU/SuiDao"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white/20 hover:bg-white/30 text-white font-bold text-lg px-12 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg border border-white/30"
            >
              Documentation
            </a>
          </div>
        </div>

        {/* 钱包连接区域 */}
        {!account && (
          <div className="max-w-md mx-auto">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6 text-center border border-blue-200 dark:border-blue-600">
              <div className="text-2xl mb-3">🔐</div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                连接您的Sui钱包以访问完整功能
              </p>
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
