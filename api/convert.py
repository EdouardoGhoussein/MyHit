# api/convert.py
import os
import json
import tempfile
from pytube import YouTube
from pydub import AudioSegment

def handler(event, context):
    try:
        body = json.loads(event['body'])
        video_url = body['url']
        
        # Download the video
        yt = YouTube(video_url)
        video_stream = yt.streams.filter(only_audio=True).first()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as video_file:
            video_stream.download(output_path=os.path.dirname(video_file.name), filename=os.path.basename(video_file.name))
            video_path = video_file.name
        
        # Convert to MP3
        audio = AudioSegment.from_file(video_path)
        mp3_path = video_path.replace(".mp4", ".mp3")
        audio.export(mp3_path, format="mp3")
        
        # Read MP3 file to return as response
        with open(mp3_path, "rb") as mp3_file:
            mp3_data = mp3_file.read()
        
        # Clean up temporary files
        os.remove(video_path)
        os.remove(mp3_path)
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": f"attachment; filename={yt.title}.mp3"
            },
            "body": mp3_data,
            "isBase64Encoded": True
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
