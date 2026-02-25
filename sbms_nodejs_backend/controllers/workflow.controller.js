const Application = require('../models/Application');
const { sendNotification } = require('../engines/notification.engine');

exports.getPendingApplications = async (req, res) => {
    try {
        const apps = await Application.find({ status: 'APPLIED' })
            .populate('userId', 'name email aadhaar district')
            .populate('schemeId', 'schemeName');
        res.status(200).json(apps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending applications', error: error.message });
    }
};

exports.verifyApplication = async (req, res) => {
    try {
        const { officerRemark } = req.body;
        const app = await Application.findByIdAndUpdate(
            req.params.id,
            { status: 'VERIFIED', officerRemark },
            { new: true }
        );

        if (!app) return res.status(404).json({ message: 'Application not found' });
        res.status(200).json({ message: 'Application marked as verified', application: app });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying application', error: error.message });
    }
};

exports.approveApplication = async (req, res) => {
    try {
        const { adminRemark } = req.body;
        const app = await Application.findByIdAndUpdate(
            req.params.id,
            { status: 'APPROVED', adminRemark },
            { new: true }
        ).populate('userId', 'email name');

        if (!app) return res.status(404).json({ message: 'Application not found' });

        // Trigger notification engine
        sendNotification(app.userId.email, 'Application Approved', `Your application for scheme ${app.schemeId} was approved.`);

        res.status(200).json({ message: 'Application approved', application: app });
    } catch (error) {
        res.status(500).json({ message: 'Error approving application', error: error.message });
    }
};

exports.rejectApplication = async (req, res) => {
    try {
        const { adminRemark } = req.body;
        const app = await Application.findByIdAndUpdate(
            req.params.id,
            { status: 'REJECTED', adminRemark },
            { new: true }
        ).populate('userId', 'email name');

        if (!app) return res.status(404).json({ message: 'Application not found' });

        // Trigger notification engine
        sendNotification(app.userId.email, 'Application Rejected', `Your application for scheme ${app.schemeId} was rejected. Reason: ${adminRemark}`);

        res.status(200).json({ message: 'Application rejected', application: app });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting application', error: error.message });
    }
};
