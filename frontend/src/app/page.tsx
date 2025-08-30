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
      <div className="relative z-10 container mx-auto px-6 py-32">
        {/* 主标题区域 */}
        <div className="text-center mb-24">
          {/* 主标题 */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-white dark:text-slate-100 mb-10 tracking-tight leading-none">
            <span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
              Agora
            </span>
          </h1>
          
          {/* Primary Slogan */}
          <div className="mb-16">
            <p className="text-2xl md:text-3xl lg:text-4xl text-blue-50 dark:text-blue-100 font-light leading-relaxed max-w-5xl mx-auto tracking-wide">
              The home of{' '}
              <span className="font-semibold text-white">Sui DAOs</span>.
            </p>
          </div>
          
          {/* Secondary Slogan */}
          <div className="mb-20">
            <p className="text-lg md:text-xl lg:text-2xl text-blue-100 dark:text-blue-200 leading-relaxed max-w-6xl mx-auto font-light tracking-wide">
              <span className="font-medium text-white">Agora</span>, where{' '}
              <span className="italic text-blue-50">On-Chain Collaboration</span> happens.{' '}
              <br className="hidden md:block" />
              Propose, co-create, and govern the next wave of{' '}
              <span className="font-semibold text-white">Sui innovation</span>.
            </p>
          </div>
          
          {/* 按钮区域 */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            {/* Access App 按钮 */}
            <Link
              href="/dao/create"
              className="group inline-flex items-center justify-center bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-lg md:text-xl px-10 py-5 rounded-2xl transition-all duration-500 transform hover:scale-110 hover:shadow-2xl shadow-xl border-0 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <img 
                  src="/sui-sui-logo.svg" 
                  alt="Sui Logo" 
                  className="w-6 h-6"
                />
                <span>Access App</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            </Link>
            
            {/* Documentation 按钮 */}
            <a
              href="https://github.com/Yic-YU/SuiDao"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-lg md:text-xl px-10 py-5 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl border border-white/30 hover:border-white/50 relative overflow-hidden"
            >
              <span className="relative z-10">📚 Documentation</span>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            </a>
          </div>
        </div>

        {/* 钱包连接区域 */}
        {!account && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white/10 dark:bg-slate-800/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-white/20 dark:border-slate-700/50 hover:border-white/30 transition-all duration-500">
              <div className="text-4xl mb-4">🔐</div>
              <p className="text-white dark:text-slate-100 mb-6 text-lg font-medium">
                连接您的Sui钱包以访问完整功能
              </p>
              <div className="transform hover:scale-105 transition-transform duration-300">
                <ConnectButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
