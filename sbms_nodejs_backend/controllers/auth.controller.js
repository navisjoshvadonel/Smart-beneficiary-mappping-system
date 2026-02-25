const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, income, caste, gender, occupation, education, district, aadhaar } = req.body;

        // Duplicate Check
        let user = await User.findOne({ $or: [{ email }, { aadhaar }] });
        if (user) {
            return res.status(400).json({ message: 'User with this email or Aadhaar already exists' });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name, email, password: hashedPassword, role: role || 'CITIZEN',
            income, caste, gender, occupation, education, district, aadhaar
        });

        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ message: 'Registration successful', token, role: user.role });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ message: 'Login successful', token, role: user.role });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
