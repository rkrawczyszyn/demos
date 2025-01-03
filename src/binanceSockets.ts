import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

// Binance WebSocket API endpoint for all market tickers
const wsUrl: string = 'wss://stream.binance.com:9443/ws/!ticker@arr';

// Define the structure of each ticker object
interface Ticker {
  s: string; // Symbol
}

// Metadata and CryptoStorage interfaces
interface Metadata {
  createdOn: Date;
  updatedOn: Date;
}

interface CryptoStorage {
  metadata: Metadata;
  cryptoSymbols: string[];
}

// Path to the storage file
const storageFilePath = path.join(__dirname, 'cryptoStorage.json');

// Function to load existing data from the file
function loadStorage(): CryptoStorage {
  try {
    const fileData = fs.readFileSync(storageFilePath, 'utf8');
    return JSON.parse(fileData) as CryptoStorage;
  } catch (error) {
    // If the file doesn't exist or there is an error, return an empty storage object
    console.log('Storage file not found, initializing new storage.');
    return {
      metadata: {
        createdOn: new Date(),
        updatedOn: new Date(),
      },
      cryptoSymbols: [],
    };
  }
}

// Function to save data to the file
function saveStorage(storage: CryptoStorage): void {
  try {
    fs.writeFileSync(storageFilePath, JSON.stringify(storage, null, 2), 'utf8');
    console.log('Storage data saved successfully.');
  } catch (error) {
    console.error('Error saving storage data:', error);
  }
}

// Connect to the Binance WebSocket API
const ws: WebSocket = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('Connected to Binance WebSocket');
});

ws.on('message', (data: WebSocket.Data) => {
  try {
    const storage = loadStorage(); // Load storage every time a new message is received
    const tickers: Ticker[] = JSON.parse(data.toString());

    tickers.forEach((ticker) => {
      const symbol: string = ticker.s;

      // Check if the symbol is new
      if (!storage.cryptoSymbols.includes(symbol)) {
        storage.cryptoSymbols.push(symbol);
        storage.metadata.updatedOn = new Date(); // Update the timestamp

        console.log(`New cryptocurrency detected: ${symbol}`);

        // Save updated storage to file
        saveStorage(storage);
      }
    });
  } catch (error) {
    console.error('Error parsing message data:', error);
  }
});

ws.on('close', () => {
  console.log('WebSocket connection closed');
});

ws.on('error', (error: Error) => {
  console.error('WebSocket error:', error);
});
