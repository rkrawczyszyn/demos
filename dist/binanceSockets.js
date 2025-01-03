"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Binance WebSocket API endpoint for all market tickers
const wsUrl = 'wss://stream.binance.com:9443/ws/!ticker@arr';
// Path to the storage file
const storageFilePath = path_1.default.join(__dirname, 'cryptoStorage.json');
// Function to load existing data from the file
function loadStorage() {
    try {
        const fileData = fs_1.default.readFileSync(storageFilePath, 'utf8');
        return JSON.parse(fileData);
    }
    catch (error) {
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
function saveStorage(storage) {
    try {
        fs_1.default.writeFileSync(storageFilePath, JSON.stringify(storage, null, 2), 'utf8');
        console.log('Storage data saved successfully.');
    }
    catch (error) {
        console.error('Error saving storage data:', error);
    }
}
// Connect to the Binance WebSocket API
const ws = new ws_1.default(wsUrl);
ws.on('open', () => {
    console.log('Connected to Binance WebSocket');
});
ws.on('message', (data) => {
    try {
        const storage = loadStorage(); // Load storage every time a new message is received
        const tickers = JSON.parse(data.toString());
        tickers.forEach((ticker) => {
            const symbol = ticker.s;
            // Check if the symbol is new
            if (!storage.cryptoSymbols.includes(symbol)) {
                storage.cryptoSymbols.push(symbol);
                storage.metadata.updatedOn = new Date(); // Update the timestamp
                console.log(`New cryptocurrency detected: ${symbol}`);
                // Save updated storage to file
                saveStorage(storage);
            }
        });
    }
    catch (error) {
        console.error('Error parsing message data:', error);
    }
});
ws.on('close', () => {
    console.log('WebSocket connection closed');
});
ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});
