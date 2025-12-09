import { getRedisClient } from "../config/redis.js";

export async function saveRefreshTokenToRedis(userId, refreshToken) {
  try {
    const client = await getRedisClient();
    const key = "refresh_token:" + userId;
    const value = refreshToken;
    await client.set(key, value, {
      EX: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    console.error("Error saving refresh token to Redis:", error);
    throw new Error("Error saving refresh token to Redis");
  }
}

// tested on redis cli
// 127.0.0.1:6379> KEYS *
// 1) "refresh_token:1"
// 2) "key"
// 127.0.0.1:6379> GET refresh_token:1
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiZGVtbyIsImVtYWlsIjoiZGVtb0BkZW1vLmNvbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzY1MzIwNzAxLCJleHAiOjE3NjU5MjU1MDF9.6Q3ku-V69h9Rqbs1tDSzZWLdNDb_8jHQzTXygpnUOnA"
// 127.0.0.1:6379> TTL refresh_token:1
// (integer) 604578
