import jwt from "jsonwebtoken";
import AppError from "../utils/errorUtils.js";

const isLoggedIn= async(req, res, next)=>{
    const { token } = req.cookies;

    if (!token) {
        return next(new AppError("Please login", 400));
    }

    try {
        const userDetails = await jwt.verify(token, process.env.SECRET);
        req.user = userDetails;
        next();
    } catch (err) {
        return next(new AppError("Invalid token", 401)); // Handle invalid token error
    }
}

const autherisation= (...roles)=> (req, res, next)=>{
    const userRole= req.user.role;

    if(!roles.includes(userRole)){
        return next(new AppError("You do not have permission to access this route",400));
    }

    next();
}

const autherizedSubscriber= (req, res, next)=> {
    const userSubscriptionStatus= req.user.subscription.status;
    const userRole= req.user.role;

    if(userRole!=='ADMIN' && userSubscriptionStatus!=='active'){
        return next(new AppError("Please subscribe to the course to see course details",500));
    }
    next();
}

export{
    isLoggedIn,
    autherisation,
    autherizedSubscriber
}