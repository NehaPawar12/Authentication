import express from 'express';
import { login, logout, signup } from '../controller/auth.controller.js';

const router = express.Router();     // this will create a new router object.

router.get('/signup', signup             // /signup is prefixed with /api/auth in the backend/index.js file. So, the complete route will be /api/auth/signup.
);

router.get('/login', login);

router.get('/logout', logout);

export default router;