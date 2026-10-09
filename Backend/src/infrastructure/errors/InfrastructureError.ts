export class InfrastructureError extends Error {
	public readonly cause?: unknown;

	public constructor(message: string, cause?: unknown) {
		super(message);
		this.name = "InfrastructureError";
		this.cause = cause;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
