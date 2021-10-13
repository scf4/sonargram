// import { brotliDecompressSync, brotliCompressSync } from 'zlib';
import Redis from 'ioredis';
import { v5 as uuid5, validate } from 'uuid';
import { customAlphabet } from 'nanoid'
import type { SonarId } from 'lib/types';

export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

const UUID_NAMESPACE = '092020d1-f397-5954-b5c0-77d07b10d044';

const nanoid = customAlphabet('256789bcdfglmnpqrstvwyz', 4);

const connectionString = process.env.REDISCLOUD_URL;

const redis = new Redis(connectionString, {
  keepAlive: 1,
  showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
  reconnectOnError: () => true,
  retryStrategy: numRetries => Math.min(numRetries * 375, 2000),
});

redis.on('end', async () => {
  await redis.connect();
});

async function saveRoomData(internalRoomId: string, data: any) {
  const key = `room:${internalRoomId}`;

  // Nvm, remove data
  try {
    const numSaves = await redis.llen(key);
    if (numSaves >= 4) {
      await redis.rpop(key);
      await redis.rpop(key);
    }
  } catch {}

  await redis.rpush(key, JSON.stringify(data));
}

async function loadRoomData(internalRoomId: string, id = -1) {
  const key = `room:${internalRoomId}`;

  let data: any = await redis.lindex(key, id);

  // Compress any remaining JSON
  if (isJSON(data)) {
    // const compressed = compress(data);
    // redis.lset(key, id, compressed);
    return JSON.parse(data);
  }

  console.error(data);
}

function getRoomIdFromSonarId(sonarRoomId: SonarId) {
  return uuid5(sonarRoomId.toString(), UUID_NAMESPACE);
}

async function getUrlCodeFromRoomId(internalRoomId: string) {
  const key = `room:${internalRoomId}:code`;
  const urlCode = await redis.get(key);

  return urlCode;
}

async function getRoomIdFromUrlCode(urlCode: string) {
  const key = `code:${urlCode}`;
  const id = await redis.get(key);

  return validate(id ?? '') && id;
}

async function getRoomIdFromUrlSlug(urlSlug: string) {
  const key = `slug:${urlSlug}`;
  const id = await redis.get(key);

  return id;
}

async function createUrlCodeFromRoomId(internalRoomId: string): Promise<string> {
  const urlCode = nanoid();

  const urlCodeKey = `code:${urlCode}`;
  const roomIdKey = `room:${internalRoomId}:code`;

  if (await redis.exists(urlCodeKey)) {
    return createUrlCodeFromRoomId(internalRoomId);
  }

  await redis.msetnx(urlCodeKey, internalRoomId, roomIdKey, urlCode);

  const resp = await getUrlCodeFromRoomId(internalRoomId);

  return resp ?? '';
}

function isJSON(str: any) {
  if (typeof str !== 'string') return false;
  if (str.includes('{') || str.includes('[')) return true;
  let ret = true;
  try { JSON.parse(str); } catch { ret = false; }
  return JSON.stringify(ret);
}

export {
  saveRoomData,
  loadRoomData,
  createUrlCodeFromRoomId,
  getUrlCodeFromRoomId,
  getRoomIdFromSonarId,
  getRoomIdFromUrlCode,
  getRoomIdFromUrlSlug,
}
