const jwt = require('jsonwebtoken');
const { User, OneTimeLink, Token } = require('../models');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const existingUser = await User.findOne({ where: { username } });
        // console.log('existingUser ', existingUser);
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const newUser = await User.create({ name, username, email, password });

        res.status(201).json({
            message: 'User registered successfully',
            data: newUser
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
// console.log('req.body ', req.body);

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        if (password.length < 5) {
            return res.status(400).json({ message: 'Password must be at least 5 characters long' });
        }

        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        // console.log('(user.locked ', (user.locked);
        
        if (user.locked && new Date(user.locked) > new Date()) {
            const remainingTime = Math.ceil((new Date(user.locked) - new Date()) / (60 * 1000));
            return res.status(403).json({ message: `Account is locked. Try again after ${remainingTime} minutes.` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('tttt ', new Date(Date.now() + 15 * 60 * 1000));
        
        if (!isMatch) {
            user.attempts += 1;

            if (user.attempts >= parseInt(process.env.MAX_FAILED_ATTEMPTS || 3)) {
                user.locked = new Date(Date.now() + 15 * 60 * 1000);
                user.attempts = 0;
                await user.save();
                return res.status(403).json({ message: 'Too many failed attempts. Your account is locked for 15 minutes.' });
            }

            await user.save();
            return res.status(401).json({ message: 'Incorrect password' });
        }

        user.attempts = 0;
        user.locked = null;
        await user.save();

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await Token.create({ user_id: user.id, token });

        res.json({ token });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
};



exports.generateLink = async (req, res) => {
    try {
        const { username } = req.body;
        
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const token = uuidv4();
        const expirationMinutes = parseInt(process.env.LINK_EXPIRATION_MINUTES || 15); // Default 15 minutes
        const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
        // console.log('token ', token);
        
        await OneTimeLink.create({ userId: user.id, token, expiresAt });

        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        res.json({ link: `${baseUrl}/auth/verify-link/${token}` });

    } catch (error) {
        console.error('generating link:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
};


exports.verifyLink = async (req, res) => {
    const { token } = req.params;
    const link = await OneTimeLink.findOne({ where: { token, used: false } });
    if (!link || new Date(link.expiresAt) < new Date()) {
        return res.status(400).json({ message: 'Invalidedc or expired link' });
    }
    link.used = true;
    await link.save();

    const user = await User.findByPk(link.userId);
    const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: jwtToken });
};

exports.time = async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    console.log('authHeader ', authHeader);
    
    jwt.verify(authHeader, 'secret', async (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });

        const tokenRecord = await Token.findOne({ where: { token: authHeader } });

        if (!tokenRecord) return res.status(401).json({ error: 'Invalid or expired token' });

        return res.json({ time: new Date().toISOString() });
    });
};


exports.kickout = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await Token.destroy({ where: { user_id: user.id } });

        return res.json({ message: "User kicked out" });
    } catch (error) {
        console.error("Error in kickout:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
