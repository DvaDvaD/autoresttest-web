module.exports = {
  apps: [
    {
      name: "autoresttest-web", // Name of your application
      script: "pnpm", // Or 'yarn' if you use Yarn
      args: "start", // Command to start your Next.js app (e.g., 'next start' or a custom 'start' script in package.json)
      autorestart: true, // Automatically restart the app if it crashes
      watch: false, // Set to true to enable watching for file changes and automatic restarts
      env: {
        NODE_ENV: "production", // Environment variables
      },
      // Optional: Log files for stdout and stderr
      // out_file: './logs/stdout.log',
      // error_file: './logs/stderr.log',
    },
  ],
};
