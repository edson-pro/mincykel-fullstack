import { Router } from "express";
import { BookingController } from "../controllers/booking-controller";
import { authorization } from "../middleware/auth.middleware";

const router = Router();
const bookingController = new BookingController();

bookingController.startCleanupScheduler();

router.post("/create", authorization, bookingController.create);
router.post("/webhook", bookingController.handleWebhook);
router.post("/run-cleanup", bookingController.runCleanup);

router.get("/my-bookings", authorization, bookingController.getMyBookings);

// get invoice
router.get("/:id", authorization, bookingController.getOne);
router.get("/:id/invoice", authorization, bookingController.downloadInvoice);

export default router;
