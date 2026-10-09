import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { CreateUserUseCase } from "../../../application/useCases/CreateUserUseCase";
import { DeleteUserUseCase } from "../../../application/useCases/DeleteUserUseCase";
import { ExportUsersUseCase } from "../../../application/useCases/ExportUsersUseCase";
import { GetUserByIdUseCase } from "../../../application/useCases/GetUserByIdUseCase";
import { ListUsersUseCase } from "../../../application/useCases/ListUsersUseCase";
import { UpdateUserUseCase } from "../../../application/useCases/UpdateUserUseCase";
import { userHttpParser } from "../parsers/UserHttpParser";
import { presentUser } from "../presenters/UserPresenter";

@injectable()
export class UserController {
	public constructor(
		@inject(CreateUserUseCase) private readonly createUserUseCase: CreateUserUseCase,
		@inject(GetUserByIdUseCase) private readonly getUserByIdUseCase: GetUserByIdUseCase,
		@inject(UpdateUserUseCase) private readonly updateUserUseCase: UpdateUserUseCase,
		@inject(DeleteUserUseCase) private readonly deleteUserUseCase: DeleteUserUseCase,
		@inject(ListUsersUseCase) private readonly listUsersUseCase: ListUsersUseCase,
		@inject(ExportUsersUseCase) private readonly exportUsersUseCase: ExportUsersUseCase,
	) {}

	public readonly create = async (req: Request, res: Response): Promise<void> => {
		const input = userHttpParser.parseCreate(req.body);
		const user = await this.createUserUseCase.execute(input);
		res.status(201).json({ data: presentUser(user) });
	};

	public readonly list = async (req: Request, res: Response): Promise<void> => {
		const query = userHttpParser.parseList(req.query);
		const result = await this.listUsersUseCase.execute(query);
		res.status(200).json({
			data: result.items.map((user) => presentUser(user)),
			page: result.page,
			pageSize: result.pageSize,
			total: result.total,
			totalPages: result.totalPages,
		});
	};

	public readonly exportUsers = async (_req: Request, res: Response): Promise<void> => {
		let hasStarted = false;
		await this.exportUsersUseCase.execute({
			write: async (chunk: string): Promise<void> => {
				if (!hasStarted) {
					res.status(200);
					res.setHeader("Content-Type", "text/csv; charset=utf-8");
					res.setHeader("Content-Disposition", 'attachment; filename="users.csv"');
					hasStarted = true;
				}
				if (!res.write(chunk)) {
					await waitForDrain(res);
				}
			},
		});
		res.end();
	};

	public readonly getById = async (req: Request, res: Response): Promise<void> => {
		const params = userHttpParser.parseId(req.params);
		const user = await this.getUserByIdUseCase.execute(params.id);
		res.status(200).json({ data: presentUser(user) });
	};

	public readonly update = async (req: Request, res: Response): Promise<void> => {
		const params = userHttpParser.parseId(req.params);
		const input = userHttpParser.parseUpdate(req.body);
		const user = await this.updateUserUseCase.execute(params.id, input);
		res.status(200).json({ data: presentUser(user) });
	};

	public readonly remove = async (req: Request, res: Response): Promise<void> => {
		const params = userHttpParser.parseId(req.params);
		await this.deleteUserUseCase.execute(params.id);
		res.status(204).send();
	};
}

function waitForDrain(res: Response): Promise<void> {
	return new Promise((resolve, reject) => {
		const onDrain = (): void => {
			res.off("error", onError);
			resolve();
		};
		const onError = (error: Error): void => {
			res.off("drain", onDrain);
			reject(error);
		};
		res.once("drain", onDrain);
		res.once("error", onError);
	});
}
