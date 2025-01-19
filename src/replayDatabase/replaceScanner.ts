import * as fs from 'fs';
import * as path from 'path';

interface PlayerData {
  hexId: string;
  ipAddress: string;
  nicknames: string[];
}

const convertHexToIp = (hexId: string): string => {
  const hexPairs = hexId.match(/.{1,2}/g);
  if (!hexPairs || hexPairs.length !== 4) {
    throw new Error(`Invalid hex ID: ${hexId}`);
  }
  return hexPairs.map((pair) => parseInt(pair, 16)).join('.');
};

const extractPlayerData = (header: string): Record<string, PlayerData> => {
  const playerData: Record<string, PlayerData> = {};

  // Match the part starting with ;GR=0 0 0
  const grPattern = /;GR=0 0 0[^;]+/;
  const grMatch = header.match(grPattern);

  if (grMatch) {
    const grSegment = grMatch[0];

    // Match the first player starting with ;S=H
    const firstPlayerRegex = /;S=H([^,]+),([0-9A-F]{8})/;
    let match;

    // Match the first player
    const firstPlayerMatch = grSegment.match(firstPlayerRegex);
    if (firstPlayerMatch) {
      const [_, nickname, hexId] = firstPlayerMatch;
      playerData[hexId] = {
        hexId,
        ipAddress: convertHexToIp(hexId),
        nicknames: [nickname],
      };
    }

    // Now match the subsequent players starting with 0:H
    const subsequentPlayerRegex = /0:H([^,]+),([0-9A-F]{8})/g;

    while ((match = subsequentPlayerRegex.exec(grSegment)) !== null) {
      const [_, nickname, hexId] = match;

      if (!playerData[hexId]) {
        playerData[hexId] = {
          hexId,
          ipAddress: convertHexToIp(hexId),
          nicknames: [],
        };
      }

      if (!playerData[hexId].nicknames.includes(nickname)) {
        playerData[hexId].nicknames.push(nickname);
      }
    }
  }

  return playerData;
};

const analyzeReplayFiles = (directory: string): void => {
  const playerDatabase: Record<string, PlayerData> = {};

  const files = fs.readdirSync(directory).filter((file) => file.endsWith('.BfME2Replay'));

  files.forEach((file) => {
    const filePath = path.join(directory, file);

    const content = fs.readFileSync(filePath, 'utf-8');

    // Match header starting with ;GR=0 0 0
    const headerMatch = content.match(/;GR=0 0 0[^;]+/);

    console.log('show headerMatch', headerMatch);

    if (headerMatch) {
      const header = headerMatch[0];

      console.log('show header', header);

      const playerData = extractPlayerData(header);

      Object.entries(playerData).forEach(([hexId, data]) => {
        if (!playerDatabase[hexId]) {
          playerDatabase[hexId] = data;
        } else {
          const existing = playerDatabase[hexId];
          data.nicknames.forEach((nickname) => {
            if (!existing.nicknames.includes(nickname)) {
              existing.nicknames.push(nickname);
            }
          });
        }
      });
    }
  });

  fs.writeFileSync(path.join(directory, 'players-database.json'), JSON.stringify(playerDatabase, null, 2), 'utf-8');

  console.log('Player database written to players-database.json');
};

// Run the script on a directory containing replay files
const replayFilesDirectory = 'C:\\_important\\test'; // Change this to your replay files directory
analyzeReplayFiles(replayFilesDirectory);
