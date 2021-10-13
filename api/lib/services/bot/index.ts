require('dotenv/config');
import * as Sonar from '@sonar-tools/sonar.js';
import { rotate270 } from '2d-array-rotation';
import { createUrlCodeFromRoomId, getRoomIdFromSonarId, saveRoomData } from '../../store';
import { SonarId } from '../../types';
import { random } from 'lodash';
// import { random } from 'lodash';

const { AUTH_TOKEN } = process.env;

const queue: Array<{ roomId: SonarId, username: string, shouldSave: boolean; }> = [];

const roomBoopRateLimit = new Map<number, number>();
const userBoopRateLimit = new Map<string, { lastTimestamp: number, count: number }>();

let isProcessingQueue = false;
let currentRoomId: number | null = null;

const HOME_SERVER_ID = 12780;

const idToName = new Map<number, string>();

async function bot() {
  const sonar = await Sonar.createClient({ serverId: 12780, AUTH_TOKEN: AUTH_TOKEN });
  // const cloudflare = new Cloudflare({ token: 'Bearer EQNeW2OI5r9R4oqtgcB_QZD0pSqALeAUNO4w0Hus' })
  // Accept friend requests on launch
  void (async function acceptFriendRequests() {
    for (const user of await sonar.friends.requests()) {
      console.info('Accepting friend request from ' + user.username + ` (#${user.id})`);
      try { await sonar.friends.confirm(user.id); } catch {};
      await sleep(600_000);
      await acceptFriendRequests();
    }
  })();

  await sleep(1000);

  const friends = await sonar.friends.list();
  console.log(`@sonargram has ${friends.length} friends`);
  friends.forEach((f, i) => console.log(`#${i} ${f.username} (${f.id})`));
  
  console.info('Resting...');

  await sonar.servers.setHomeServer(12780);
  await sleep(1000);
  await sonar.actions.updateStatusText('@sonargram');
  await sleep(1000);
  await sonar.profile.addPhoto(undefined as any);
  await sleep(1000);
  await sonar.actions.updateColor('FFFF00');

  await processQueue();

  // Handle new friend requests
  // sonar.events.on('friend_request', async (user: any) => {
  //   await sleep(5000);
  //   console.info('Accepting live friend request from ' + user?.name + ` (#${user?.id})`);
  //   try { await sonar.friends.confirm(user.id); } catch(e) {
  //     try{console.error(`couldnt confirm friend #${user?.id}`);
  //     console.error(JSON.stringify(e));
  //     console.error(JSON.stringify((e as any)?.message));}catch{}
  //   }
  // });

  let boopInProgress = false;
  // Handle boop
  sonar.events.on('boop', async ({ roomId, username }: Sonar.PingPayload) => {
    if (boopInProgress) return;
    boopInProgress = true;
    // Room rate limit
    if (roomBoopRateLimit.has(roomId)) {
      const timestamp = roomBoopRateLimit.get(roomId)!;
      const diff = Date.now() - timestamp;
      const seconds = diff / 1000;
      if (seconds < 60) { boopInProgress = false; console.info('rate_limit_room', roomId, 'seconds', seconds, 'username', username); return; };
    } else {
      roomBoopRateLimit.set(roomId, Date.now());
    }

    if (!username) return;

    if (userBoopRateLimit.has(username)) {
      let { count, lastTimestamp } = userBoopRateLimit.get(username)!;
      
      // Time
      const diff = Date.now() - lastTimestamp;
      const seconds = diff / 1000;

      if (seconds < 60) {
        boopInProgress = false;
        console.info('rate_limit_user', username, 'seconds', seconds, 'roomId', roomId, 'count', count);
        return;
      };
      
      // Count
      if (count <= 3 && seconds < 30) {
        boopInProgress = false; 
        console.info('rate_limit_user', username, 'seconds', seconds, 'roomId', roomId, 'count', count);
        return;
      }
      
      if (count > 3 && seconds < 300) {
        boopInProgress = false; 
        console.info('rate_limit_user', username, 'seconds', seconds, 'roomId', roomId, 'count', count);
        return;
      }
      
      if (seconds > 1800) count = 0;

      count += 1;

      userBoopRateLimit.set(username, { count, lastTimestamp: Date.now() })
    
    } else {
      userBoopRateLimit.set(username, { count: 1, lastTimestamp: Date.now() });
    }
        
    const roomMetaData = await sonar.servers.meta(roomId);
    if (!roomMetaData) { boopInProgress = false; return; }

    ///////////////////////
    boopInProgress = false;
    //////////////////////

    console.info(`${username} booped to ${roomId}`);

    if (roomId === HOME_SERVER_ID) {
      console.info('Booped to home room - ignoring');
      return;
    }

    const moderators = roomMetaData.moderators
      .concat(roomMetaData.creator ?? []);

    const shouldSave = true;

    if (queue.filter(item => item.roomId === roomId).length > 0) {
      console.info(`Room is already in the queue — ignoring`);
    } else {
      queue.push({ roomId, username, shouldSave });
    }

    const allUsers = moderators.concat(roomMetaData.members);

    allUsers.forEach(user => { idToName.set(user.id, user.username); });

    await processQueue();
  });

  sonar.events.on('object_dropped', async (item) => {
    console.log('object_dropped');
    console.log(JSON.stringify(item));
    if ((item as any)?.object?.name === 'coin' && currentRoomId === HOME_SERVER_ID) {
      try { await sonar.actions.move(item.position.x, item.position.y); } catch {}
    };
    await sleep(150);
    if ((item as any)?.name === 'coin' && currentRoomId === HOME_SERVER_ID) {
      try { await sonar.actions.move(item.position.x, item.position.y); } catch {}
    };
    await sleep(150);
  });

  sonar.events.on('object_spawn', async (item) => {
    console.log('entity spawned');
    console.log(JSON.stringify(item));
    if ((item as any)?.object?.name === 'coin' && currentRoomId === HOME_SERVER_ID) {
      try { await sonar.actions.move(item.position.x, item.position.y); } catch {}
      await sleep(200);
    };
    if ((item as any)?.name === 'coin' && currentRoomId === HOME_SERVER_ID) {
      try { await sonar.actions.move(item.position.x, item.position.y); } catch {}
      await sleep(300);
    };
    await sonar.servers.join({ serverId: HOME_SERVER_ID });
  });

  // const userIdsGivenCoins = new Map<number, boolean>();
  // Handle join roomn
  sonar.events.on('join_room', async (room: Sonar.CurrentRoomPayload) => {
    currentRoomId = room.id;

    if (room.id === HOME_SERVER_ID) {
      await sonar.actions.move(-2, 6);
      await sleep(270);
      await sonar.actions.dropItem('coin', -4, -5);
      await sleep(270);
      
      for (const item of room.entities.objects) {
        if (item.name === 'coin') {
          await sonar.actions.move(item.position.x, item.position.y);
          await sleep(375);
        } else if (!item.name.includes('🪧')) {
          await sonar.actions.removeItem(item.id);
        }
      }

      await sonar.actions.updateStatusText('@sonargram 📸');
      
      await sleep(1500);
      
      try {
        const items = await sonar.users.items(3563);
        const numCoins = (items.coin as any)?.count ?? 0;
        if (numCoins > 0) await sonar.actions.dropItem('coin', random(-15, 15), random(-15, 15));
      } catch(e) {
        try {console.error((e || `${JSON.stringify(e).substr(0, 50)}`))}catch{}
      }


      return;
    } 

    const metadata = await sonar.servers.meta(room.id);

    if (!room || !metadata) return;

    const queueItem = queue.shift();
    
    const { roomId, shouldSave, username } = queueItem ?? {};

    // Coins for creators
    const [creator] = room.entities.users.filter(user => user.id === room.creatorId);
    if (creator.username?.toLowerCase() === 'bop') {
      for (const item of room.entities.objects) {
        await sonar.actions.removeItem(item.id);
      }
    }
    // if (creator && !userIdsGivenCoins.has(creator.id) && creator.username?.toLowerCase() === username) {
    //   userIdsGivenCoins.set(creator.id, true);
    //   try { 
    //     const items = await sonar.users.items(3563);
    //     if (items.coin.count) {
    //       await sonar.actions.dropItem('coin');
    //     }
    //   } catch(error) {
    //     console.error('Error dropping coin');
    //     console.error(error);voiq
    //   }
    // }

    // ...
    

    // Meh
    if (![room.id, room.id.toString()].includes(roomId ?? 0)) {
      console.error(`Queue/roomId mismatch — roomId: ${roomId} / room.id: ${room.id}`);
    }

    console.info(`Joined ${room.name}, invited by ${username}`);
   
    if (!shouldSave) {
      // console.info(`Not saving: ${username} is not a moderator of ${room.name}`);

      // await sonar.actions.updateStatusText(
      //   `${username} invited me here but theyre not a mod sorry!`,
      // );

      // await sleep(3000);

      // await sonar.actions.updateStatusText(
      //   `ping me to ur rooms to take snapshots u can share w friends 📸`,
      // );

      // await sleep(4000);

      // await sonar.rooms.join({ roomId: Number(process.env.SERVER_ID) || 5028 });
    }

    await sonar.actions.move(0, -3);

    await sonar.actions.updateStatusText('hey, im @sonargram 📸');
    await sleep(3000);

    await sonar.actions.updateStatusText(`${username} invited me here 📸`.replace('bop', 'We do not exist. No one'));
    await sleep(2500);

    const cameraFlashPromises: Promise<any>[] = [];
    cameraFlashPromises.push(cameraFlash(sonar));

    const entities = room.entities;
    const grid = new Array(31).fill(null).map(() => new Array(31).fill(null));

    entities.objects.forEach(args => {
      const x = args.position.x + 15;
      const y = args.position.y + 15;
      grid[x][y] = args.name;
    });

    const snapshot = rotate270(grid);

    const uuid = getRoomIdFromSonarId(room.id);

    const roomSaveData = {
      ...room,
      ...metadata,
      internalRoomId: uuid,
      savedAt: new Date(),
      snapshot,
    };

    cameraFlashPromises.push(cameraFlash(sonar));
    let code = await createUrlCodeFromRoomId(uuid);

    await saveRoomData(uuid, roomSaveData);

    console.info(`Saved as room ${uuid} (${code})`);

    cameraFlashPromises.push(cameraFlash(sonar));

    // Make sure no actions are still in progress
    await Promise.all(cameraFlashPromises);

    // let slug = ({
      
    // })[code];

    const signText = `📸 https://sonargr.am/${code}`;
    const text = `📸 https://sonargr.am/${code}`;
    
    await sonar.actions.updateStatusText(text);

    await sleep(1500);

    await sonar.actions.dropSign(signText);

    await sleep(250);

    await sonar.actions.move(0, -5);

    await sleep(15_000);

    await sonar.actions.updateStatusText('@sonargram 📸 add me & ping me to your servers to take snapshots');

    await sleep(queue.length ? 3000 : 6000);

    isProcessingQueue = false;

    await processQueue();
  });

  async function processQueue() {
    const queueItem = queue[0];

    if (queueItem) {
      isProcessingQueue = true;
      const serverId = Number(queueItem.roomId);
      await sonar.servers.join({ serverId });
    } else {
      isProcessingQueue = false;

      await sonar.servers.join({ serverId: HOME_SERVER_ID, joinSilently: false });
    }

    isProcessingQueue; // Unused
  }
}

(async function start() {
  try {
    await bot();
  } catch (error) {
    console.error(error);
    setTimeout(start, 15_000);
  }
})();

async function cameraFlash(sonar: Sonar.Client) {
  await sonar.actions.updateStatusText('📷');
  void sonar.actions.updateStatusText('📸');
  await sonar.actions.updateStatusText('');
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
