#!/usr/bin/env python3
"""
YouTube Transcript Extractor using youtube-transcript-api
Handles transcript extraction with proper error handling and formatting
"""

import sys
import json
import re
from typing import Dict, List, Any, Optional

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api.formatters import JSONFormatter
except ImportError as e:
    print(json.dumps({
        "success": False,
        "error": "Missing required Python package",
        "details": f"Please install youtube-transcript-api: pip install youtube-transcript-api",
        "module_error": str(e)
    }))
    sys.exit(1)

def extract_video_id(url: str) -> Optional[str]:
    """Extract video ID from various YouTube URL formats"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/watch\?.*v=([^&\n?#]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    # If no pattern matches, assume it's already a video ID
    if len(url) == 11 and url.isalnum():
        return url
    
    return None

def get_transcript(video_id: str, languages: List[str] = None) -> Dict[str, Any]:
    """
    Get transcript for a YouTube video
    
    Args:
        video_id: YouTube video ID
        languages: List of preferred languages (defaults to ['en'])
    
    Returns:
        Dictionary with success status and transcript data or error
    """
    if languages is None:
        languages = ['en']
    
    try:
        # Initialize the API
        api = YouTubeTranscriptApi()
        
        # Try to get the transcript
        transcript_list = api.list(video_id)
        
        # Find the best available transcript
        try:
            transcript = transcript_list.find_transcript(languages)
        except Exception:
            # If preferred languages not found, get any available transcript
            available_transcripts = list(transcript_list)
            if not available_transcripts:
                return {
                    "success": False,
                    "error": "No transcripts available for this video"
                }
            transcript = available_transcripts[0]
        
        # Fetch the transcript data
        transcript_data = transcript.fetch()
        
        # Format the response
        segments = []
        for item in transcript_data:
            segments.append({
                "text": item.text.strip(),
                "start": float(item.start),
                "duration": float(item.duration)
            })
        
        return {
            "success": True,
            "video_id": video_id,
            "language": transcript.language,
            "language_code": transcript.language_code,
            "is_generated": transcript.is_generated,
            "segments": segments,
            "total_segments": len(segments)
        }
        
    except Exception as e:
        error_message = str(e)
        
        # Handle specific error types
        if "No transcripts were found" in error_message:
            return {
                "success": False,
                "error": "No transcripts available for this video",
                "details": "This video may not have captions enabled or may be private/restricted"
            }
        elif "Video unavailable" in error_message:
            return {
                "success": False,
                "error": "Video is unavailable",
                "details": "The video may be private, deleted, or restricted in your region"
            }
        elif "Transcript disabled" in error_message:
            return {
                "success": False,
                "error": "Transcripts are disabled for this video",
                "details": "The video owner has disabled transcript access"
            }
        else:
            return {
                "success": False,
                "error": "Failed to extract transcript",
                "details": error_message
            }

def list_available_transcripts(video_id: str) -> Dict[str, Any]:
    """List all available transcripts for a video"""
    try:
        api = YouTubeTranscriptApi()
        transcript_list = api.list(video_id)
        
        transcripts = []
        for transcript in transcript_list:
            transcripts.append({
                "language": transcript.language,
                "language_code": transcript.language_code,
                "is_generated": transcript.is_generated,
                "is_translatable": transcript.is_translatable
            })
        
        return {
            "success": True,
            "video_id": video_id,
            "available_transcripts": transcripts
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to list transcripts",
            "details": str(e)
        }

def main():
    """Main CLI interface"""
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python transcript_extractor.py <command> <video_url_or_id> [languages]",
            "commands": {
                "extract": "Extract transcript from video",
                "list": "List available transcripts"
            }
        }))
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command not in ['extract', 'list']:
        print(json.dumps({
            "success": False,
            "error": f"Unknown command: {command}",
            "available_commands": ["extract", "list"]
        }))
        sys.exit(1)
    
    if len(sys.argv) < 3:
        print(json.dumps({
            "success": False,
            "error": "Video URL or ID is required"
        }))
        sys.exit(1)
    
    video_input = sys.argv[2]
    video_id = extract_video_id(video_input)
    
    if not video_id:
        print(json.dumps({
            "success": False,
            "error": "Invalid YouTube URL or video ID",
            "input": video_input
        }))
        sys.exit(1)
    
    if command == "extract":
        languages = sys.argv[3:] if len(sys.argv) > 3 else ['en']
        result = get_transcript(video_id, languages)
    elif command == "list":
        result = list_available_transcripts(video_id)
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
