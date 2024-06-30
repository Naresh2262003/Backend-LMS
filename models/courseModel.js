import {Schema, model} from "mongoose";

const courseSchema= new Schema({
    title:{
        type:String,
        required:[true,"Title is required"],
        minLength:[5,"Title should have more than 5 characters"],
        maxLength:[60,"Title should not be more than 60 characters"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"Description is required"],
        minLength:[10,"Description should have more than 10 characters"],
        maxLength:[200,"Title should not be more than 200 characters"],
    },
    category:{
        type:String,
        required:[true,"Category is required"],
    },
    thumbnail:{
        public_id:{
            type:String,
            required:true
        },
        secure_url:{
            type:String,
            required:true
        }
    }
    ,
    lectures:[
        {
            title:String,
            description:String,
            thumbnail: {
                public_id:{
                    type:String,
                    required:true
                },
                secure_url:{
                    type:String,
                    required:true
                }
            }
        }
    ],
    numberOfLectures:{
        type:Number,
        default:0
    },
    created_by:{
        type:String,
        required:true
    }
},{ timestamps:true});

const Course= model("Course",courseSchema);

export default Course;