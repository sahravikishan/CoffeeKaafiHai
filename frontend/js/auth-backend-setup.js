/**
 * ========================================
 * AUTHENTICATION BACKEND SETUP GUIDE
 * CoffeeKaafiHai - Complete Auth System
 * ========================================
 * 
 * This file provides integration examples and best practices
 * for implementing a secure authentication backend.
 */

// ============================================
// 1. EMAIL SERVICE INTEGRATION
// ============================================

/**
 * OPTION A: SendGrid Integration
 * --------------------------------
 * Popular, reliable email service with good free tier
 * 
 * Installation: npm install @sendgrid/mail
 * Get API Key: https://sendgrid.com/
 */

const sendgridExample = {
    setup: `
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    `,
    
    sendOTP: `
    async function sendOTPEmail(email, otp) {
        const msg = {
            to: email,
            from: 'noreply@coffeekaafihai.com', // Your verified sender
            subject: 'Password Reset OTP - CoffeeKaafiHai',
            text: \`Your OTP for password reset is: \${otp}. Valid for 10 minutes.\`,
            html: \`
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #D2691E;">Password Reset Request</h2>
                    <p>You requested to reset your password. Use the OTP below:</p>
                    <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a1a1a;">
                        \${otp}
                    </div>
                    <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes.</p>
                    <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                </div>
            \`
        };
        
        try {
            await sgMail.send(msg);
            return { success: true };
        } catch (error) {
            console.error('SendGrid Error:', error);
            return { success: false, error: error.message };
        }
    }
    `
};

/**
 * OPTION B: AWS SES Integration
 * ------------------------------
 * Cost-effective for high volume, integrated with AWS
 * 
 * Installation: npm install @aws-sdk/client-ses
 */

const awsSESExample = {
    setup: `
    const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
    
    const sesClient = new SESClient({
        region: 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });
    `,
    
    sendOTP: `
    async function sendOTPEmail(email, otp) {
        const params = {
            Source: 'noreply@coffeekaafihai.com',
            Destination: {
                ToAddresses: [email]
            },
            Message: {
                Subject: {
                    Data: 'Password Reset OTP - CoffeeKaafiHai',
                    Charset: 'UTF-8'
                },
                Body: {
                    Html: {
                        Data: \`
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #D2691E;">Password Reset Request</h2>
                                <p>Your OTP: <strong style="font-size: 24px;">\${otp}</strong></p>
                                <p style="color: #666;">Valid for 10 minutes.</p>
                            </div>
                        \`,
                        Charset: 'UTF-8'
                    }
                }
            }
        };
        
        try {
            const command = new SendEmailCommand(params);
            await sesClient.send(command);
            return { success: true };
        } catch (error) {
            console.error('AWS SES Error:', error);
            return { success: false, error: error.message };
        }
    }
    `
};

/**
 * OPTION C: Nodemailer (Self-hosted SMTP)
 * ----------------------------------------
 * Flexible, works with any SMTP server
 * 
 * Installation: npm install nodemailer
 */

const nodemailerExample = {
    setup: `
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
        host: 'smtp.gmail.com', // or your SMTP server
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    `,
    
    sendOTP: `
    async function sendOTPEmail(email, otp) {
        const mailOptions = {
            from: '"CoffeeKaafiHai" <noreply@coffeekaafihai.com>',
            to: email,
            subject: 'Password Reset OTP',
            html: \`
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #D2691E;">Password Reset Request</h2>
                    <p>Your OTP: <strong style="font-size: 24px; letter-spacing: 3px;">\${otp}</strong></p>
                    <p style="color: #666;">This OTP is valid for 10 minutes.</p>
                </div>
            \`
        };
        
        try {
            await transporter.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            console.error('Nodemailer Error:', error);
            return { success: false, error: error.message };
        }
    }
    `
};

// ============================================
// 2. OTP GENERATION & VALIDATION
// ============================================

