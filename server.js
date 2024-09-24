import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from './models/user.js'; // Make sure your path to user model is correct
import connectDB from './db.js';
import cors from 'cors'; // For cross-origin requests

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variables for security

// Enable CORS if frontend is on a different domain/port

app.use(express.json());  // For parsing JSON request bodies
app.use(express.static('public'));  // For serving static files like auth.html

app.use(cors({
  origin: 'http://localhost:3001',  // Your frontend URL
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',  // Ensure Authorization is allowed
}));


// Connect to MongoDB
connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB', error);
      process.exit(1); // Exit process if DB connection fails
    });



// Serve signup or login page for GET /signup
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/public/auth.html'); // Adjust path to your HTML file
});

// You can also do the same for the login if needed
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/auth.html');
});


// Route for user signup
app.post('/signup', async (req, res) => {
  const { email, password } = req.body; // Ensure req.body is parsed

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    user = new User({ email, password: hashedPassword });
    await user.save();

    // Generate JWT token for authentication
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    // Send token back to the client
    res.json({ message: 'Signup successful', token });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  let user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

  // Send success message and token
  res.json({ message: 'Login successful', token });
});

// Middleware to authenticate user via JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;  // Attach the decoded userId to the request object
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Protected route: Get vehicles associated with the logged-in user
app.get('/vehicles', authenticate, async (req, res) => {
  console.log('Token:', token); // Add this in the `loadVehicles` function

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user.modelData);
});

// Protected route: Add vehicle data for the logged-in user
app.post('/vehicles', authenticate, async (req, res) => {
  const { model, year, mpg } = req.body;

  const user = await User.findById(req.userId);
  user.modelData.push({ model, year, mpg });

  await user.save();
  res.json(user.modelData);
});

// Protected route: Update vehicle data for the logged-in user
app.put('/vehicles', authenticate, async (req, res) => {
  const { oldModel, model, year, mpg } = req.body;

  const user = await User.findById(req.userId);
  user.modelData = user.modelData.map(vehicle =>
      vehicle.model === oldModel ? { model, year, mpg } : vehicle
  );

  await user.save();
  res.json(user.modelData);
});

// Protected route: Delete vehicle data for the logged-in user
app.delete('/vehicles', authenticate, async (req, res) => {
  const { model } = req.body;

  const user = await User.findById(req.userId);
  user.modelData = user.modelData.filter(vehicle => vehicle.model !== model);

  await user.save();
  res.json(user.modelData);
});
