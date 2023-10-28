import asyncio
from hume import HumeStreamClient, StreamSocket
from hume.models.config import ProsodyConfig

async def main():
    client = HumeStreamClient("3xzXi8qI7CAB18bljIvQYXrX8xsrGdsZAS8FfAouqo0QR4UA")
    config = ProsodyConfig()
    async with client.connect([config]) as socket:
        result = await socket.send_file("confusion.mp3")
        process_result(result)

def process_result(data):
    emotions = data['prosody']['predictions'][0]['emotions']

    # Sorting the emotions based on their score values in descending order
    sorted_emotions = sorted(emotions, key=lambda x: x['score'], reverse=True)

    # Extracting the top 5 emotions
    top_5_emotions = sorted_emotions[:5]

    print("Top 5 Emotions:")
    for emotion in top_5_emotions:
        print(f"{emotion['name']}: {emotion['score']}")

asyncio.run(main())
