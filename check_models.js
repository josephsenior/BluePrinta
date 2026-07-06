const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env manually since we don't assume dotenv is installed
const envPath = path.join(__dirname, '.env');
let apiKey = '';
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GOOGLE_AI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
    }
}

if (!apiKey) {
    console.error("No API key found in .env");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log("Available Models:");
                json.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
            } else {
                console.log("Error/No models found:", json);
            }
        } catch (e) {
            console.error("Failed to parse response:", e);
        }
    });
}).on('error', (e) => {
    console.error("Request error:", e);
});
