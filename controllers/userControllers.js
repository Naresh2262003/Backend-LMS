import AppError from "../utils/errorUtils.js";
import User from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import cloudinary from "cloudinary";
import fs from "fs/promises";

const cookieOptions={
    maxAge:7*24*60*60*1000,
    httpOnly:true,
    secure:true
}

const register= async (req, res, next)=>{
    try{
        const {fullname, email, password}= req.body;

        if(!fullname || !email || !password){
            return next( new AppError("All fields are required",400));
        }

        const userExits= await User.findOne({email});

        if(userExits){
            return next(new AppError("Email Id already exists",400));
        }

        const user= await User.create({
            fullname,
            email,
            password,
            avatar:{
                public_id:email,
                secure_url:"https://pwskills.com/learn/course/full-stack-web-development-1-hindi/63a2ecf58899439c8d7ebdc6/lesson/64ac24d16977cc2405e3aa1d/?from=%2Flearn%2F&sectionId=64ac248b6977ccd929e3aa09&lectureType=video"
            }
        });

        if(!user){
            next(new AppError("User registration failed! please try again later",400));
        }

        // TODO file Upload
        if(req.file){
            try{
                const result= await cloudinary.v2.uploader.upload(req.file.path,{
                    folder:'lms',
                    width:250,
                    height:250,
                    gravity:'faces',
                    crop:'fill'
                });

                if(result){
                    user.avatar.public_id= result.public_id;
                    user.avatar.secure_url= result.secure_url;

                    // remove file from server
                    fs.rm(`uploads/${req.file.filename}`);
                }
            }catch(e){
                return next(new AppError(e.message|| "file not uploaded, please try again later!",404));
            }
        }

        await user.save();
        user.password=undefined;

        const token= await user.generateJWTToken();
        res.cookie("token",token,cookieOptions);

        return res.status(200).send({
            success:true,
            message:"User registered successfully",
            data: user
        });
    }catch(e){
        return next(new AppError("Something went Wrong",400));
    }
}

const login= async(req, res, next)=>{
    try{
        const {email, password}= req.body;
        console.log(req.body);

        if(!email || !password){
            return next(new AppError("All fields are required",400));
        }

        const user= await User.findOne({email}).select("+password");

        if(!user || !await user.comparePassword(password)){
            return next(new AppError("Email or Password do not match",400));
        }

        const token= await user.generateJWTToken();
        user.password= undefined;

        res.cookie('token',token,cookieOptions);

        return res.status(200).send({
            success:true,
            message:"User logged In successfully",
            data:user
        });
    }catch(e){
        return next(new AppError(e.message,500));
    }
}

const logout= (req, res)=>{
    res.cookie('token',null,{
        maxAge:0,
        httpOnly:true,
        secure:true
    });

    return res.status(200).send({
        success:true,
        message:"User logged Out successfully"
    });
}

const getProfile= async (req, res, next)=>{
    try{
        const userId= req.user.id;
        const user= await User.findById(userId);

        res.status(200).send({
            success:true,
            message:"User Info",
            data: user
        });
    }catch(e){
        return next(new AppError("Failed to fetch user profile Info",500));
    }
}

const forgetPassword= async(req,res, next)=> {
    const {email}= req.body;
    if(!email){
        return next(new AppError("Email is required",400));
    }

    const user = await User.findOne({email});
    if(!user){
        return next(new AppError("Email is not registered",400));
    }

    const resetToken= await user.generatePasswordResetToken();
    await user.save();

    const resetPasswordURL= `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const subject= "Reset Password";
    const message= `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank"> Reset your Password </a> If the above link does not work copy paste this code: ${resetPasswordURL} in a new tab.`;

    try{
        await sendEmail(email, subject, message);

        return res.status(200).send({
            success: true,
            message:`Reset Password Token has been sent to ${email}`
        });
    }catch(e){
        user.forgetPasswordToken=undefined;
        user.forgetPasswordExpiry=undefined;
        await user.save();

        return next(new AppError(e.message,400));
    }
}

const resetPassword= async(req, res, next)=>{
    const {resetToken}= req.params;
    const {password}= req.body;

    console.log(resetToken);

    const forgetPasswordToken= crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log(forgetPasswordToken);

    const user= await User.findOne({forgetPasswordToken,forgetPasswordExpiry:{$gt:Date.now()}});

    if(!user){
        return next(new AppError("Token is invalid or expired",400));
    }

    user.password= password;
    user.forgetPasswordToken= undefined;
    user.forgetPasswordExpiry= undefined;

    await user.save();

    return res.status(200).send({
        success:true,
        message:"Password reset successfully!!"
    });
}

const changePassword= async(req, res, next)=>{
    const {oldPassword, newPassword} = req.body;
    const {id}= req.user;

    if(!oldPassword || !newPassword){
        return next(new AppError("All fields are mandatory.",400));
    }

    const user= await User.findById(id).select("+password");

    if(!user || !await user.comparePassword(oldPassword)){
        return next(new AppError("User not find",400));
    }

    user.password= newPassword;
    await user.save();

    user.password= undefined;

    return res.status(200).send({
        success:true,
        message:"Password changed"
    });
}

const updateUser= async(req, res, next)=>{
    const {fullName}= req.body;
    const {id}= req.user;

    const user= await User.findById(id);

    if(!user){
        return next(new AppError("User not found",400));
    }

    if(fullName){
        user.fullname=fullName;
        await user.save();
    }
    return res.status(200).send({
        success:true,
        message:"User's name has been updated"
    });
}

export{
    register,
    login,
    logout,
    getProfile,
    forgetPassword,
    resetPassword,
    changePassword,
    updateUser
}