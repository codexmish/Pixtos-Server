import app from "./app";
import { dbConfig } from "./app/configs/dbConfig";
import envConfig from "./app/configs/envConfig";
import { redisClient } from "./app/configs/redisConfig";
const port = envConfig.port


const main = async () => {
	try {

        // ----db connection
        await dbConfig()

		// -----redis connection
		await redisClient.connect();
		console.log("redis connected");

		app.listen(port, () => {
			console.log(`server running on port ${port}`);
		});
	} catch (error) {
		console.error("Error starting the server:", error);
		process.exit(1);
	}
};

main();