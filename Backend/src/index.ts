import "reflect-metadata";
import "./config/Envs";
import "./Container";
import App from "./App";
import { connectDatabase } from "./config/Database";
import { ENVS_APP } from "./config/Envs";

async function bootstrap(): Promise<void> {
	await connectDatabase();
	const server = new App(ENVS_APP.PORT);
	server.listen();
}

bootstrap().catch((error: unknown) => {
	console.error("[Bootstrap]", error);
	process.exit(1);
});