const otpManagement = `
// Generate secure 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Alternative: Crypto-based (more secure)
const crypto = require('crypto');
function generateSecureOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

// Store OTP in database (example with MongoDB)
const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 minutes
});

const OTP = mongoose.model('OTP', OTPSchema);

async function storeOTP(email, otp) {
    await OTP.create({ email, otp });
}

// Validate OTP
async function validateOTP(email, otp) {
    const record = await OTP.findOne({ email, otp });
    
    if (!record) {
        return { valid: false, message: 'Invalid or expired OTP' };
    }
    
    // Check if OTP is still valid (within 10 minutes)
    const now = new Date();
    const otpAge = (now - record.createdAt) / 1000 / 60; // minutes
    
    if (otpAge > 10) {
        await OTP.deleteOne({ _id: record._id });
        return { valid: false, message: 'OTP has expired' };
    }
    
    // Delete OTP after successful validation
    await OTP.deleteOne({ _id: record._id });
    
    return { valid: true };
}
`;

// ============================================
// 3. PASSWORD HASHING (bcrypt)
// ============================================

const passwordSecurity = `
// Installation: npm install bcrypt
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// Hash password before storing
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

// Verify password during login
async function verifyPassword(plainPassword, hashedPassword) {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
}

// Password strength validation
function validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    
    if (password.length < minLength) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        return { 
            valid: false, 
            message: 'Password must contain uppercase, lowercase, number, and special character' 
        };
    }
    
    return { valid: true };
}
`;

// ============================================
// 4. JWT TOKEN MANAGEMENT
// ============================================

const jwtManagement = `
// Installation: npm install jsonwebtoken
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; // Store in environment variable

// Generate access token (short-lived)
function generateAccessToken(userId, email) {
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
}

// Generate refresh token (long-lived)
function generateRefreshToken(userId) {
    return jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Refresh access token using refresh token
async function refreshAccessToken(refreshToken) {
    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const newAccessToken = generateAccessToken(decoded.userId, decoded.email);
        return { success: true, accessToken: newAccessToken };
    } catch (error) {
        return { success: false, message: 'Invalid refresh token' };
    }
}
`;

// ============================================
// 5. API ENDPOINT STRUCTURE (Express.js)
// ============================================

const apiEndpointsExample = `
// Installation: npm install express mongoose bcrypt jsonwebtoken
const express = require('express');
const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        
        // Validate input
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }
        
        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ message: passwordValidation.message });
        }
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword
        });
        
        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.email);
        const refreshToken = generateRefreshToken(user._id);
        
        res.status(201).json({
            message: 'Account created successfully',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.email);
        const refreshToken = generateRefreshToken(user._id);
        
        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Validate email
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists for security
            return res.json({ message: 'If the email exists, an OTP has been sent' });
        }
        
        // Generate OTP
        const otp = generateSecureOTP();
        
        // Store OTP
        await storeOTP(email, otp);
        
        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp);
        
        if (!emailResult.success) {
            return res.status(500).json({ message: 'Failed to send OTP email' });
        }
        
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        // Validate input
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Validate OTP
        const otpValidation = await validateOTP(email, otp);
        if (!otpValidation.valid) {
            return res.status(400).json({ message: otpValidation.message });
        }
        
        // Validate new password
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({ message: passwordValidation.message });
        }
        
        // Hash new password
        const hashedPassword = await hashPassword(newPassword);
        
        // Update user password
        await User.updateOne({ email }, { password: hashedPassword });
        
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
`;

// ============================================
// 6. SECURITY BEST PRACTICES
// ============================================

