#!/usr/bin/env node
/**
 * e2e на собранном образе: docker build → docker run → playwright → остановка.
 * BASE_URL задан — тесты идут по нему без сборки (приёмка на стенде или проде).
 */
import { execSync, spawnSync } from 'node:child_process';

const IMAGE = 'po-helper-landing:e2e';
const NAME = 'po-helper-landing-e2e';
const PORT = process.env.E2E_PORT ?? '8080';

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

if (process.env.BASE_URL) {
  const r = spawnSync('npx', ['playwright', 'test'], { stdio: 'inherit' });
  process.exit(r.status ?? 1);
}

try {
  execSync('docker info', { stdio: 'ignore' });
} catch {
  console.error('Docker не запущен: e2e идут против собранного образа. Запустите Docker или задайте BASE_URL.');
  process.exit(1);
}

sh(`docker build -t ${IMAGE} .`);
try { execSync(`docker rm -f ${NAME}`, { stdio: 'ignore' }); } catch { /* контейнера не было */ }
sh(`docker run -d --name ${NAME} -p ${PORT}:80 ${IMAGE}`);
let status = 1;
try {
  const r = spawnSync('npx', ['playwright', 'test'], {
    stdio: 'inherit',
    env: { ...process.env, BASE_URL: `http://localhost:${PORT}` },
  });
  status = r.status ?? 1;
} finally {
  try { execSync(`docker rm -f ${NAME}`, { stdio: 'ignore' }); } catch { /* уже нет */ }
}
process.exit(status);
