import { z } from "zod";

const createUserBodySchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
	email: z.string().trim().email("Email is invalid").max(255, "Email is invalid"),
});

const updateUserBodySchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, "Name is required")
			.max(100, "Name must be at most 100 characters")
			.optional(),
		email: z.string().trim().email("Email is invalid").max(255, "Email is invalid").optional(),
	})
	.refine((body) => body.name !== undefined || body.email !== undefined, {
		message: "At least one field is required",
	});

const idParamsSchema = z.object({
	id: z.string().uuid("User id is invalid"),
});

const positiveInteger = z
	.string()
	.regex(/^[1-9]\d*$/, "Must be a positive integer")
	.transform((value) => Number(value))
	.optional();

const listQuerySchema = z.object({
	page: positiveInteger,
	pageSize: positiveInteger,
	search: z
		.string()
		.trim()
		.max(255, "Search must be at most 255 characters")
		.optional()
		.transform((value) => (value === undefined || value.length === 0 ? undefined : value)),
});

export const userHttpParser = {
	parseCreate(body: unknown): { name: string; email: string } {
		return createUserBodySchema.parse(body);
	},
	parseUpdate(body: unknown): { name?: string; email?: string } {
		return updateUserBodySchema.parse(body);
	},
	parseId(params: unknown): { id: string } {
		return idParamsSchema.parse(params);
	},
	parseList(query: unknown): { page?: number; pageSize?: number; search?: string } {
		return listQuerySchema.parse(query);
	},
};
