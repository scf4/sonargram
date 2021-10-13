require('dotenv/config');

import fastify from 'fastify';
import fetch from 'node-fetch';
import { getRoomIdFromUrlCode, getRoomIdFromUrlSlug, loadRoomData } from '../../store';

let hash = '';
let assets: any;

void (async function updateAssets () {
  const resp = await fetch('https://live.sonar.app/v1/assets/?hash=' + hash);

  try {
    const { data } = await resp.json();
    assets = data.droppables;
    hash = data.hash;
  } catch {}

  setTimeout(updateAssets, 900_000);
})();

const server = fastify({ logger: true, trustProxy: true })
  .register(require('fastify-cors'), { origin: '*' });

server.get<any>('/', async (request, response) => {
  const id = request.query.id;
  const internalRoomId = await getRoomIdFromUrlCode(id) || await getRoomIdFromUrlSlug(id); 

  if (!internalRoomId) {
    response.code(404);
    return { error: 'Not found' };
  }

  const { name, entities, snapshot, savedAt, creator, shareUrl, mode } = await loadRoomData(internalRoomId);

  const lastActorIds: Record<number, number> = {};
  const creatorIds = {};

  for (const { lastActorId, creatorId } of entities.objects) {
    !lastActorIds[lastActorId] ? lastActorIds[lastActorId] = 1 : lastActorIds[lastActorId] += 1;
    !creatorIds[creatorId] ? creatorIds[creatorId] = 1 : creatorIds[creatorId] += 1;
  }

  const users = entities.users.filter((user: any) => user.username !== 'sonargram').map(
    ({ id: _id, username, position, profileImageUrl, color, isSelfMuted }) =>
    ({ username, position, profileImageUrl, color, useDarkColor: isSelfMuted })
  );

  // let contributions: any[] = [];

  // try {
  //   contributions = Object
  //     .entries(lastActorIds)
  //     .sort((a, b) => a[1] - b[1])
  //     .slice(0, 5);
  // } catch {}

  return {
    name,
    snapshot,
    users,
    savedAt,
    creatorName: creator?.username ?? null,
    url: mode === 'public' ? shareUrl : undefined,
    // contributions,
  };
});

server.get<any>('/sonar-assets', async () => {
  return {
    assets,
  }
});

server.listen(process.env.PORT! ?? 3000, '0.0.0.0');

export default null;
