import { DomainError } from "./DomainError";

export class InvalidUserInputError extends DomainError {
	public constructor(message: string) {
		super("INVALID_USER_INPUT", message);
	}
}
