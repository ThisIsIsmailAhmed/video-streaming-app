import { Router } from "express"                                                       
import { registerUser } from "../controllers/user.controllers.js"
import { logoutUser } from "../controllers/user.controllers.js"
import { loginUser } from "../controllers/user.controllers.js"
import { refreshAccessToken } from "../controllers/user.controllers.js"
import { changeUserPassword } from "../controllers/user.controllers.js"
import { loggedInUsersDetails } from "../controllers/user.controllers.js"
import { updateUserAvatar } from "../controllers/user.controllers.js"
import { updateUserCoverImage } from "../controllers/user.controllers.js"
import { updateUserDetails } from "../controllers/user.controllers.js"
import { getWatchHistory } from "../controllers/user.controllers.js"
import { userPage } from "../controllers/user.controllers.js"
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

router.route("/logout").post(
    validateJwt
    ,logoutUser
)

router.route("/login").post(loginUser)

router.route("/refresh-token").patch(refreshAccessToken)

router.route("/change-password").patch(validateJwt, changeUserPassword)

router.route("/current-user").get(validateJwt,loggedInUsersDetails)

router.route("/update-avatar").patch(validateJwt, upload.single("avatar"), updateUserAvatar)

router.route("/update-cover-image").patch(validateJwt, upload.single("coverImage"), updateUserCoverImage)

router.route("/update-user-details").patch(validateJwt, updateUserDetails)

router.route("/channel/:username").get(validateJwt, userPage)

router.route("/history").get(validateJwt, getWatchHistory)

export default router

