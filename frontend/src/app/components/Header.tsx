'use client';

import { ConnectButton } from '@mysten/dapp-kit';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isProposalsOpen, setIsProposalsOpen] = useState(false);

  return (
    <header className="bg-blue-900/20 dark:bg-blue-950/30 backdrop-blur-md border-b border-blue-800/30 dark:border-blue-900/40 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <img 
              src="/sui-sui-logo.svg" 
              alt="Sui Logo" 
              className="w-8 h-8 transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 dark:from-white dark:via-blue-50 dark:to-indigo-100 tracking-wide">
              Agora
            </span>
          </Link>

          {/* 导航菜单 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-blue-100 dark:text-blue-200 hover:text-white dark:hover:text-slate-50 transition-all duration-300 font-semibold tracking-wide hover:scale-105 transform"
            >
              首页
            </Link>
            <Link 
              href="/dao/create" 
              className="text-blue-100 dark:text-blue-200 hover:text-white dark:hover:text-slate-50 transition-all duration-300 font-semibold tracking-wide hover:scale-105 transform"
            >
              创建DAO
            </Link>
            <Link 
              href="/dao/list" 
              className="text-blue-100 dark:text-blue-200 hover:text-white dark:hover:text-slate-50 transition-all duration-300 font-semibold tracking-wide hover:scale-105 transform"
            >
              DAO列表
            </Link>
            
            {/* 提案下拉菜单 */}
            <div className="relative">
              <button
                onClick={() => setIsProposalsOpen(!isProposalsOpen)}
                className="text-blue-100 dark:text-blue-200 hover:text-white dark:hover:text-slate-50 transition-all duration-300 font-semibold tracking-wide hover:scale-105 transform flex items-center space-x-1"
              >
                <span>提案</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${isProposalsOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isProposalsOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                  <Link
                    href="/proposals"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={() => setIsProposalsOpen(false)}
                  >
                    📝 创建提案
                  </Link>
                  <Link
                    href="/proposals/list"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={() => setIsProposalsOpen(false)}
                  >
                    📋 提案列表
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* 钱包连接 */}
          <div className="flex items-center space-x-4">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
