import { redisClient } from "../configs/redisConfig";

// -----save any data  ==== ttl (Time to live) (secounds)
export const setRedis = async (key: string, value: unknown, ttl?: number) => {
	if (ttl) {
		// -----ttl given: save with expiry
		await redisClient.set(key, JSON.stringify(value), {
			expiration: {
				type: "EX",
				value: ttl,
			},
		});
	} else {
		// -----no ttl: save forever
		await redisClient.set(key, JSON.stringify(value));
	}
};

// -----get data back in its original type, or null if not found / expired
export const getRedis = async (key: string) => {
	const data = await redisClient.get(key);
	return data ? JSON.parse(data) : null;
};

// -----delete data
export const deleteRedis = async (key: string | string[]) => {
	await redisClient.del(key);
};
