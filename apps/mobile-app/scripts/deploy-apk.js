const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Helper to run a command and log output in real-time
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')} in ${cwd}`);
    const proc = spawn(command, args, { cwd, stdio: 'inherit', shell: true });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

async function main() {
  const isWindows = os.platform() === 'win32';
  
  // Resolve paths
  const mobileAppDir = path.resolve(__dirname, '..');
  const androidDir = path.resolve(mobileAppDir, 'android');
  const buildOutputsDir = path.resolve(androidDir, 'app/build/outputs/apk/release');
  const apkPath = path.resolve(buildOutputsDir, 'app-release.apk');
  const distDir = path.resolve(mobileAppDir, 'dist');
  const targetApkPath = path.resolve(distDir, 'garudaastra-release.apk');

  console.log('--- Garuda A.S.T.R.A APK Release Deployment Tool ---');
  console.log(`Platform: ${os.platform()} (${isWindows ? 'Windows' : 'Unix'})`);
  console.log(`Mobile App Directory: ${mobileAppDir}`);
  console.log(`Android Project Directory: ${androidDir}\n`);

  // Step 1: Clean build outputs if they exist to prevent deploying stale files
  if (fs.existsSync(apkPath)) {
    console.log('Cleaning existing release APK build output...');
    fs.unlinkSync(apkPath);
  }

  // Step 2: Build release APK locally
  const gradleCmd = isWindows ? 'gradlew.bat' : './gradlew';
  console.log('Starting local Android release build...');
  
  try {
    await runCommand(gradleCmd, ['assembleRelease'], androidDir);
    console.log('\n✔ Gradle build compiled successfully!');
  } catch (error) {
    console.error(`\n❌ Gradle build failed: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Verify APK was created
  if (!fs.existsSync(apkPath)) {
    console.error(`\n❌ Error: Built APK not found at: ${apkPath}`);
    process.exit(1);
  }
  console.log(`✔ Release APK found at: ${apkPath}`);

  // Step 4: Get remote URL of the git repository
  let remoteUrl = '';
  try {
    remoteUrl = execSync('git config --get remote.origin.url', { cwd: mobileAppDir }).toString().trim();
    console.log(`✔ Detected Git remote: ${remoteUrl}`);
  } catch (error) {
    console.error('\n❌ Error: Failed to retrieve git remote URL. Is this a Git repository?');
    process.exit(1);
  }

  // Step 5: Copy APK to dist folder and commit to the current branch
  console.log('\nPreparing deployment packaging...');
  try {
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
    }
    fs.copyFileSync(apkPath, targetApkPath);
    console.log('✔ Copied APK to dist/garudaastra-release.apk');

    // Run Git commands in the mobile app directory
    const runGit = (args) => {
      return execSync(`git ${args}`, { cwd: mobileAppDir, stdio: 'pipe' }).toString().trim();
    };

    // Find the current active branch
    const currentBranch = runGit('rev-parse --abbrev-ref HEAD');
    console.log(`✔ Current branch: ${currentBranch}`);

    console.log('Staging the APK...');
    // -f forces staging even if dist/ is ignored in gitignore
    runGit('add -f dist/garudaastra-release.apk');

    // Check if the APK has actually changed
    const status = runGit('status --porcelain dist/garudaastra-release.apk');
    if (status) {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      console.log('Committing APK (only the APK file is committed)...');
      runGit(`commit -m "Release APK Build - ${timestamp}" dist/garudaastra-release.apk`);
    } else {
      console.log('✔ APK binary is already up to date with the latest commit.');
    }

    console.log(`Pushing to GitHub (branch: ${currentBranch})...`);
    runGit(`push origin ${currentBranch}`);

    console.log('\n✔ Successfully deployed APK to GitHub repository!');
    
    console.log('\n-------------------------------------------------------------');
    console.log('🚀 UBUNTU NGINX DOWNLOAD LINK:');
    console.log('https://app.garudaastra.dpdns.org');
    console.log('-------------------------------------------------------------');
  } catch (error) {
    console.error(`\n❌ Deployment failed: ${error.stdout ? error.stdout.toString() : error.message}`);
  }
}

main();
