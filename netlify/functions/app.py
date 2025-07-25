import os
from mangum import Mangum
from app.main import app
from upstash_redis import Redis

# Initialize your Redis client from the env-vars you set in Netlify:
redis_client = Redis.from_url(
    os.environ["UPSTASH_URL"],
    token=os.environ["UPSTASH_TOKEN"],
)

# Example health-check route
@app.get("/health")
async def health():
    # do a round-trip ping
    pong = await redis_client.ping()
    return {"ok": pong}

# Export the Lambda/Edge handler
handler = Mangum(app)
