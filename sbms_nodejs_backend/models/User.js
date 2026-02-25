const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['CITIZEN', 'OFFICER', 'ADMIN'], default: 'CITIZEN' },
    income: { type: Number, required: true },
    caste: { type: String, required: true },
    gender: { type: String, required: true },
    occupation: { type: String, required: true },
    education: { type: String, required: true },
    district: { type: String, required: true },
    aadhaar: { type: String, required: true, unique: true }
}, {
    timestamps: true // Automatically manages createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);
