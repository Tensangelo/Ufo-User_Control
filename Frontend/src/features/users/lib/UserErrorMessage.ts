import { ApiRequestError } from "@/shared/lib/ApiError";

const MESSAGE_BY_CODE: Readonly<Record<string, string>> = {
	EMAIL_ALREADY_IN_USE: "Ese correo ya está registrado.",
	INVALID_USER_INPUT: "Revisa el nombre y el correo.",
	INVALID_JSON: "Los datos enviados no son válidos.",
	USER_NOT_FOUND: "Ese usuario ya no existe.",
	NETWORK: "No hay conexión con la API. Confirma que el backend esté en el puerto 3000.",
};

export function userErrorMessage(error: unknown): string {
	if (error instanceof ApiRequestError) {
		return MESSAGE_BY_CODE[error.code] ?? "No se pudo completar la acción.";
	}
	return "No se pudo completar la acción.";
}
