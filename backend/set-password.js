// Set admin password and run reset-admin
process.env.ADMIN_PASSWORD = 'aaAA11!!';

// Import and run the reset-admin module
const { exec } = require('child_process');
const path = require('path');

exec('npx ts-node src/reset-admin.ts', {
  cwd: __dirname,
  env: { ...process.env, ADMIN_PASSWORD: 'aaAA11!!' }
}, (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log(stdout);
  if (stderr) console.error(stderr);
});
