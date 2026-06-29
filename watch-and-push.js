// watch-and-push.js - Automated GitHub Synchronization Script
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEBOUNCE_MS = 5000; // Wait 5 seconds after the last change before pushing
let timeoutId = null;

// Folders and files to ignore
const IGNORED_PATHS = [
  'node_modules',
  '.git',
  '.vercel',
  'package-lock.json',
  'watch-and-push.js'
];

function shouldIgnore(filePath) {
  return IGNORED_PATHS.some(ignored => filePath.includes(ignored));
}

function runGitSync() {
  console.log('\n🔄 Workspace modification detected. Staging changes...');
  
  exec('git add .', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Error staging files:', stderr);
      return;
    }
    
    // Check if there are any changes to commit
    exec('git status --porcelain', (statusErr, statusOut) => {
      if (statusErr) {
        console.error('❌ Error checking status:', statusErr);
        return;
      }
      
      if (!statusOut.trim()) {
        console.log('✅ No changes to push.');
        return;
      }

      console.log('📝 Changes detected:\n' + statusOut);
      const commitMsg = `auto: sync changes - ${new Date().toLocaleTimeString()}`;

      exec(`git commit -m "${commitMsg}"`, (commitErr, commitOut, commitStderr) => {
        if (commitErr) {
          console.error('❌ Error committing changes:', commitStderr);
          return;
        }
        
        console.log('🚀 Pushing to GitHub (origin/main)...');
        exec('git push origin main', (pushErr, pushOut, pushStderr) => {
          if (pushErr) {
            console.error('❌ Error pushing to GitHub:', pushStderr);
            return;
          }
          console.log('🎉 Successfully synchronized to GitHub!');
        });
      });
    });
  });
}

function watchDirectory(dirPath) {
  fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
    if (!filename || shouldIgnore(filename)) return;

    // Reset debounce timer
    if (timeoutId) clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      runGitSync();
    }, DEBOUNCE_MS);
  });
}

console.log('✨ Lumina Auto-Sync Engine Active ✨');
console.log('Watching for local file changes (ignoring node_modules & git files)...');
watchDirectory(path.resolve(__dirname));
