import { Router } from "express";
import { SettingController } from "../controllers/SettingController";

const router = Router();
const settingController = new SettingController();

router.post("/", settingController.upsert);
router.get("/:key", settingController.get);
router.get("/", settingController.list);
router.delete("/:key", settingController.delete);

export default router;
