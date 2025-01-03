"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Binance REST API URL to fetch all available pairs
const exchangeInfoUrl = 'https://api.binance.com/api/v3/exchangeInfo';
// Path to store the data in a JSON file
const storageFilePath = path_1.default.join(__dirname, 'newTokens.json');
// Function to load the storage file if it exists, otherwise initialize a new one
function loadStorage() {
    try {
        const fileData = fs_1.default.readFileSync(storageFilePath, 'utf8');
        return JSON.parse(fileData);
    }
    catch (error) {
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
function saveStorage(storage) {
    try {
        fs_1.default.writeFileSync(storageFilePath, JSON.stringify(storage, null, 2), 'utf8');
        console.log('Storage data saved successfully.');
    }
    catch (error) {
        console.error('Error saving storage data:', error);
    }
}
// Function to fetch all available trading pairs from Binance
function fetchAllPairs() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(exchangeInfoUrl);
            const symbols = response.data.symbols;
            const tradingPairs = symbols.filter((symbol) => symbol.status === 'TRADING');
            return new Set(tradingPairs.map((pair) => pair.symbol));
        }
        catch (error) {
            console.error('Error fetching trading pairs:', error);
            return new Set();
        }
    });
}
// Function to detect and store new tokens
function detectNewTokens() {
    return __awaiter(this, void 0, void 0, function* () {
        // Load current known tokens from storage
        const storage = loadStorage();
        const knownTokens = new Set(storage.newTokens);
        // Fetch all active trading pairs
        const allPairs = yield fetchAllPairs();
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
    });
}
// Run the detection periodically (e.g., every 30 minutes)
setInterval(detectNewTokens, 30 * 60 * 1000); // Run every 30 minutes
// Run once immediately to detect and store any new tokens
detectNewTokens();
