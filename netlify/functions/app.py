import os

from fastapi       import FastAPI, Header, HTTPException
from mangum        import Mangum
from upstash_redis import Redis

app = FastAPI()

# build Redis client from env-vars
redis_client = Redis.from_url(
    os.environ["UPSTASH_URL"],
    token=os.environ["UPSTASH_TOKEN"],
)

@app.get("/health")
async def health(x_api_key: str = Header(None)):
    expected = os.environ.get("UPSTASH_TOKEN")
    if x_api_key != expected:
        # reject if no header or bad header
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        # do the actual Redis ping
        pong = await redis_client.ping()
    except Exception as e:
        # bubble up any Redis errors as a 500
        raise HTTPException(status_code=500, detail=f"Redis error: {e}")

    return {"ok": pong}


# export the handler
handler = Mangum(app)
