import { getRedisClient } from "../config/redis.js";

const REFRESH_KEY = (id) => `refresh_token:${id}`;
const REFRESH_TTL = 60 * 60 * 24 * 7;

export async function saveRefreshTokenToRedis(userId, refreshToken) {
  try {
    const client = await getRedisClient();
    const key = REFRESH_KEY(userId);
    const value = refreshToken;
    await client.set(key, value, {
      EX: REFRESH_TTL,
    });
  } catch (error) {
    console.error("Error saving refresh token to Redis:", error);
    throw new Error("Error saving refresh token to Redis");
  }
}

export async function getRefreshTokenFromRedis(userId) {
  try {
    const client = await getRedisClient();
    const key = REFRESH_KEY(userId);
    const token = await client.get(key);
    return token;
  } catch (error) {
    console.error("Error getting refresh token to Redis:", error);
    throw new Error("Error getting refresh token to Redis");
  }
}

export async function deleteRefreshTokenFromRedis(userId) {
  try {
    const client = await getRedisClient();
    const key = REFRESH_KEY(userId);
    const deleted = await client.del(key);
    return deleted > 0;
  } catch (error) {
    console.error("Error deleting refresh token to Redis:", error);
    throw new Error("Error deleting refresh token to Redis");
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
