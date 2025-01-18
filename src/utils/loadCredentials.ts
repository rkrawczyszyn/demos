import * as fs from 'fs';
import { logDate } from './logDate';

export function loadCredentials(credentialsPath: string) {
  try {
    const rawData = fs.readFileSync(credentialsPath, 'utf8');

    const result = JSON.parse(rawData);
    console.log(`${logDate()}: show cred result`, result);

    return result;
  } catch (err) {
    console.error(`${logDate()}: Failed to read credentials:`, err);
  }
}
