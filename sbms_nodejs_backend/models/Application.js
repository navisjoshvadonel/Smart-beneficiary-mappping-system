const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
    documents: [{ type: String }],
    status: {
        type: String,
        enum: ['APPLIED', 'UNDER_VERIFICATION', 'VERIFIED', 'APPROVED', 'REJECTED'],
        default: 'APPLIED'
    },
    officerRemark: { type: String },
    adminRemark: { type: String },
    fraudProbability: { type: Number, default: 0 },
    appliedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
