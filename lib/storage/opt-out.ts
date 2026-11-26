import fs from 'fs';
import path from 'path';
import { log } from '../utils/logger';

export interface OptOutRecord {
  username: string;
  email: string;
  reason?: string;
  notes?: string;
  timestamp: string;
}

// Global in-memory set for instantaneous O(1) checks
const memoryBlocklist = new Set<string>();

const BLOCKLIST_FILE = path.join(process.cwd(), 'data', 'opt-out-blocklist.json');

// Pre-load file if present on startup
function loadLocalFile(): void {
  try {
    if (fs.existsSync(BLOCKLIST_FILE)) {
      const data = fs.readFileSync(BLOCKLIST_FILE, 'utf-8');
      const records: OptOutRecord[] = JSON.parse(data);
      for (const rec of records) {
        if (rec.username) {
          memoryBlocklist.add(rec.username.toLowerCase());
        }
      }
    }
  } catch (err) {
    // Non-blocking in serverless or read-only environments
  }
}

loadLocalFile();

function normalizeUsername(username: string): string {
  return username.toLowerCase().replace(/^@/, '').trim();
}

/**
 * Checks if a profile has opted out of public indexing.
 */
export async function isProfileOptedOut(username: string): Promise<boolean> {
  const clean = normalizeUsername(username);
  if (!clean) return false;

  // 1. Instant in-memory check
  if (memoryBlocklist.has(clean)) {
    return true;
  }

  // 2. Upstash Redis check if configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const res = await fetch(`${redisUrl}/sismember/instaview:opt_out_profiles/${encodeURIComponent(clean)}`, {
        headers: { Authorization: `Bearer ${redisToken}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result === 1) {
          memoryBlocklist.add(clean);
          return true;
        }
      }
    } catch (err) {
      log('warn', { action: 'isProfileOptedOut_redis_error', error: String(err) });
    }
  }

  return false;
}

/**
 * Registers an opt-out request for a profile.
 */
export async function addOptOutRecord(
  record: Omit<OptOutRecord, 'timestamp'>
): Promise<boolean> {
  const clean = normalizeUsername(record.username);
  if (!clean) return false;

  const fullRecord: OptOutRecord = {
    ...record,
    username: clean,
    timestamp: new Date().toISOString(),
  };

  // Add to memory
  memoryBlocklist.add(clean);

  // 1. Persist to Upstash Redis if configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      await fetch(`${redisUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['SADD', 'instaview:opt_out_profiles', clean],
          ['HSET', `instaview:opt_out_meta:${clean}`, fullRecord],
        ]),
      });
    } catch (err) {
      log('warn', { action: 'addOptOutRecord_redis_error', error: String(err) });
    }
  }

  // 2. Persist to local JSON file
  try {
    const dir = path.dirname(BLOCKLIST_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let records: OptOutRecord[] = [];
    if (fs.existsSync(BLOCKLIST_FILE)) {
      try {
        records = JSON.parse(fs.readFileSync(BLOCKLIST_FILE, 'utf-8'));
      } catch {
        records = [];
      }
    }

    // Upsert record
    records = records.filter((r) => r.username.toLowerCase() !== clean);
    records.push(fullRecord);

    fs.writeFileSync(BLOCKLIST_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    // Read-only filesystem in some serverless environments
    log('info', { action: 'addOptOutRecord_file_skip', note: 'Read-only fs or local write skipped' });
  }

  log('info', { action: 'profile_opted_out', username: clean });
  return true;
}

/**
 * Returns total number of opted-out profiles.
 */
export async function getOptOutCount(): Promise<number> {
  return memoryBlocklist.size;
}
