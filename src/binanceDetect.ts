// Import required modules
import axios from 'axios';
import * as fs from 'fs';
import * as crypto from 'crypto';
import path from 'path';
import nodemailer from 'nodemailer';

const BINANCE_CREDENTIALS_PATH = '/home/rkrawczyszyn/credentials/binanceCredentials.json';
const MAIL_CREDENTIALS_PATH = '/home/rkrawczyszyn/credentials/mailCredentials.json';
const OUTPUT_FILE = path.resolve(__dirname, 'coinStorage.json');

// Function to read coin storage from file
function readCoinStorage() {
  try {
    const data = fs.readFileSync(OUTPUT_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Function to write coin storage to file
function writeCoinStorage(coins: string[]) {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(coins, null, 2), 'utf8');
  console.log(`Updated ${OUTPUT_FILE}`);
}

// Function to send email
async function sendEmail(newCoins: any[]) {
  try {
    const mailCredentials = loadCredentials(MAIL_CREDENTIALS_PATH);

    const transporter = nodemailer.createTransport({
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

    await transporter.sendMail(message);
    console.log('Email sent to rkrawczyszyn@gmail.com');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

function loadCredentials(credentialsPath: string) {
  try {
    const rawData = fs.readFileSync(credentialsPath, 'utf8');

    const result = JSON.parse(rawData);
    console.log('show cred result', result);

    return result;
  } catch (err) {
    console.error('Failed to read credentials:', err);
  }
}

// Main function to process coins
async function processCoins() {
  try {
    // Read existing coins from storage
    const storedCoins = readCoinStorage();

    const binanceCredentials = loadCredentials(BINANCE_CREDENTIALS_PATH);
    const apiKey = binanceCredentials.apiKey;
    const apiSecret = binanceCredentials.apiSecret;

    const config = {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    };

    // Build the request
    const baseUrl: string = 'https://api.binance.com/sapi/v1/capital/config/getall';
    const timestamp: number = new Date().getTime();
    const queryString: string = `timestamp=${timestamp}`;
    const signature: string = crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
    const url: string = `${baseUrl}?${queryString}&signature=${signature}`;

    // Fetch new coin data
    const response = await axios.get(url, config);
    const fetchedCoins: any[] = response.data;

    // Extract coin names
    const fetchedCoinNames: string[] = fetchedCoins.map((asset: any) => asset.coin);

    // Find new coins not in storage
    const newCoins = fetchedCoins.filter((coin) => !storedCoins.includes(coin.coin));

    // Log new coins to console and send email
    if (newCoins.length > 0) {
      console.log(
        'New coins detected:',
        newCoins.map((coin) => coin.coin)
      );

      // Send email with new coins and fetched data
      await sendEmail(newCoins);

      // Update coin storage with new coins and write to file
      const updatedCoins = [...storedCoins, ...newCoins.map((coin) => coin.coin)];
      writeCoinStorage(updatedCoins);
    } else {
      console.log('No new coins found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the process
processCoins();
