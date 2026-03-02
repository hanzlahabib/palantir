module.exports = {
  apps: [
    {
      name: "palantir-backend",
      script: "server/index.ts",
      interpreter: "tsx",
      cwd: "/home/palantir.hanzla.com/app",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/home/palantir.hanzla.com/logs/error.log",
      out_file: "/home/palantir.hanzla.com/logs/out.log",
      merge_logs: true,
    },
  ],
};
