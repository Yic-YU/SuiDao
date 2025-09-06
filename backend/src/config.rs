use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub database_url: String,
    pub sui_rpc_url: String,
    pub package_id: String,
    pub dao_module: String,
    pub proposal_module: String,
    pub port: u16,
}

impl Config {
    pub fn load() -> anyhow::Result<Self> {
        // 加载 .env（如果存在）
        let _ = dotenvy::dotenv();
        // 从环境变量加载配置
        let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
            // 默认指向 docker-compose 启动的本地 Postgres
            "postgres://suidao:suidao@localhost:5432/suidao".to_string()
        });
        
        let sui_rpc_url = env::var("SUI_RPC_URL")
            .unwrap_or_else(|_| "https://fullnode.testnet.sui.io:443".to_string());
        
        let package_id = env::var("PACKAGE_ID")
            .unwrap_or_else(|_| "0x452132cebeab22eb484ea649bf5f2145b1eb5d49a1bf5993ed6a3bfe2e741d24".to_string());
        
        let dao_module = env::var("DAO_MODULE")
            .unwrap_or_else(|_| "dao".to_string());
        
        let proposal_module = env::var("PROPOSAL_MODULE")
            .unwrap_or_else(|_| "proposal".to_string());
        
        let port = env::var("PORT")
            .unwrap_or_else(|_| "3001".to_string())
            .parse()
            .unwrap_or(3001);

        Ok(Config {
            database_url,
            sui_rpc_url,
            package_id,
            dao_module,
            proposal_module,
            port,
        })
    }
}
