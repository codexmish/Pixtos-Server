import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.join(process.cwd(), ".env") });

// -----every env var the server needs, missing or empty ones stop the server at startup
const envSchema = z.object({
	NODE_ENV: z.string().default("development"),
	PORT: z.string().default("8000"),
	DATABASE_URL: z.string().min(1),
	FRONTEND_URL: z.string().min(1),
	BASE_URL: z.string().min(1),
	BCRYPT_SALT_ROUNDS: z.string().min(1),
	REDIS_USER: z.string().min(1),
	REDIS_PASS: z.string().min(1),
	REDIS_HOST: z.string().min(1),
	REDIS_PORT: z.string().min(1),
	SMTP_USER: z.string().min(1),
	SMTP_PASS: z.string().min(1),
	JWT_ACCESS_SECRET: z.string().min(1),
	JWT_REFRESH_SECRET: z.string().min(1),
	JWT_ACCESS_EXPIRES_IN: z.string().min(1),
	JWT_REFRESH_EXPIRES_IN: z.string().min(1),
	CLOUDINARY_CLOUD_NAME: z.string().min(1),
	CLOUDINARY_API_KEY: z.string().min(1),
	CLOUDINARY_API_SECRET: z.string().min(1),
	IMAGEKIT_PUBLIC_KEY: z.string().min(1),
	IMAGEKIT_PRIVATE_KEY: z.string().min(1),
	IMAGEKIT_URL_ENDPOINT: z.string().min(1),
});

// -----check process.env against the schema, print which vars are wrong and exit
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("Invalid or missing environment variables in .env:");
	for (const issue of parsed.error.issues) {
		console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
	}
	process.exit(1);
}

const env = parsed.data;

export default {
	node_env: env.NODE_ENV,
	port: env.PORT,
	DATABASE_URL: env.DATABASE_URL,
	frontend_url: env.FRONTEND_URL,
	BASE_URL: env.BASE_URL,
	SALT_ROUNDS: env.BCRYPT_SALT_ROUNDS,
	REDIS_USER: env.REDIS_USER,
	REDIS_PASS: env.REDIS_PASS,
	REDIS_HOST: env.REDIS_HOST,
	REDIS_PORT: env.REDIS_PORT,
	SMTP_USER: env.SMTP_USER,
	SMTP_PASS: env.SMTP_PASS,
	JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
	JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
	JWT_ACCESS_EXPIRES_IN: env.JWT_ACCESS_EXPIRES_IN,
	JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN,
	CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET,
	IMAGEKIT_PUBLIC_KEY: env.IMAGEKIT_PUBLIC_KEY,
	IMAGEKIT_PRIVATE_KEY: env.IMAGEKIT_PRIVATE_KEY,
	IMAGEKIT_URL_ENDPOINT: env.IMAGEKIT_URL_ENDPOINT,
};
