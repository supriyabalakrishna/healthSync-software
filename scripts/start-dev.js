const { spawn } = require('child_process');
const path = require('path');

function startProcess(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    detached: false,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      process.exitCode = code;
    }
  });

  return child;
}

const root = path.resolve(__dirname, '..');

startProcess('backend', 'npm', ['run', 'dev'], path.join(root, 'backend'));
startProcess('frontend', 'npm', ['run', 'dev'], path.join(root, 'frontend'));

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));