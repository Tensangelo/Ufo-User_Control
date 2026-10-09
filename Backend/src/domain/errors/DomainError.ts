export class DomainError extends Error {
	public constructor(
		public readonly code: string,
		message: string,
	) {
		super(message);
		this.name = new.target.name;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
