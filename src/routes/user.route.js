import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
<<<<<<< HEAD
import {upload} from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { 
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
);
=======

const router = Router();

router.route("/register").post(registerUser);
>>>>>>> b7a5f7ba04ba6267435fa606d32e6fcd47505fd1

export default router;