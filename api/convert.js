// api/convert.js

const ytdl = require('ytdl-core');
const ffprobe = require('ffprobe-static');
const fs = require('fs');
const path = require('path');

async function convertToMP3(videoUrl) {
    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

    return new Promise((resolve, reject) => {
        const video = ytdl(videoUrl, { format });

        video.pipe(fs.createWriteStream('/tmp/video.mp4'));

        video.on('end', () => {
            const audioPath = path.join('/tmp', 'audio.mp3');
            const ffmpeg = require('fluent-ffmpeg');
            ffmpeg.setFfprobePath(ffprobe.path);
            ffmpeg('/tmp/video.mp4')
                .toFormat('mp3')
                .save(audioPath)
                .on('end', () => resolve(audioPath))
                .on('error', (err) => reject(err));
        });

        video.on('error', (err) => reject(err));
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
