import express from "express";
import { saveOrUpdateForm, savePage2 ,getFormById,saveProjects} from "../controllers/formcontroller";
import { getFormByUserId } from "../controllers/formcontroller";
const router = express.Router();

router.post("/page1", saveOrUpdateForm);
router.post("/page2", savePage2 );
router.get("/:id", getFormById);
router.post("/page3", saveProjects);
router.get("/by-user/:userId", getFormByUserId);

export default router;
