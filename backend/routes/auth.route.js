import express from 'express';
import { login, logout, signup, verifyEmail, forgotPassword, resetPassword, checkAuth } from '../controller/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();     // this will create a new router object.


router.get("/check-auth", verifyToken, checkAuth);
router.post('/signup', signup             // /signup is prefixed with /api/auth in the backend/index.js file. So, the complete route will be /api/auth/signup.
);

router.post('/login', login);

router.post('/logout', logout);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

export default router;