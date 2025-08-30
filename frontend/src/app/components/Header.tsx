'use client';

import { ConnectButton } from '@mysten/dapp-kit';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-900/20 dark:bg-blue-950/30 backdrop-blur-md border-b border-blue-800/30 dark:border-blue-900/40 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🚀</span>
            <span className="text-xl font-bold text-white dark:text-slate-100">
              SuiDao
            </span>
          </Link>

          {/* 导航菜单 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-blue-200 dark:text-blue-300 hover:text-white dark:hover:text-slate-100 transition-colors duration-200 font-medium"
            >
              首页
            </Link>
            <Link 
              href="/dao/create" 
              className="text-blue-200 dark:text-blue-300 hover:text-white dark:hover:text-slate-100 transition-colors duration-200 font-medium"
            >
              创建DAO
            </Link>
            <Link 
              href="/dao/list" 
              className="text-blue-200 dark:text-blue-300 hover:text-white dark:hover:text-slate-100 transition-colors duration-200 font-medium"
            >
              DAO列表
            </Link>
            <Link 
              href="/proposals" 
              className="text-blue-200 dark:text-blue-300 hover:text-white dark:hover:text-slate-100 transition-colors duration-200 font-medium"
            >
              提案
            </Link>
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
