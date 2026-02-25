const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
    schemeName: { type: String, required: true, unique: true },
    incomeLimit: { type: Number, required: true },
    casteEligible: [{ type: String }],
    genderEligible: [{ type: String }],
    occupationEligible: [{ type: String }],
    educationRequired: { type: String },
    districtTarget: [{ type: String }],
    expiryDate: { type: Date, required: true },
    requiredDocuments: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Scheme', schemeSchema);
