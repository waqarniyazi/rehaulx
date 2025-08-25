#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Checking for yt-dlp installation...');

// Function to check if yt-dlp is available
function checkYtDlp(command) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Try common yt-dlp commands
const ytDlpCommands = ['yt-dlp', '/usr/local/bin/yt-dlp', '/usr/bin/yt-dlp'];

let ytDlpFound = false;
let ytDlpPath = '';

for (const cmd of ytDlpCommands) {
  if (checkYtDlp(cmd)) {
    ytDlpFound = true;
    ytDlpPath = cmd;
    console.log(`✅ yt-dlp found at: ${ytDlpPath}`);
    break;
  }
}

if (!ytDlpFound) {
  console.log('❌ yt-dlp not found, attempting installation...');
  
  try {
    // Try installing yt-dlp via different methods
    console.log('Trying pip install...');
    execSync('pip install yt-dlp', { stdio: 'inherit' });
    
    if (checkYtDlp('yt-dlp')) {
      console.log('✅ yt-dlp installed successfully via pip');
      ytDlpPath = 'yt-dlp';
    }
  } catch (pipError) {
    console.log('Pip installation failed, trying pip3...');
    try {
      execSync('pip3 install yt-dlp', { stdio: 'inherit' });
      if (checkYtDlp('yt-dlp')) {
        console.log('✅ yt-dlp installed successfully via pip3');
        ytDlpPath = 'yt-dlp';
      }
    } catch (pip3Error) {
      console.log('Python package installation failed, trying binary download...');
      
      try {
        // Try downloading the binary (Linux/macOS)
        const os = require('os');
        const platform = os.platform();
        
        if (platform === 'linux' || platform === 'darwin') {
          const binaryDir = path.join(process.cwd(), 'bin');
          if (!fs.existsSync(binaryDir)) {
            fs.mkdirSync(binaryDir, { recursive: true });
          }
          
          const binaryPath = path.join(binaryDir, 'yt-dlp');
          
          if (platform === 'linux') {
            console.log('Downloading yt-dlp binary for Linux...');
            execSync(`curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ${binaryPath}`, { stdio: 'inherit' });
          } else if (platform === 'darwin') {
            console.log('Downloading yt-dlp binary for macOS...');
            execSync(`curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos -o ${binaryPath}`, { stdio: 'inherit' });
          }
          
          // Make binary executable
          execSync(`chmod +x ${binaryPath}`, { stdio: 'inherit' });
          
          if (checkYtDlp(binaryPath)) {
            console.log(`✅ yt-dlp binary installed successfully at ${binaryPath}`);
            ytDlpPath = binaryPath;
            
            // Create a .env.local file with the path
            const envPath = path.join(process.cwd(), '.env.local');
            let envContent = '';
            
            if (fs.existsSync(envPath)) {
              envContent = fs.readFileSync(envPath, 'utf8');
            }
            
            // Add or update YT_DLP_PATH
            const ytDlpPathLine = `YT_DLP_PATH=${binaryPath}`;
            const lines = envContent.split('\n');
            const existingIndex = lines.findIndex(line => line.startsWith('YT_DLP_PATH='));
            
            if (existingIndex !== -1) {
              lines[existingIndex] = ytDlpPathLine;
            } else {
              lines.push(ytDlpPathLine);
            }
            
            fs.writeFileSync(envPath, lines.join('\n'));
            console.log(`✅ YT_DLP_PATH added to .env.local`);
          }
        }
      } catch (binaryError) {
        console.log('❌ Failed to install yt-dlp via binary download');
        console.log('Please install yt-dlp manually or set YT_DLP_PATH environment variable');
        console.log('Installation instructions: https://github.com/yt-dlp/yt-dlp#installation');
      }
    }
  }
}

// If yt-dlp is found, make sure the path is available
if (ytDlpPath && ytDlpPath !== 'yt-dlp') {
  console.log(`Setting YT_DLP_PATH=${ytDlpPath}`);
  process.env.YT_DLP_PATH = ytDlpPath;
}

console.log('yt-dlp setup complete.');
