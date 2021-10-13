
import { brotliCompressSync, brotliDecompressSync } from 'zlib';
import { getRoomIdFromSonarId } from '../lib/store';

describe('getInternalRoomId', () => {
  it('creates deterministic UUIDs from arbitrary numbers', () => {
      const internalLobbyId = getRoomIdFromSonarId(122);
      expect(internalLobbyId).toEqual('9077d323-3153-5c69-b4f7-e86f177fca11');
    });

  it('creates deterministic UUIDs from arbitrary strings', () => {
    const internalLobbyId = getRoomIdFromSonarId('sonar-room:12495938/user:954/[31,31]');
    expect(internalLobbyId).toEqual('a20605f3-c1c3-5f37-b3c5-5d689617467e');
  });
});