import { NextFunction, Request, Response } from "express";

// -----log every request: method, url, status and time taken
export const requestLogger = (req: Request, res:Response, next: NextFunction) => {
	const start = Date.now();

	// -----"finish" runs after the response is sent, so the status is known
	res.on("finish", () => {
		const time = Date.now() - start;
		console.log(
			`${req.method} ${req.originalUrl} ${res.statusCode} - ${time}ms`,
		);
	});

	next();
};