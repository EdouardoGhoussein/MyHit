const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');
const ffmpegPath = require('ffmpeg-static');

// Set the path to ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required.' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

    res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
    res.setHeader('Content-Type', 'audio/mpeg');

    const stream = ytdl(url, { format: format });
    const ffmpegStream = new PassThrough();

    ffmpeg(stream)
      .audioCodec('libmp3lame')
      .toFormat('mp3')
      .pipe(ffmpegStream);

    ffmpegStream.pipe(res);
  } catch (error) {
    console.error('Function execution error:', error);
    res.status(500).json({ error: 'Failed to download video.' });
  }
};
