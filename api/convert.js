const ytdl = require('ytdl-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('ffprobe-static').path;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

async function convertToMP3(videoUrl) {
    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

    const tmpDir = '/tmp';
    const videoPath = path.join(tmpDir, 'video.mp4');
    const audioPath = path.join(tmpDir, 'audio.mp3');

    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
    }

    // Download video file
    await new Promise((resolve, reject) => {
        const video = ytdl(videoUrl, { format });
        video.pipe(fs.createWriteStream(videoPath));
        video.on('end', resolve);
        video.on('error', reject);
    });

    // Convert video to mp3
    return new Promise((resolve, reject) => {
        ffmpeg.setFfprobePath(ffprobePath);
        ffmpeg.setFfmpegPath(ffmpegPath);

        ffmpeg(videoPath)
            .toFormat('mp3')
            .save(audioPath)
            .on('end', () => {
                // Clean up: Delete video file after conversion
                fs.unlinkSync(videoPath);
                resolve(audioPath);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { url } = req.body;

        try {
            const audioPath = await convertToMP3(url);
            const downloadLink = `/api/download?file=${encodeURIComponent(audioPath)}`;
            res.status(200).json({ downloadLink });
        } catch (error) {
            console.error('Error converting video:', error.message);
            res.status(500).json({ error: 'Unable to convert video' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
