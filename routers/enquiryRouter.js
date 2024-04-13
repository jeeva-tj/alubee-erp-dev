import express from "express";
const router = express.Router();
import { 
   customerEmailDetails,
   addProspectManual,
   enquiryProspectList,
   enquiryCustomerList,
   enquiryAcceptDeny,
   enquiryCloseDescription,
   getClosedDescriptionById
} from "../controllers/enquiryController.js";
import { userProtect } from '../middlewares/AuthMiddleware.js';


router.route('/customer-email').post(userProtect, customerEmailDetails);
router.route('/add-prospect').post(userProtect, addProspectManual);
router.route('/prospect').get(userProtect, enquiryProspectList);
router.route('/customer').get(userProtect, enquiryCustomerList);
router.route('/accept-deny').post(userProtect, enquiryAcceptDeny);
router.route('/close-desc').post(userProtect, enquiryCloseDescription)
router.route('/close-desc/:id') .get(userProtect, getClosedDescriptionById);

export default router;