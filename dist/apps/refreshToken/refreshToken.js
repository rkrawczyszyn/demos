"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const path_1 = __importDefault(require("path"));
const url = 'https://www.znanylekarz.pl/';
const tokenFilePath = path_1.default.resolve(__dirname, 'token.txt');
function fetchAccessToken() {
    https_1.default
        .get(url, (res) => {
        let data = '';
        // Collect the data
        res.on('data', (chunk) => {
            data += chunk;
        });
        // Once the response is complete
        res.on('end', () => {
            // Regular expression to find the ACCESS_TOKEN in the script
            const regex = /ZLApp\.APICredentials\s*=\s*{[^}]*'ACCESS_TOKEN':\s*'([^']+)'/;
            const match = data.match(regex);
            if (match && match[1]) {
                const accessToken = match[1];
                const tokenString = `Bearer ${accessToken}`;
                try {
                    fs_1.default.writeFileSync(tokenFilePath, tokenString, 'utf8');
                    console.log('ACCESS_TOKEN written to token.txt');
                }
                catch (error) {
                    console.error('Error writing to file', error);
                }
            }
            else {
                console.log('ACCESS_TOKEN not found in the page content');
            }
        });
    })
        .on('error', (err) => {
        console.error('Error fetching the page or extracting the token:', err);
    });
}
// Run the function to fetch and save the token
fetchAccessToken();
