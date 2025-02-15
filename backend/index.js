import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { connectDB } from './db/connectDB.js';   // here we need to add the .js extension to the file name as we are using ES6 modules and we need to do this while importing a local file.
import authRoutes from './routes/auth.route.js';

dotenv.config();  // this will load the environment variables from the .env file into process.env object.

const app = express();
const PORT = process.env.PORT || 5000;

// app.get('/', (req, res) => {
//     res.send('Hello World!');
//     });   //For testing purpose


app.use(express.json());  // this will parse the incoming request : req.body
//Authentication Routes
app.use(cookieParser()); // parse incoming cookies

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on port ${PORT}`);
    });