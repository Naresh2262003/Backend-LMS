import {Router} from "express";
import { getAllLectures, getLecturesByCourseId , createCourse, updateCourse, deleteCourse, addLectureToCourseById } from "../controllers/courseControllers.js";
import { isLoggedIn, autherisation, autherizedSubscriber } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";

const router= Router();

router.route("/")
            .get(getAllLectures)
            .post(isLoggedIn, autherisation('ADMIN'), upload.single("thumbnail"),createCourse);
            
router.route("/:id")
            .get(isLoggedIn, autherizedSubscriber ,getLecturesByCourseId)
            .put(isLoggedIn, autherisation('ADMIN'), updateCourse)
            .delete(isLoggedIn, autherisation('ADMIN'), deleteCourse)
            .post(isLoggedIn, autherisation('ADMIN'), upload.single("thumbnail"), addLectureToCourseById);

export default router;