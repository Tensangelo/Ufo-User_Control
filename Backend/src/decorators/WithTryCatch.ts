import { NextFunction, Request, RequestHandler, Response } from "express";

export function withTryCatch(handler: RequestHandler): RequestHandler {
	return (req: Request, res: Response, next: NextFunction): void => {
		Promise.resolve(handler(req, res, next)).catch((error: unknown) => {
			if (res.headersSent) {
				res.end();
				return;
			}
			next(error);
		});
	};
}
