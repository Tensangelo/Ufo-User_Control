import { UniqueConstraintError } from "sequelize";
import { DomainError } from "../../../domain/errors/DomainError";
import { EmailAlreadyInUseError } from "../../../domain/errors/EmailAlreadyInUseError";
import { InfrastructureError } from "../../errors/InfrastructureError";

/**
 * Turns a driver error into a domain or infrastructure error.
 * A unique email collision is a domain conflict, including the race the pre-check can miss.
 * @param error - Value caught at the repository boundary.
 */
export function mapDatabaseError(error: unknown): Error {
	if (error instanceof DomainError || error instanceof InfrastructureError) {
		return error;
	}
	if (error instanceof UniqueConstraintError) {
		return new EmailAlreadyInUseError();
	}
	return new InfrastructureError("Database operation failed", error);
}
