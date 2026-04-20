#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function killPorts() {
  const ports = [3000, 24678];
  
  for (const port of ports) {
    try {
      if (process.platform === 'win32') {
        // Windows
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(parseInt(pid))) {
            try {
              await execAsync(`taskkill /PID ${pid} /F`);
              console.log(`✓ Killed process on port ${port} (PID: ${pid})`);
            } catch (err) {
              // Process may already be dead
            }
          }
        }
      } else if (process.platform === 'darwin' || process.platform === 'linux') {
        // macOS and Linux
        try {
          await execAsync(`lsof -ti:${port} | xargs kill -9`);
          console.log(`✓ Killed process on port ${port}`);
        } catch (err) {
          // Port may be free
        }
      }
    } catch (err) {
      // Port may already be free, continue
    }
  }
  
  console.log('Ports cleaned up. Starting server...\n');
}

killPorts().catch(console.error);
