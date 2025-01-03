import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Binance REST API URL to fetch all available pairs
const exchangeInfoUrl: string = 'https://api.binance.com/api/v3/exchangeInfo';

// Path to store the data in a JSON file
const storageFilePath = path.join(__dirname, 'newTokens.json');

// Define the structure for the stored data
interface Metadata {
  createdOn: Date;
  updatedOn: Date;
}

interface TokenStorage {
  metadata: Metadata;
  newTokens: string[];
}

// Function to load the storage file if it exists, otherwise initialize a new one
function loadStorage(): TokenStorage {
  try {
    const fileData = fs.readFileSync(storageFilePath, 'utf8');
    return JSON.parse(fileData) as TokenStorage;
  } catch (error) {
    console.log('Storage file not found, initializing new storage.');
    return {
      metadata: {
        createdOn: new Date(),
        updatedOn: new Date(),
      },
      newTokens: [],
    };
  }
}

// Function to save the storage data back to the file
function saveStorage(storage: TokenStorage): void {
  try {
    fs.writeFileSync(storageFilePath, JSON.stringify(storage, null, 2), 'utf8');
    console.log('Storage data saved successfully.');
  } catch (error) {
    console.error('Error saving storage data:', error);
  }
}

// Function to fetch all available trading pairs from Binance
async function fetchAllPairs(): Promise<Set<string>> {
  try {
    const response = await axios.get(exchangeInfoUrl);
    const symbols = response.data.symbols;
    const tradingPairs = symbols.filter((symbol: any) => symbol.status === 'TRADING');
    return new Set(tradingPairs.map((pair: any) => pair.symbol));
  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    return new Set();
  }
}

// Function to detect and store new tokens
async function detectNewTokens() {
  // Load current known tokens from storage
  const storage = loadStorage();
  const knownTokens = new Set(storage.newTokens);

  // Fetch all active trading pairs
  const allPairs = await fetchAllPairs();

  // Detect new pairs
  allPairs.forEach((symbol) => {
    if (!knownTokens.has(symbol)) {
      console.log(`New trading pair detected: ${symbol}`);
      knownTokens.add(symbol);
      storage.newTokens.push(symbol);
    }
  });

  // Update metadata and save the storage
  storage.metadata.updatedOn = new Date();
  saveStorage(storage);
}

// Run the detection periodically (e.g., every 30 minutes)
setInterval(detectNewTokens, 30 * 60 * 1000); // Run every 30 minutes

// Run once immediately to detect and store any new tokens
detectNewTokens();
