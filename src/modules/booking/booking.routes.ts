import { Router } from "express";
import auth from "../../middleware/auth";
import { bookingController } from "./booking.controller";

const router = Router();
router.post("/", auth("customer", "admin"), bookingController.createBooking);
router.get("/", auth("customer", "admin"), bookingController.getAllBookings);
router.put("/:bookingId", auth("customer", "admin"), bookingController.updateBooking);

export const bookingRoutes = router;