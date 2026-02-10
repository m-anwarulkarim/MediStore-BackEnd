import { Router } from "express";
import { manufacturerController } from "./manufacturer.controller";

const router = Router();

router.get("/", manufacturerController.getAllManufacturers);

export const manufacturerRouter = router;
