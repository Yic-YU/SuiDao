'use client';

import { ConnectButton } from '@mysten/dapp-kit';
import Link from 'next/link';

export default function Header() {
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
            <Link 
              href="/proposals" 
              className="text-blue-100 dark:text-blue-200 hover:text-white dark:hover:text-slate-50 transition-all duration-300 font-semibold tracking-wide hover:scale-105 transform"
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
