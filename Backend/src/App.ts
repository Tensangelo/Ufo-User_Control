import cors from "cors";
import express, { Application, Request, Response } from "express";
import { ENVS_APP } from "./config/Envs";
import { errorHandler } from "./infrastructure/http/middlewares/ErrorMiddleware";
import UserRoute from "./infrastructure/http/routes/v1/UserRoute";

export default class App {
	public readonly app: Application;
	private readonly port: number;

	public constructor(port: number) {
		this.app = express();
		this.port = port;
		this.initializeMiddlewares();
		this.initializeRoutes();
		this.initializeNotFound();
		this.initializeErrorHandling();
	}

	public listen(): void {
		this.app.listen(this.port, () => {
			const environment = process.env.NODE_ENV ?? "development";
			console.log(`[HTTP] Listening on port ${this.port} (${environment})`);
		});
	}

	public getServer(): Application {
		return this.app;
	}

	private initializeMiddlewares(): void {
		this.app.use(cors({ origin: ENVS_APP.CORS_ORIGIN }));
		this.app.use(express.json({ limit: "1mb" }));
		this.app.use(express.urlencoded({ extended: true }));
	}

	private initializeRoutes(): void {
		this.app.use("/api/v1/users", UserRoute);
	}

	private initializeNotFound(): void {
		this.app.use((_req: Request, res: Response) => {
			res.status(404).json({
				success: false,
				error: {
					code: "ROUTE_NOT_FOUND",
					message: "Route not found",
				},
			});
		});
	}

	private initializeErrorHandling(): void {
		this.app.use(errorHandler);
	}
}
