export class ApiRequestError extends Error {
	public readonly status: number;
	public readonly code: string;

	public constructor(status: number, code: string, message: string) {
		super(message);
		this.name = "ApiRequestError";
		this.status = status;
		this.code = code;
	}
}
