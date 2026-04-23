const { execSync } = require('child_process');

const ports = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ['5000', '5173', '5174', '5175'];

function killPort(port) {
  try {
    const output = execSync(`netstat -ano | findstr LISTENING | findstr :${port}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      shell: true,
    }).trim();

    if (!output) {
      return;
    }

    const pids = [...new Set(
      output
        .split(/\r?\n/)
        .map((line) => line.trim().split(/\s+/).pop())
        .filter((pid) => /^\d+$/.test(pid) && pid !== '0')
    )];

    for (const pid of pids) {
      execSync(`taskkill /PID ${pid} /F`, {
        stdio: 'ignore',
        shell: true,
      });
    }

    if (pids.length > 0) {
      console.log(`Freed port ${port} (killed PID${pids.length > 1 ? 's' : ''}: ${pids.join(', ')})`);
    }
  } catch {
    // No listener on this port or netstat/taskkill is unavailable.
  }
}

for (const port of ports) {
  killPort(port);
}