const securityBestPractices = `
// RATE LIMITING
// Installation: npm install express-rate-limit
const rateLimit = require('express-rate-limit');

// Limit login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many login attempts, please try again later'
});

router.post('/login', loginLimiter, async (req, res) => {
    // Login logic
});

// Limit OTP requests
const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 OTP requests per hour
    message: 'Too many OTP requests, please try again later'
});

router.post('/forgot-password', otpLimiter, async (req, res) => {
    // Forgot password logic
});

// INPUT SANITIZATION
// Installation: npm install express-validator
const { body, validationResult } = require('express-validator');

router.post('/signup',
    // Validation middleware
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().escape(),
    body('lastName').trim().escape(),
    async (req, res) => {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        // Proceed with signup
    }
);

// CSRF PROTECTION
// Installation: npm install csurf
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Apply CSRF protection to state-changing routes
router.post('/login', csrfProtection, async (req, res) => {
    // Login logic
});

// Send CSRF token to client
router.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// CORS CONFIGURATION
// Installation: npm install cors
const cors = require('cors');

const corsOptions = {
    origin: 'https://yourdomain.com', // Your frontend URL
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// HELMET FOR SECURITY HEADERS
// Installation: npm install helmet
const helmet = require('helmet');

// Add security headers
app.use(helmet());
`;

// ============================================
// 7. DATABASE SCHEMA (MongoDB/Mongoose)
// ============================================

const databaseSchema = `
const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

const User = mongoose.model('User', userSchema);

// OTP Schema
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Auto-delete after 10 minutes
    }
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = { User, OTP };
`;

// ============================================
// 8. ENVIRONMENT VARIABLES (.env)
// ============================================

const environmentVariables = `
# Database
MONGODB_URI=mongodb://localhost:27017/coffeekaafihai
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Service (choose one)
# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# AWS SES
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Nodemailer (SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
`;

// ============================================
// 9. COMPLETE SERVER EXAMPLE
// ============================================

const completeServerExample = `
// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});
`;

// ============================================
// 10. FRONTEND INTEGRATION EXAMPLE
// ============================================

const frontendIntegration = `
// auth-api.js - Frontend API calls

const API_BASE_URL = 'http://localhost:3000/api/auth';

// Signup
async function signup(userData) {
    try {
        const response = await fetch(\`\${API_BASE_URL}/signup\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }
        
        // Store tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        return data;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
}

// Login
async function login(email, password) {
    try {
        const response = await fetch(\`\${API_BASE_URL}/login\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Store tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Forgot Password
async function forgotPassword(email) {
    try {
        const response = await fetch(\`\${API_BASE_URL}/forgot-password\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to send OTP');
        }
        
        return data;
    } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
    }
}

// Reset Password
async function resetPassword(email, otp, newPassword) {
    try {
        const response = await fetch(\`\${API_BASE_URL}/reset-password\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, otp, newPassword })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Password reset failed');
        }
        
        return data;
    } catch (error) {
        console.error('Reset password error:', error);
        throw error;
    }
}

// Make authenticated API calls
async function authenticatedFetch(url, options = {}) {
    const accessToken = localStorage.getItem('accessToken');
    
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': \`Bearer \${accessToken}\`
        }
    });
    
    // Handle token expiration
    if (response.status === 401 || response.status === 403) {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        const refreshResponse = await fetch(\`\${API_BASE_URL}/refresh-token\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });
        
        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem('accessToken', data.accessToken);
            
            // Retry original request
            return fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': \`Bearer \${data.accessToken}\`
                }
            });
        } else {
            // Refresh failed, redirect to login
            localStorage.clear();
            window.location.href = '/login/';
        }
    }
    
    return response;
}

// Logout
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login/';
}
`;

console.log('='.repeat(80));
console.log('AUTHENTICATION BACKEND SETUP GUIDE');
console.log('CoffeeKaafiHai - Complete Authentication System');
console.log('='.repeat(80));
console.log('');
console.log('This guide provides complete backend integration examples for:');
console.log('1. Email Service Integration (SendGrid, AWS SES, Nodemailer)');
console.log('2. OTP Generation & Validation');
console.log('3. Password Hashing with bcrypt');
console.log('4. JWT Token Management');
console.log('5. Express.js API Endpoints');
console.log('6. Security Best Practices');
console.log('7. Database Schema (MongoDB/Mongoose)');
console.log('8. Environment Variables');
console.log('9. Complete Server Example');
console.log('10. Frontend Integration');
console.log('');
console.log('Refer to the code examples above for implementation details.');
console.log('='.repeat(80));

