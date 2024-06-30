import User from "../models/userModel.js";
import Payment from "../models/paymentModel.js";
import razorpay  from "../server.js";
import AppError from "../utils/errorUtils.js";
import crypto from "crypto";
// import {razorpay} from "../server.js";

// console.log(razorpay);
// console.log(await razorpay);

const getRazorpayApiKey= async(req, res, next)=>{
    try{
        return res.status(200).send({
            success:true,
            message:`Get Razorpay key ${process.env.RAZORPAY_KEY_ID}`
        });
    }catch(e){
        return next(new AppError(e.message,500));
    }
}

const buySubscription= async(req, res, next)=>{
    try{
        const {id}= req.user;
        const user= await User.findById(id);

        if(!user){
            return next(new AppError("Unautherized, Please login!",400));
        }

        if(user.role==='ADMIN'|| user.subscription.status!==undefined){
            return next(new AppError("Admins and the one who already have this subscription, can't buy any course subsciption",400));
        }

        const subscription= await razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            total_count: 1,
        });

        user.subscription.id= subscription.id;
        user.subscription.status= subscription.status;

        await user.save();

        return res.status(200).send({
            success:true,
            message:"successfully subscribed",
            subscription_id:subscription.id
        });
    }catch(e){
        console.log(e);
        return next(new AppError(e.message,500));
    }
}

const verifySubscription= async(req, res, next)=>{
    try{
        const {id}= req.user;
        const {razorpay_payment_id, razorpay_subscription_id, razorpay_signature }= req.body;

        const user= await User.findById(id);
        if(!user){
            return next(new AppError("Unautherized, Please login!",400));
        }

        const subscriptionId= user.subscription.id;

        const generatedSignature= crypto
                    .createHmac('sha256',process.env.RAZORPAY_KEY_SECRET)
                    .update(`${razorpay_payment_id}|${subscriptionId}`)
                    .digest('hex');
        
        if(generatedSignature!== razorpay_signature){
            return next(new AppError("Payment not verified! please try again or later",400));
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature 
        })

        user.subscription.status= 'active';
        await user.save();

        return res.status(200).send({
            success:true,
            message:"Payment verified successfully!"
        });
    }catch(e){
        return next(new AppError(e.message,500));
    }
}

const cancelSubscription= async(req, res, next)=>{
    try{
        const {id}= req.user;
    
        const user= await User.findById(id);
        if(!user){
            return next(new AppError("Unautherized, Please login!",400));
        }

        if(user.role==='ADMIN' ){
            return next(new AppError("Admins dont have any subscription to cancel",400));
        }

        const subscriptionId= user.subscription.id;
        
        // try the below line if the first one gives error
        const subsciption= await razorpay.subscriptions.cancel({subscriptionId});
        // const subsciption= await razorpay.subscriptions.cancel({id:subscriptionId});

        user.subscription.status= subsciption.status;
        await user.save();

        return res.status(200).send({
            success:true,
            message:"Successfully cancelled your subscription"
        });

    }catch(e){
        return next(new AppError(e.message,500));
    }
}

const allPayments= async(req, res, next)=>{
    try{
        const {count}= req.query;
        const subscriptions= await razorpay.subscriptions.all({count:count||10});

        return res.status(200).send({
            success:true,
            message:"Payment Details",
            details:subscriptions
        });
    }catch(e){
        return next(new AppError(e.message,500));
    }
}

export{
    getRazorpayApiKey,
    buySubscription,
    verifySubscription,
    cancelSubscription,
    allPayments
}