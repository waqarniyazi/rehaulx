#!/usr/bin/env python3
import json
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound

video_id = "269OsrzG3Ew"

try:
    # Use the correct new API
    ytt_api = YouTubeTranscriptApi()
    fetched_transcript = ytt_api.fetch(video_id, languages=['en'])
    
    # Convert to raw data
    transcript_data = fetched_transcript.to_raw_data()
    
    segments = []
    for entry in transcript_data:
        segments.append({
            "start": entry["start"],
            "duration": entry["duration"], 
            "text": entry["text"]
        })
    
    result = {
        "success": True,
        "video_id": fetched_transcript.video_id,
        "language": fetched_transcript.language,
        "language_code": fetched_transcript.language_code,
        "is_generated": fetched_transcript.is_generated,
        "segments": segments[:5],  # Just first 5 for testing
        "total_segments": len(segments)
    }
    print(json.dumps(result, indent=2))
        
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
