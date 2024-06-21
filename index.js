const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Route to handle YouTube audio download
app.get('/download', async (req, res) => {
  const youtubeUrl = req.query.url;
  if (!youtubeUrl) {
    return res.status(400).json({ error: 'URL parameter is required.' });
  }

  try {
    // Fetch video information
    const info = await ytdl.getInfo(youtubeUrl);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

    // Set response headers for file download
    res.header('Content-Disposition', `attachment; filename="${info.title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');

    // Pipe video stream to response
    ytdl(youtubeUrl, { format: 'mp3' }).pipe(res);
  } catch (error) {
    console.error('Error downloading video:', error);
    res.status(500).json({ error: 'Failed to download video.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
