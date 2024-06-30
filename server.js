import app from "./app.js";
import connectToDB from "./config/dbConnection.js";
import cloudinary from "cloudinary";
import Razorpay from 'razorpay';

const PORT= process.env.PORT || 3000;

const res = await cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const razorpay= new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.listen(PORT,()=>{
    connectToDB();
    console.log(`App is running at http://localhost:${PORT}`);
});

export default razorpay;