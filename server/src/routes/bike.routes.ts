import express from "express";
import { BikeController } from "../controllers/bike-controller";
import { authorization } from "../middleware/auth.middleware";

const router = express.Router();
const bikeController = new BikeController();

// Public routes
router.get("/", bikeController.getAll);
router.get("/frequently-booked", bikeController.getFrequentlyBooked);
router.get("/recent-booked", bikeController.getRecentBooked);
router.get("/mine", authorization, bikeController.getMine);
router.get("/search", bikeController.search);
router.get("/:id", bikeController.getOne);
// search

// Protected routes (require authentication)
router.use(authorization);

router.post("/", bikeController.create);
router.put("/:id", bikeController.update);
router.delete("/:id", bikeController.delete);
router.patch("/:id/status", bikeController.updateStatus);

export default router;
