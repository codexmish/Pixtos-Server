import rateLimit from "express-rate-limit";
import httpStatus from "http-status";

// ----------set api req limit
export const limiter = (
	time: number,
	limit: number,
	successSkip: boolean = true,
) => {
	return rateLimit({
		windowMs: time, // Time in milisecound
		limit: limit, // Limit each IP to this many requests per `window`
		// -----same shape as sendResponse, so frontend shows this message
		message: {
			success: false,
			statusCode: httpStatus.TOO_MANY_REQUESTS,
			message: "Too many requests, please try again later.",
		},
		skipSuccessfulRequests: successSkip, // true = only failed requests are counted
	});
};
