import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '7d'});   //this will generate a token with the user id and the secret key.

    res.cookie("token", token, {
        httpOnly: true,  //this will make sure that the cookie is not accessible through javascript.
        secure: process.env.NODE_ENV === 'production',  //this will make sure that the cookie is only sent over HTTPS in production.
        sameSite : "strict",
        maxAge: 7*24*60*60*1000,  //this will set the expiry time of the cookie to 7 days.
    }
    );

    return token;
};