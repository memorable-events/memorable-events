import requests
url = "https://res.cloudinary.com/dgshj0uot/video/upload/v1764494767/khr4cewzl7lc0wwafdha.jpg"
try:
    r = requests.head(url)
    print(f"Status: {r.status_code}")
except Exception as e:
    print(f"Error: {e}")
