const DEFAULT_API_URL = "http://localhost:3000";

export function getApiUrl(): string {
	const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
	if (!configured) return DEFAULT_API_URL;
	return configured.replace(/\/+$/, "");
}
