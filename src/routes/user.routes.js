import {Router} from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar,  updateUserCoverImage, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-accessToken").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changePassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails); //patch is used to update a part of the resource not the entire resource
router.route("/update-user-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/update-user-coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/user-channel-profile/:username").get(getUserChannelProfile);
router.route("/watch-history").get(verifyJWT, getWatchHistory);




// router.route("/register").post(
    
//     registerUser
// )

export default router;