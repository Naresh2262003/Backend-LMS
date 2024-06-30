import Course from "../models/courseModel.js";
import AppError from "../utils/errorUtils.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

const getAllLectures= async(req, res, next)=>{
    try{
        const courses= await Course.find({}).select("-lectures");
    
        return res.status(200).send({
            success:true,
            message:"All courses",
            courses
        });
    }catch(e){
        return next(new AppError(e.message,400));
    }
}

const getLecturesByCourseId= async(req, res, next)=>{
    try{
        const {id}= req.params;
        const course= await Course.findById(id);

        return res.status(200).send({
            success:true,
            message: "All Lectures",
            lectures: course
        });
    }catch(e){
        return next(new AppError(e.message,400));
    }
}

const createCourse= async(req, res, next)=>{
    const {title, description, category, created_by}= req.body;

    if(!title || !description || !category || !created_by){
        return next(new AppError("All fields are required",400));
    }

    const course= await Course.create({
        title,
        description,
        category,
        created_by,
        thumbnail:{
            public_id:title,
            secure_url:description
        }
    });

    if(!course){
        return next(new AppError("course could not created! please try again later",400));
    }

    if(req.file){
        try{
            const result= await cloudinary.v2.uploader.upload( req.file.path,
                {folder:'lms'}
            )
            console.log(result);
            if(result){
                course.thumbnail.public_id= result.public_id;
                course.thumbnail.secure_url= result.secure_url;

                fs.rm(`uploads/${req.file.filename}`);
            }
        }catch(e){
            return next(new AppError(e.message,500));
        }
    }

    await course.save();

    return res.status(200).send({
        success:true,
        message:"Course has been successfully created",
        data: course
    });
}

const updateCourse= async(req, res, next)=>{
    try{
        const {id}= req.params;

        const course= await Course.findByIdAndUpdate(id,
            {$set:req.body},
            {runValidators:true, new:true}
        )

        if(!course){
            return next(new AppError("Course with the given Id does not match",400));
        }

        return res.status(200).send({
            success:true,
            message:"Course Updated Successfully",
            data:course
        });
    }catch(e){
        return next(new AppError(e.message, 500));
    }
}

const deleteCourse= async(req, res, next)=>{
    try{
        const {id}= req.params;

        const course= await Course.findByIdAndDelete(id);

        if(!course){
            return next(new AppError("Course with the given Id dont exist Only.. WTF were you trying to delate",400));
        }

        return res.status(200).send({
            success:true,
            message:"Deleted course successfully!",
            deleted_Course_details: course
        });

    }catch(e){
        return next(new AppError(e.message, 500));
    }
}

const addLectureToCourseById= async(req, res, next)=>{
    try{
        const {id}= req.params;
        const {title, description}= req.body;

        if(!title || !description){
            return next(new AppError("All the fields are required",400));
        }

        const course= await Course.findById(id);

        if(!course){
            return next(new AppError("Course will the given course Id does not exist!",400));
        }

        const lesson= {
            title,
            description,
            thumbnail:{
                public_id:"Dummy",
                secure_url:"Dummy"
            }
        }

        if(req.file){
            try{
                const result= await cloudinary.v2.uploader.upload( req.file.path,
                    {folder:'lms'}
                )

                if(result){
                    lesson.thumbnail.public_id= result.public_id;
                    lesson.thumbnail.secure_url= result.secure_url;

                    fs.rm(`uploads/${req.file.filename}`);
                }

            }catch(e){
                return next(new AppError(e.message,500));
            }
        }

        console.log(lesson);

        course.lectures.push(lesson);
        course.numberOfLectures= course.lectures.length;
        await course.save();

        return res.status(200).send({
            success:true,
            message:"lecture has been added successfully",
            data:course
        });

    }catch(e){
        return next(new AppError(e.message, 500));
    }
}

export{
    getAllLectures,
    getLecturesByCourseId,
    createCourse,
    updateCourse, 
    deleteCourse,
    addLectureToCourseById
}

