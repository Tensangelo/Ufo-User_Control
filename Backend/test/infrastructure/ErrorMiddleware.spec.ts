import { Request, Response } from "express";
import { EmailAlreadyInUseError } from "../../src/domain/errors/EmailAlreadyInUseError";
import { errorHandler } from "../../src/infrastructure/http/middlewares/ErrorMiddleware";

describe("errorHandler", () => {
	it("maps an email conflict to 409", () => {
		jest.spyOn(console, "warn").mockImplementation(() => undefined);
		const response = {
			status: jest.fn(),
			json: jest.fn(),
		};
		response.status.mockReturnValue(response);
		errorHandler(
			new EmailAlreadyInUseError(),
			{} as Request,
			response as unknown as Response,
			jest.fn(),
		);
		expect(response.status).toHaveBeenCalledWith(409);
		expect(response.json).toHaveBeenCalledWith({
			success: false,
			error: {
				code: "EMAIL_ALREADY_IN_USE",
				message: "Email is already in use",
			},
		});
	});
});
