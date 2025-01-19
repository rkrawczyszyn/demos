import fs from 'fs';
import https from 'https';
import path from 'path';

const url = 'https://www.znanylekarz.pl/';
const tokenFilePath = path.resolve(__dirname, 'token.txt');

function fetchAccessToken() {
  https
    .get(url, (res: any) => {
      let data = '';

      // Collect the data
      res.on('data', (chunk: any) => {
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
            fs.writeFileSync(tokenFilePath, tokenString, 'utf8');
            console.log('ACCESS_TOKEN written to token.txt');
          } catch (error) {
            console.error('Error writing to file', error);
          }
        } else {
          console.log('ACCESS_TOKEN not found in the page content');
        }
      });
    })
    .on('error', (err: any) => {
      console.error('Error fetching the page or extracting the token:', err);
    });
}

// Run the function to fetch and save the token
fetchAccessToken();
