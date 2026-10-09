import { DomainError } from "./DomainError";

export class EmailAlreadyInUseError extends DomainError {
	public constructor() {
		super("EMAIL_ALREADY_IN_USE", "Email is already in use");
	}
}
