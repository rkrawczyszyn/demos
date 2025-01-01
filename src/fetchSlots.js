const fs = require('fs');
const https = require('https');
const path = require('path');

const formatDate = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

// Configuration
const API_BASE_URL = 'https://www.znanylekarz.pl/api/v3';
const FILTER_DATE_START = new Date().toDateString();
const FILTER_DATE_START_COPY = new Date();
const FILTER_DATE_END = new Date(FILTER_DATE_START_COPY.setDate(FILTER_DATE_START_COPY.getDate() + 45)).toDateString();
const TOKEN_FILE = path.resolve(__dirname, 'token.txt');
const DOCTOR_DETAILS_FILE = path.resolve(__dirname, 'doctorDetails.json');
const OUTPUT_FILE = path.resolve(__dirname, 'response.json');

const formattedStart = formatDate(FILTER_DATE_START);
const formattedEnd = formatDate(FILTER_DATE_END);

// Function to read a file and return its content as a string
function readFileSync(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

// Read the authorization token
const AUTH_TOKEN = readFileSync(TOKEN_FILE);

// Read doctor details from JSON file
const doctorDetails = JSON.parse(readFileSync(DOCTOR_DETAILS_FILE));

// Generate doctor URLs
const doctorUrls = doctorDetails.map((doctor) => {
  return `${API_BASE_URL}/doctors/${doctor.id}/addresses/${doctor.addressId}/slots?start=${formattedStart}T00%3A00%3A00%2B01%3A00&end=${formattedEnd}T00%3A00%3A00%2B01%3A00&includingSaasOnlyCalendar=false&with%5B%5D=address.nearest_slot_after_end&with%5B%5D=links.book.patient&with%5B%5D=slot.doctor_id&with%5B%5D=slot.address_id&with%5B%5D=slot.address&with%5B%5D=slot.with_booked`;
});

// Function to fetch slots for each doctor using built-in https
async function fetchDoctorSlots(urls) {
  const allSlots = [];

  for (let url of urls) {
    try {
      console.log(`Fetching: ${url}`);

      const options = {
        headers: {
          Accept: 'application/json',
          Authorization: `${AUTH_TOKEN}`,
        },
      };

      const response = await new Promise((resolve, reject) => {
        https
          .get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
              data += chunk;
            });
            res.on('end', () => {
              resolve(data);
            });
          })
          .on('error', (err) => {
            reject(err);
          });
      });

      const parsedResponse = JSON.parse(response);
      const slots = parsedResponse._items || [];
      allSlots.push(...slots);
    } catch (error) {
      console.error(`Failed to fetch slots for URL: ${url}, Error: ${error.message}`);
    }
  }

  return allSlots;
}

// Main function to run the logic
async function main() {
  try {
    console.log('Fetching doctor slots...');
    const slots = await fetchDoctorSlots(doctorUrls);

    const metadata = {
      updatedOn: new Date().toISOString(),
    };

    const result = {
      metadata,
      slots,
    };

    // Write the results to the output file
    console.log(`Writing results to ${OUTPUT_FILE}...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));

    console.log('Done! Results saved to response.json.');
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
}

// Run the main function
main();
