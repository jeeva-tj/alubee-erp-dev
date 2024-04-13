import express from "express";
const router = express.Router();
import { 
    getLoginProfile,
    login, 
    login_newUser,
    logout 
} from "../controllers/authController.js";
import { userProtect } from '../middlewares/AuthMiddleware.js';


router.route('/login').post(login);
router.route('/login/new').post(userProtect, login_newUser);
router.route('/login/profile').get(userProtect, getLoginProfile);
router.route('/logout').get(logout);

export default router;