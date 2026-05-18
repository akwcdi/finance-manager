'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

const MIN_AGE_DAYS = 3;
const MIN_AGE_MS = MIN_AGE_DAYS * 24 * 60 * 60 * 1000;
const CACHE_PATH = path.join(__dirname, '.pnpm-freshness-cache.json');

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch (e) {
    process.stderr.write(`[pnpm-freshness] Warning: could not save cache: ${e.message}\n`);
  }
}

function fetchPublishTime(name, version) {
  return new Promise((resolve) => {
    const url = `https://registry.npmjs.org/${name}`;
    const req = https.get(url, { headers: { Accept: 'application/json' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const t = json.time?.[version];
          resolve(t ? new Date(t) : null);
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(15000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

module.exports = {
  hooks: {
    async afterAllResolved(lockfile) {
      if (process.env.SKIP_FRESHNESS_CHECK === '1') return lockfile;

      const cache = loadCache();
      const now = Date.now();
      const tooFresh = [];
      const toCheck = [];

      for (const pkgKey of Object.keys(lockfile.packages || {})) {
        // "@scope/name@version" or "name@version"
        const atIdx = pkgKey.startsWith('@') ? pkgKey.indexOf('@', 1) : pkgKey.indexOf('@');
        if (atIdx <= 0) continue;

        const name = pkgKey.slice(0, atIdx);
        // strip peer-dep suffix: "1.2.3(peer@1.0.0)" → "1.2.3"
        const version = pkgKey.slice(atIdx + 1).replace(/[(_].*$/, '');
        const cacheKey = `${name}@${version}`;

        if (cacheKey in cache) {
          const iso = cache[cacheKey];
          if (iso && now - new Date(iso).getTime() < MIN_AGE_MS) {
            tooFresh.push({ name, version, publishTime: iso });
          }
        } else {
          toCheck.push({ name, version, cacheKey });
        }
      }

      if (toCheck.length > 0) {
        process.stderr.write(
          `\n[pnpm-freshness] Checking ${toCheck.length} new package(s) against npm registry...\n`
        );

        const CONCURRENCY = 8;
        let idx = 0;
        async function worker() {
          while (idx < toCheck.length) {
            const { name, version, cacheKey } = toCheck[idx++];
            const publishTime = await fetchPublishTime(name, version);
            const iso = publishTime ? publishTime.toISOString() : null;
            cache[cacheKey] = iso;
            if (publishTime && now - publishTime.getTime() < MIN_AGE_MS) {
              tooFresh.push({ name, version, publishTime: iso });
            }
          }
        }
        await Promise.all(
          Array.from({ length: Math.min(CONCURRENCY, toCheck.length) }, worker)
        );
        saveCache(cache);
      }

      if (tooFresh.length > 0) {
        const list = tooFresh
          .map((p) => `  - ${p.name}@${p.version} (published: ${p.publishTime})`)
          .join('\n');
        throw new Error(
          `\n[pnpm-freshness] The following packages were published within the last ${MIN_AGE_DAYS} days:\n${list}\n\n` +
            `Use an older version, or bypass with: SKIP_FRESHNESS_CHECK=1 pnpm install\n`
        );
      }

      return lockfile;
    },
  },
};
