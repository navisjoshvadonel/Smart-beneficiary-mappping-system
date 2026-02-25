const Application = require('../models/Application');
const { analyzeFraudRisk } = require('../engines/fraud.engine');

exports.applyForScheme = async (req, res) => {
    try {
        const { schemeId, documents } = req.body;
        const userId = req.user.id;

        // Trigger Fraud Engine
        const fraudProbability = await analyzeFraudRisk(userId, schemeId, documents);

        const newApplication = new Application({
            userId,
            schemeId,
            documents,
            fraudProbability,
            status: fraudProbability > 0.7 ? 'REJECTED' : 'APPLIED',
            adminRemark: fraudProbability > 0.7 ? 'Auto-Rejected by Fraud Engine: High Risk' : ''
        });

        await newApplication.save();

        res.status(201).json({
            message: 'Application submitted',
            application: newApplication,
            fraudWarning: fraudProbability > 0.7
        });

    } catch (error) {
        res.status(500).json({ message: 'Error submitting application', error: error.message });
    }
};

exports.getCitizenApplications = async (req, res) => {
    try {
        const apps = await Application.find({ userId: req.user.id }).populate('schemeId', 'schemeName');
        res.status(200).json(apps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
};
