import { InvalidUserInputError } from "../errors/InvalidUserInputError";

const UUID_V4_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertUserId(id: string): void {
	if (!UUID_V4_PATTERN.test(id)) {
		throw new InvalidUserInputError("User id is invalid");
	}
}
