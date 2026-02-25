const Application = require('../models/Application');
const User = require('../models/User');

exports.analyzeFraudRisk = async (userId, schemeId, documentList) => {
    try {
        let fraudProbability = 0.0;

        const user = await User.findById(userId);
        if (!user) return 1.0; // High fraud if user doesn't exist but applying

        // Check 1: Has this user already applied to this scheme?
        const existingApp = await Application.findOne({ userId, schemeId });
        if (existingApp) {
            fraudProbability += 0.5; // High increment for repeat application to same scheme
        }

        // Check 2: Are there an abnormal amount of applications from this user recently?
        const recentApps = await Application.find({ userId }).sort({ createdAt: -1 }).limit(5);
        if (recentApps.length >= 5) {
            // If 5 applications within the last hour
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const rapidApps = recentApps.filter(app => app.createdAt > oneHourAgo);
            if (rapidApps.length >= 3) {
                fraudProbability += 0.4;
            }
        }

        // Check 3: Check if same documents are reused across DIFFERENT users (Document Forgery simulation)
        // NOTE: In a real system, documents would be hashed. We simulate by checking exact string match across DB.
        if (documentList && documentList.length > 0) {
            for (let doc of documentList) {
                const reusedDoc = await Application.findOne({
                    userId: { $ne: userId },
                    documents: { $in: [doc] }
                });
                if (reusedDoc) {
                    fraudProbability += 0.6; // Critical flag for cross-account document reuse
                    break;
                }
            }
        }

        // Cap at 1.0
        return Math.min(fraudProbability, 1.0);

    } catch (error) {
        console.error("Fraud Engine Error:", error);
        return Number.MAX_SAFE_INTEGER; // Force manual review on error
    }
};
