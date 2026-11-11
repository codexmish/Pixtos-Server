import express, { Application, Request, Response } from "express";
import cors from "cors";
import envConfig from "./app/configs/envConfig";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { globalErrorHandaler } from "./app/middleware/globalErrorHandaler";
import { requestLogger } from "./app/middleware/requestLogger";
import router from "./app/routes";

const app: Application = express();

// =====request logger (first, so every request is logged)
app.use(requestLogger);

app.use(helmet());
app.use(express.json());

// =====behind a proxy in production, so limiter sees the real user ip
if (envConfig.node_env === "production") {
	app.set("trust proxy", 1);
}

app.use(
	cors({
		origin: envConfig.frontend_url,
		credentials: true,
	}),
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(envConfig.BASE_URL, router);
// ========Test route======
app.get("/", async (req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: "Welcome to Pixtos",
	});
});

// =======
app.use(globalErrorHandaler);

export default app;
