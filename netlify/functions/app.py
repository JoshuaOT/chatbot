import os

from fastapi import FastAPI, Header, HTTPException
from mangum   import Mangum
from upstash_redis import Redis

app = FastAPI()

# build a Redis client from the UPSTASH_* env-vars
redis_client = Redis.from_url(
    os.environ["UPSTASH_URL"],
    token=os.environ["UPSTASH_TOKEN"],
)

# your health endpoint
@app.get("/health")
async def health(x_api_key: str = Header(None)):
    # require the incoming header to match your token
    expected = os.environ["UPSTASH_TOKEN"]
    if x_api_key != expected:
        # 401 or 403 as you prefer
        raise HTTPException(status_code=403, detail="Forbidden")

    # now do a real ping
    pong = await redis_client.ping()
    return {"ok": pong}


# export the Mangum handler
handler = Mangum(app)
