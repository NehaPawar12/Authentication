import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from '../mailtrap/emails.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { generateVerificationCode } from '../utils/generateVerificationCode.js';
import crypto from 'crypto';
import { User } from './../models/user.model.js';
import bcrypt from 'bcryptjs';

export const signup = async (req, res) => {
    const {email, password, name} = req.body;   //this will get the data filled by the user in the signup form.

    try {

        if(!email || !password || !name){
            throw new Error('All fields are required');
        }

        const userAlreadyExists = await User.findOne({email});   //this will check if the user already exists in the database.
        if(userAlreadyExists){
            res.status(400).json({success:false , message: 'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 11);   //this will hash the password before saving it to the database.
        const verificationToken = generateVerificationCode();
        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt : Date.now() + 24*60*60*1000,   //this will set the verification token expiry time to 24 hours from now.
        })   //this will create a new user in the database.

        await user.save();   //this will save the user to the database.

        //jwt
        generateTokenAndSetCookie(res, user._id);   //this will generate a token and set it in the cookie.

        await sendVerificationEmail(user.email, verificationToken);   //this will send the verification email to the user.

        res.status(201).json({success:true, message: 'User created successfully',
            user: {
                ...user._doc,  //this will spread the user document.
                password: undefined,  //this will hide the password from the user.
            }
        });
        
    } catch (error) {
        res.status(400).json({success:false, message: error.message});
    }
};

export const verifyEmail = async (req, res) => {
    const { code } = req.body;   //this will get the verification token from the request body

    try {

        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {$gt: Date.now()}   //this will check if the verification token is valid.
        })

        if(!user){
            return res.status(400).json({success:false, message: 'Invalid or expired verification code'});
        }

        user.isVerified = true;   //this will set the user as verified.
        user.verificationToken = undefined;   //this will remove the verification token.
        user.verificationTokenExpiresAt = undefined;   //this will remove the verification token expiry time.

        await user.save();   //this will save the user to the database.
        await sendWelcomeEmail(user.email, user.name);   //this will send the welcome email to the user.

        res.status(200).json({success:true, message: 'Email verified successfully',
            user : {
                ...user.doc,
                password: undefined,
            }
        });
        
    } catch (error) {
        console.log("Error in verifyEmail: ",error)
        res.status(500).json({success:false, message: "Server error"});
    }
}

export const login = async (req, res) => {

    const {email, password} = req.body;   //this will get the email and password from the request body.
    try {

        const user = await User.findOne({email});  
        if(!user){
            return res.status(400).json({success:false, message: 'Invalid credentials'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({success:false, message: 'Invalid credentials'});
        }

        generateTokenAndSetCookie(res, user._id); 
        user.lastLogin = new Date();
        
        await user.save();

        res.status(200).json({success:true, message: 'Logged in successfully',
            user: {
                ...user._doc,
                password: undefined,
            }
        });
        
    } catch (error) {
        console.log("Error in login: ",error);
        res.status(400).json({success:false, message: error.message});
    }
};

export const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({success:true, message: 'Logged out successfully'});
};

export const forgotPassword = async (req, res) => {
const { email } = req.body; 
    try {
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({success:false, message: 'User not found'});
        }   

        //Generate a password reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;  //1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        //Send an email to the user
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({success:true, message: 'Password reset email sent successfully'});
    } catch (error) {
        console.error("Error in forgotPassword: ",error);
        res.status(400).json({success:false, message: error.message});
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()}
        });

        if(!user){
            return res.status(400).json({success:false, message: 'Invalid or expired reset token'});
        
        }

        //update password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();

        await sendResetSuccessEmail(user.email);

        res.status(200).json({success:true, message: 'Password reset successfully'});

    } catch (error) {
        console.log("Error in resetPassword: ",error);
        res.status(400).json({success:false, message: error.message});
    }
}

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if(!user){
            return res.status(400).json({success:false, message: 'User not found'});
        }

        res.status(200).json({success:true, user});
    } catch (error) {
        console.log("Error in checkAuth: ",error);
        res.status(400).json({success:false, message: error.message});
    }
}