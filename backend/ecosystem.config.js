module.exports = {
  apps: [
    {
      name: 'uhdms-backend',
      script: 'src/server.js',
      cwd: '/home/huhelpdesk/uhdms/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
