import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true,
        minLength : [2, 'First name must be at least 2 characters'],
    },
    lastName : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        lowercase : true,
        trim : true,
        required : true,
        unique : true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            },
            message: 'Invalid email format',
        },
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        maxlength: [100, 'Password too long'],
        validate: {
            validator: function (value) {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
            },
            message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
        },
    },
    age : {
        type : Number,
        min : 18,
    },
    gender : {
        type : String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
        default: 'Prefer not to say', 
        validate: {
            validator: function(value) {
                if(!['Male', 'Female', 'Other', 'Prefer not to say'].includes(value)) {
                    throw new Error('Invalid Gender value');
                }
                return true;
            },
        },
    },
    about : {
        type : String,
        maxlength: [300, 'About section can be max 300 characters'],
        default : "No information provided",
    },
    profilePicture : {
        type : String,
        match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)$/, 'Must be a valid image URL'],
        default : "https://www.w3schools.com/howto/img_avatar.png",
    },
    skills : {
        type : [String],
        default : [],
    },
}, {timestamps : true});

export const User = mongoose.model('User', userSchema);
export default User;