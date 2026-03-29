import { Router } from "express";
import { toggleLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:type/:id").post(verifyJWT, toggleLike);

export default router;