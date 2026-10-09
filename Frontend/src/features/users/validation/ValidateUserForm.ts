export interface UserFormErrors {
	readonly name?: string;
	readonly email?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUserForm(input: { name: string; email: string }): UserFormErrors | null {
	const name = input.name.trim();
	const email = input.email.trim();
	const nameError = validateName(name);
	const emailError = validateEmail(email);
	if (!nameError && !emailError) return null;
	return { name: nameError, email: emailError };
}

function validateName(name: string): string | undefined {
	if (!name) return "El nombre es obligatorio.";
	if (name.length > 100) return "El nombre admite hasta 100 caracteres.";
	return undefined;
}

function validateEmail(email: string): string | undefined {
	if (!email) return "El correo es obligatorio.";
	if (email.length > 255 || !EMAIL_PATTERN.test(email)) return "El correo no es válido.";
	return undefined;
}
