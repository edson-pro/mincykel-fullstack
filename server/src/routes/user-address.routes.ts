import express from "express";
import {
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getUserAddresses,
  makePrimaryAddress,
} from "../controllers/user-address-controller";

const router = express.Router();

router.post("/", createUserAddress);
router.get("/", getUserAddresses);
router.put("/:id", updateUserAddress);
router.delete("/:id", deleteUserAddress);
// make primary
router.put("/:id/make-primary", makePrimaryAddress);

export default router;
