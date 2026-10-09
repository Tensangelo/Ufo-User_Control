import { Router } from "express";
import { container } from "tsyringe";
import { withTryCatch } from "../../../../decorators/WithTryCatch";
import { UserController } from "../../controllers/UserController";

const router = Router();
const userController = container.resolve(UserController);

router.get("/export", withTryCatch(userController.exportUsers));
router.get("/", withTryCatch(userController.list));
router.get("/:id", withTryCatch(userController.getById));
router.post("/", withTryCatch(userController.create));
router.patch("/:id", withTryCatch(userController.update));
router.delete("/:id", withTryCatch(userController.remove));

export default router;
