import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({
    url: REDIS_URL
});

client.on('error', (err) => console.log('Redis Client Error', err));

client.on('connect', () => {
    console.log('✅ Redis connected successfully at', REDIS_URL);
});

await client.connect();

export default client;