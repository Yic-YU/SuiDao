# 🚀 SuiDao - Sui区块链去中心化应用

基于Sui区块链构建的现代化去中心化应用，使用Next.js框架和Sui官方SDK。

## ✨ 特性

- 🔗 **钱包连接**：支持Sui钱包扩展连接
- 🌐 **多网络支持**：支持Devnet、Testnet、Mainnet
- 📱 **响应式设计**：现代化的UI设计，支持移动端
- 🚀 **快速开发**：基于Next.js 15和React 19
- 🎨 **美观界面**：使用Tailwind CSS构建
- 📊 **实时数据**：查询Sui区块链上的对象和账户信息

## 🛠️ 技术栈

- **前端框架**: Next.js 15 (App Router)
- **区块链SDK**: @mysten/sui
- **dApp工具包**: @mysten/dapp-kit
- **状态管理**: @tanstack/react-query
- **样式框架**: Tailwind CSS 4
- **开发语言**: TypeScript
- **包管理器**: pnpm

## 📋 前置要求

- Node.js 18.17 或更高版本
- pnpm 包管理器
- Sui钱包扩展

## 🚀 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动开发服务器
```bash
pnpm dev
```

### 3. 打开浏览器
访问 http://localhost:3000 查看应用

## 🔧 项目结构

```
frontend/
├── src/app/
│   ├── layout.tsx          # 根布局，包含Sui Provider配置
│   ├── page.tsx            # 主页面，包含钱包连接和账户信息
│   ├── providers.tsx       # Sui Provider配置
│   └── globals.css         # 全局样式
├── public/                 # 静态资源
└── package.json            # 项目依赖配置
```

## 🌐 网络配置

应用默认连接到Sui Devnet网络，支持：
- Devnet (开发测试网络，默认)
- Testnet (测试网络)
- Mainnet (主网)

## 💼 钱包集成

支持的钱包：
- Sui Wallet (官方推荐)
- Sui Wallet Standard
- 其他兼容Wallet Standard的钱包

## 📱 主要功能

1. **钱包连接** - 支持多种Sui钱包
2. **账户信息显示** - 显示钱包地址和标签
3. **对象查询** - 查询账户拥有的Sui对象
4. **网络状态监控** - 显示当前连接的网络状态

## 🐛 故障排除

### 常见问题

1. **钱包连接失败**
   - 确保Sui钱包扩展已安装并更新
   - 检查钱包网络设置是否与dApp一致
   - 刷新页面重试

2. **网络连接问题**
   - 检查网络配置是否正确
   - 查看浏览器控制台错误信息

3. **依赖安装失败**
   - 使用pnpm包管理器
   - 清除node_modules并重新安装

## 📚 相关资源

- [Sui官方文档](https://docs.sui.io/)
- [Sui TypeScript SDK](https://docs.sui.io/guides/developer/first-app/client-tssdk)
- [Next.js文档](https://nextjs.org/docs)

## 🚀 部署

### 构建生产版本
```bash
pnpm build
```

### 启动生产服务器
```bash
pnpm start
```

---

**注意**: 这是一个开发中的项目，请在生产环境中使用前进行充分测试。
