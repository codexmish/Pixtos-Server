import app from "./app";
import { dbConfig } from "./app/configs/dbConfig";
import envConfig from "./app/configs/envConfig";
const port = envConfig.port


const main = async () => {
	try {

        // ----db connection
        await dbConfig()


		app.listen(port, () => {
			console.log(`server running on port ${port}`);
		});
	} catch (error) {
		console.error("Error starting the server:", error);
		process.exit(1);
	}
};

main();