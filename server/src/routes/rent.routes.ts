import { Router } from "express";
import { RentController } from "../controllers/rent-controller";

const router = Router();
const rentController = new RentController();

router.post("/request-payment-checkout", rentController.requestPaymentCheckout);

export default router;
