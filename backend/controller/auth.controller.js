import { sendVerificationEmail } from '../mailtrap/emails.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { generateVerificationCode } from '../utils/generateVerificationCode.js';
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

export const login = (req, res) => {
    res.send('Login Route');
};

export const logout = (req, res) => {
    res.send('Logout Route');
};