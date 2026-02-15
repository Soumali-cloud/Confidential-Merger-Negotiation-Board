// Simple HTTP Server for Frontend Development
// Run: node frontend/server.js

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Default to landing.html for root
    let filePath = req.url === '/' ? '/landing.html' : req.url;
    filePath = path.join(__dirname, filePath);

    // Prevent directory traversal
    const realPath = path.resolve(filePath);
    const base = path.resolve(__dirname);
    
    if (!realPath.startsWith(base)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    // Read and serve file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log(`❌ File not found: ${filePath}`);
                res.writeHead(404);
                res.end('Not Found');
            } else {
                console.log(`❌ Server error: ${err.message}`);
                res.writeHead(500);
                res.end('Server Error');
            }
            return;
        }
        console.log(`✓ Serving: ${req.url}`);

        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════════════════════════╗`);
    console.log(`║  🌐 Confidential Merger Negotiation Board - Frontend      ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝\n`);
    console.log(`✓ Server running at: http://localhost:${PORT}`);
    console.log(`\n📍 Open your browser and navigate to: http://localhost:${PORT}\n`);
    console.log(`🛑 To stop: Press Ctrl+C\n`);
});

process.on('SIGINT', () => {
    console.log('\n\n✓ Server stopped');
    process.exit(0);
});
