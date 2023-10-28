import asyncio
from hume import HumeStreamClient
from hume.models.config import LanguageConfig

samples = [
    "Umm I guess I am an all right student, um like I don't know I hope I get this job."
]

async def main():
    client = HumeStreamClient("3xzXi8qI7CAB18bljIvQYXrX8xsrGdsZAS8FfAouqo0QR4UA")
    config = LanguageConfig()
    async with client.connect([config]) as socket:
        for sample in samples:
            result = await socket.send_text(sample)
            process_result(result)

def process_result(data):
    # Extracting emotions (the method of extraction depends on the context - prosody/language)
    emotions = data.get("prosody", {}).get("predictions", [{}])[0].get("emotions", []) \
                or data.get("language", {}).get("predictions", [{}])[0].get("emotions", [])

    # Sorting the emotions based on their score values in descending order
    sorted_emotions = sorted(emotions, key=lambda x: x['score'], reverse=True)

    # Extracting the top 5 emotions
    top_5_emotions = sorted_emotions[:5]

    # Header
    print("| {:<20} | {:<7} |".format("Emotion", "Score"))
    print("|" + "-"*22 + "|" + "-"*9 + "|")  # Separator line

    for emotion in top_5_emotions:
        # Converting the score to a rounded percentage
        percentage = round(emotion['score'] * 100)
        print("| {:<20} | {:>6}% |".format(emotion['name'], percentage))


asyncio.run(main())
