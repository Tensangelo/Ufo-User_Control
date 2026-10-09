import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { DomainError } from "../../../domain/errors/DomainError";
import { InfrastructureError } from "../../errors/InfrastructureError";

const HTTP_STATUS_BY_DOMAIN_CODE: Readonly<Record<string, number>> = {
	INVALID_USER_INPUT: 400,
	INVALID_PAGINATION: 400,
	USER_NOT_FOUND: 404,
	EMAIL_ALREADY_IN_USE: 409,
};

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
	if (error instanceof DomainError) {
		const status = HTTP_STATUS_BY_DOMAIN_CODE[error.code] ?? 400;
		console.warn(`[Domain] ${error.code}: ${error.message}`);
		res.status(status).json({
			success: false,
			error: {
				code: error.code,
				message: error.message,
			},
		});
		return;
	}
	if (error instanceof ZodError) {
		res.status(400).json({
			success: false,
			error: {
				code: "INVALID_USER_INPUT",
				message: error.issues.map((issue) => issue.message).join(", "),
			},
		});
		return;
	}
	if (isInvalidJson(error)) {
		res.status(400).json({
			success: false,
			error: {
				code: "INVALID_JSON",
				message: "Invalid JSON body",
			},
		});
		return;
	}
	if (error instanceof InfrastructureError) {
		console.error("[Infrastructure]", error.message, error.cause);
	} else {
		console.error("[Error]", error instanceof Error ? error.stack ?? error.message : error);
	}
	res.status(500).json({
		success: false,
		error: {
			code: "INTERNAL_ERROR",
			message: "Internal server error",
		},
	});
}

function isInvalidJson(error: unknown): boolean {
	if (!(error instanceof SyntaxError) || !("status" in error)) {
		return false;
	}
	return error.status === 400;
}
