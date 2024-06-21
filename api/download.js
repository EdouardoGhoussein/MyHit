// api/download.js

const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    const { file } = req.query;
    const filePath = decodeURIComponent(file);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
        console.error('Error reading file:', err.message);
        res.status(500).json({ error: 'Error reading file' });
    });
}
