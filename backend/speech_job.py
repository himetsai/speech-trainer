"""
from hume import HumeBatchClient
from hume.models.config import FaceConfig
from hume.models.config import ProsodyConfig

client = HumeBatchClient("RIGtwT6XSKilvZsFvJtHDt8jaIIq6CWS9XdBQhlRmiHArXoi")
urls = ["New_Recording.mp3"]
configs = [ProsodyConfig()]
job = client.submit_job(urls, configs)

print(job)
print("Running...")

job.await_complete()
job.download_predictions("predictions.json")
"""

import asyncio
import json
import pandas as pd
from hume import HumeStreamClient
from hume.models.config import ProsodyConfig

async def main():
    client = HumeStreamClient("RIGtwT6XSKilvZsFvJtHDt8jaIIq6CWS9XdBQhlRmiHArXoi")
    config = ProsodyConfig()
    async with client.connect([config]) as socket:
        result = await socket.send_file("New_Recording.mp3")
        process_result(result)

def process_result(data):
    df = pd.DataFrame()
    for emotion in data["prosody"]["predictions"][0]["emotions"]:
        df[emotion["name"]] = [emotion["score"]]
    df.iloc[0] = df.iloc[0] / df.iloc[0].sum()
    print(df)
    print(df.iloc[0].sum())
    print(df.columns)
    with open('predictions.json', 'w') as fp:
        json.dump(data, fp)

asyncio.run(main())