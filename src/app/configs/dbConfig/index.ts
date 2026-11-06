import mongoose from "mongoose";
import envConfig from "../envConfig";

export const dbConfig = async () => {
	try {
		await mongoose.connect(envConfig.DATABASE_URL as string);
		console.log("MongoDb Connected");
	} catch (error) {
		console.error("MongoDB connection error:", error);
		throw error;
	}
};
