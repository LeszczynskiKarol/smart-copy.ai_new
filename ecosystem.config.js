module.exports = {
  apps: [
    {
      name: "smart-backend",
      cwd: "/var/www/smart-copy.ai_new/backend",
      script: "npx",
      args: "tsx src/index.ts",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
        NODE_OPTIONS: "--max-old-space-size=1024",
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      error_file: "/var/www/smart-copy.ai_new/logs/backend-error.log",
      out_file: "/var/www/smart-copy.ai_new/logs/backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
    },
  ],
};
