import requests
import re
import yt_dlp

def get_insta_video(url):
    print(f"Fetching {url}...")
    
    # Method 1: Regex with Requests
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
        }
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            # Look for og:video
            match = re.search(r'<meta property="og:video" content="([^"]+)"', response.text)
            if match:
                video_url = match.group(1)
                print(f"Found video URL via Regex: {video_url}")
                return video_url
            
            # Look for video_url in JSON
            match_json = re.search(r'"video_url":"([^"]+)"', response.text)
            if match_json:
                video_url = match_json.group(1).replace("\\u0026", "&")
                print(f"Found video URL via JSON Regex: {video_url}")
                return video_url
    except Exception as e:
        print(f"Regex method failed: {e}")

    # Method 2: yt-dlp fallback
    print("Trying yt-dlp...")
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'format': 'best',
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            video_url = info.get('url')
            print(f"Found video URL via yt-dlp: {video_url}")
            return video_url
    except Exception as e:
        print(f"yt-dlp error: {e}")

if __name__ == "__main__":
    url = "https://www.instagram.com/reel/CzbqlwGow2Q/"
    get_insta_video(url)

if __name__ == "__main__":
    url = "https://www.instagram.com/reel/CzbqlwGow2Q/"
    get_insta_video(url)
