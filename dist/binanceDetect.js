"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
// Import required modules
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const logDate_1 = require("./utils/logDate");
const loadCredentials_1 = require("./utils/loadCredentials");
const filePaths_1 = require("./config/filePaths");
const BINANCE_CREDENTIALS_PATH = '/home/rkrawczyszyn/credentials/binanceCredentials.json';
const OUTPUT_FILE = path_1.default.resolve(__dirname, 'coinStorage.json');
// Function to read coin storage from file
function readCoinStorage() {
    try {
        const data = fs.readFileSync(OUTPUT_FILE, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        return [];
    }
}
// Function to write coin storage to file
function writeCoinStorage(coins) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(coins, null, 2), 'utf8');
    console.log(`${(0, logDate_1.logDate)()}: Updated ${OUTPUT_FILE}`);
}
// Function to send email
function sendEmail(newCoins) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const mailCredentials = (0, loadCredentials_1.loadCredentials)(filePaths_1.MAIL_CREDENTIALS_PATH);
            const transporter = nodemailer_1.default.createTransport({
                host: 'smtp.wp.pl',
                port: 465,
                secure: true,
                auth: {
                    user: mailCredentials.user,
                    pass: mailCredentials.pass,
                },
            });
            const message = {
                from: 'robert-kowaliszyn@wp.pl',
                to: 'rkrawczyszyn@gmail.com',
                subject: 'Binance new coin found',
                text: `New coins detected:\n\n${JSON.stringify(newCoins, null, 2)}`,
            };
            yield transporter.sendMail(message);
            console.log(`${(0, logDate_1.logDate)()}: Email sent to rkrawczyszyn@gmail.com`);
        }
        catch (error) {
            console.error(`${(0, logDate_1.logDate)()}: Failed to send email:`, error);
        }
    });
}
// Main function to process coins
function processCoins() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Read existing coins from storage
            const storedCoins = readCoinStorage();
            const binanceCredentials = (0, loadCredentials_1.loadCredentials)(BINANCE_CREDENTIALS_PATH);
            const apiKey = binanceCredentials.apiKey;
            const apiSecret = binanceCredentials.apiSecret;
            const config = {
                headers: {
                    'X-MBX-APIKEY': apiKey,
                },
            };
            // Build the request
            const baseUrl = 'https://api.binance.com/sapi/v1/capital/config/getall';
            const timestamp = new Date().getTime();
            const queryString = `timestamp=${timestamp}`;
            const signature = crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
            const url = `${baseUrl}?${queryString}&signature=${signature}`;
            // Fetch new coin data
            const response = yield axios_1.default.get(url, config);
            const fetchedCoins = response.data;
            // Extract coin names
            const fetchedCoinNames = fetchedCoins.map((asset) => asset.coin);
            // Find new coins not in storage
            const newCoins = fetchedCoins.filter((coin) => !storedCoins.includes(coin.coin));
            // Log new coins to console and send email
            if (newCoins.length > 0) {
                console.log(`${(0, logDate_1.logDate)()}: New coins detected:`, newCoins.map((coin) => coin.coin));
                // Send email with new coins and fetched data
                yield sendEmail(newCoins);
                // Update coin storage with new coins and write to file
                const updatedCoins = [...storedCoins, ...newCoins.map((coin) => coin.coin)];
                writeCoinStorage(updatedCoins);
            }
            else {
                console.log(`${(0, logDate_1.logDate)()}: No new coins found.`);
            }
        }
        catch (error) {
            console.error(`${(0, logDate_1.logDate)()}: Error:`, error);
        }
    });
}
// Run the process
processCoins();
