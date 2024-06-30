import {Schema, model} from "mongoose";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import crypto from "crypto";

const userSchema= new Schema({
    fullname:{
        type:String,
        required:[true,"Name of the User is Required"],
        minLength:[5,"User's Name should be of at least 5 characters"],
        maxLength:[50,"Maximum Limit to User's Name is exceeded"],
        lowercase:true,
        trim:true
    }, 
    email:{
        type:String,
        required:[true,"Email Id is required"],
        lowercase:true,
        trim:true,
        unique:[true,"Email Id is already registered"],
        match:[
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Please enter a valid Email Id"
        ]
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minLength:[8,"Password Should be of atleast 8 chracters"],
        select:false
    },
    avatar:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        }
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER"
    },
    forgetPasswordToken: String,
    forgetPasswordExpiry: Date,
    subscription:{
        id: String,
        status:String
    }
},{
    timestamps:true
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }

    this.password= await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods={
    generateJWTToken: async function(){
        return await JWT.sign(
            {id: this._id, email: this.email, subscription: this.subscription, role: this.role},
            process.env.SECRET,
            {expiresIn: '24h'}
        )
    },
    comparePassword:async function(originalPassword){
        console.log(this.password,originalPassword)
        return await bcrypt.compare(originalPassword,this.password);
    },
    generatePasswordResetToken: async function(){
        const resetToken= crypto.randomBytes(20).toString('hex');
        this.forgetPasswordToken= crypto.createHash('sha256')
                                        .update(resetToken)
                                        .digest('hex');
        this.forgetPasswordExpiry= Date.now()+ 15*60*1000;
        return resetToken;
    }
}

const User= model("User", userSchema);

export default User;