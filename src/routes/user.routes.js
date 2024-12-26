import { Router } from "express"
import { registerUser } from "../controllers/user.controllers.js"
import { logoutUser } from "../controllers/user.controllers.js"
import { loginUser } from "../controllers/user.controllers.js"
import { refreshAccessToken } from "../controllers/user.controllers.js"
import upload from "../middlewares/multer.middleware.js"
import validateJwt from "../middlewares/auth.middleware.js"



const router = Router()

router.route("/register").post(
    upload.fields([
            { 
              name: "avatar",
              maxCount: 1 
            
            }, 
            { 
                name: 'coverImage',
                maxCount: 1 
            }
        ]),
    registerUser
)

router.route("/login").post(loginUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/logout").post(
    validateJwt
    ,logoutUser
)


export default router

