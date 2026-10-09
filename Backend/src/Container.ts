import "reflect-metadata";
import { container } from "tsyringe";
import { USER_REPOSITORY_TOKEN } from "./application/tokens/UserRepositoryToken";
import { UserRepository } from "./domain/ports/UserRepository";
import { UserRepositorySequelize } from "./infrastructure/db/sequelize/repositories/UserRepositorySequelize";

container.register<UserRepository>(USER_REPOSITORY_TOKEN, {
	useClass: UserRepositorySequelize,
});
