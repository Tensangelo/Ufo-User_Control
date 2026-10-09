import { DomainError } from "./DomainError";

export class InvalidPaginationError extends DomainError {
	public constructor() {
		super("INVALID_PAGINATION", "Pagination parameters are invalid");
	}
}
