#!/usr/bin/env node
/**
 * sync-qa-agent.mjs — 把 GitHub 上的 skill-qa-agent 构建成同源静态产物，放进 public/qa-agent。
 *
 * 用法：
 *   npm run sync:qa                     # 从 GitHub 下载 zip 后构建
 *   npm run sync:qa -- <本地源码目录>    # 用本地已有源码构建（离线也能跑）
 *
 * 安全约束：构建期间临时移走 .env.local，确保 VITE_LLM_API_KEY 不会打进公开静态包；
 * 产物一律以 Mock 离线模式运行。base 用相对 './'，站点部署在任意子路径都不会 404。
 */
import { execFileSync, execSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEST = join(ROOT, 'public', 'qa-agent');
const REPO_ZIP = 'https://codeload.github.com/Jader-S/skill-qa-agent/zip/refs/heads/main';
const localSrcArg = process.argv[2];

const log = (msg) => console.log(`[sync:qa] ${msg}`);
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit', shell: true });

/** Windows 自带 bsdtar 会把 `C:\...` 误判成远程主机，改用系统 PowerShell 的 Expand-Archive。 */
function unzip(zip, dest) {
  if (process.platform === 'win32') {
    execFileSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        `Expand-Archive -LiteralPath '${zip}' -DestinationPath '${dest}' -Force`,
      ],
      { stdio: 'inherit' },
    );
  } else {
    execFileSync('tar', ['-xf', zip, '-C', dest], { stdio: 'inherit' });
  }
}

function dirSize(dir) {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    total += statSync(p).isDirectory() ? dirSize(p) : statSync(p).size;
  }
  return total;
}

async function main() {
  const work = join(tmpdir(), 'astra-qa-agent-sync');
  rmSync(work, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });

  let src;
  if (localSrcArg) {
    src = resolve(localSrcArg);
    if (!existsSync(join(src, 'package.json'))) {
      throw new Error(`目录里没有 package.json：${src}`);
    }
    log(`使用本地源码：${src}`);
  } else {
    const zip = join(work, 'src.zip');
    log(`下载仓库：${REPO_ZIP}`);
    const res = await fetch(REPO_ZIP);
    if (!res.ok) throw new Error(`下载失败，HTTP ${res.status}`);
    writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
    log('解压…');
    unzip(zip, work);
    const entry = readdirSync(work).find(
      (n) => n.startsWith('skill-qa-agent-') && statSync(join(work, n)).isDirectory(),
    );
    if (!entry) throw new Error('解压后没找到源码目录');
    src = join(work, entry);
  }

  const envLocal = join(src, '.env.local');
  const envBackup = join(src, '.env.local.sync-backup');
  const hadEnv = existsSync(envLocal);
  if (hadEnv) {
    rmSync(envBackup, { force: true });
    renameSync(envLocal, envBackup);
    log('已临时移开 .env.local，防止真实 Key 打进构建产物');
  }

  try {
    log('安装依赖…');
    run('npm install --no-audit --no-fund', src);
    log('构建（base=./，Mock 离线模式）…');
    const out = join(src, '.qa-dist');
    run('npx vite build --base=./ --outDir .qa-dist --emptyOutDir', src);
    if (!existsSync(join(out, 'index.html'))) throw new Error('构建产物缺少 index.html');

    log('同步到 public/qa-agent …');
    rmSync(DEST, { recursive: true, force: true });
    mkdirSync(DEST, { recursive: true });
    cpSync(out, DEST, { recursive: true });
    log(`完成，共 ${(dirSize(DEST) / 1024 / 1024).toFixed(2)} MB`);
  } finally {
    if (hadEnv) {
      renameSync(envBackup, envLocal);
      log('已还原 .env.local');
    }
    if (!localSrcArg) rmSync(work, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(`[sync:qa] 失败：${err.message}`);
  process.exitCode = 1;
});
