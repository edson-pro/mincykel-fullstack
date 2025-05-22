import express from "express";
import { validateQuery } from "../middleware/query-validation.middleware";
import { QueryParams } from "../types/QueryParams";
import { UsersController } from "../controllers/users-controller";

const router = express.Router({ mergeParams: true });

const controller = new UsersController();

router.get(
  "/customers",
  validateQuery(QueryParams),
  controller.getAllCustomers
);

router.get(
  "/system-users",
  validateQuery(QueryParams),
  controller.getAllSystemUsers
);

// update
router.patch("/:id", controller.update);

// create
router.post("/", controller.create);

export default router;
