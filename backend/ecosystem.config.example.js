module.exports = {
  apps: [
    {
      name: "vpn-backend",
      script: "./server.js",
      cwd: "/root/path_to_project_folder/backend",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        REACT_APP_FRONTEND_URL: "https://your-domain.com",
        SERVER_PUBLIC_KEY: "your_wireguard_public_key",
        SERVER_ENDPOINT: "your_server_ip:51820",
        DNS_SERVER: "1.1.1.1,8.8.8.8",
        VPN_SUBNET_MASK: 24,
        ROOT_ADMIN_USERNAME: "admin",
        ROOT_ADMIN_PASSWORD: "admin_password",
        JWT_SECRET: "your_jwt_secret_key",
        JWT_EXPIRES_IN: "1h",
        DEMO_CLEANUP_INTERVAL: 1800000,
        WG_INTERFACE: "wg0",
      },
    },
  ],
};
