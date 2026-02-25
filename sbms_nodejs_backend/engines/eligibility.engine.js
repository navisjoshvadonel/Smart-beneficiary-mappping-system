const Scheme = require('../models/Scheme');

exports.checkEligibility = async (req, res) => {
    try {
        const user = req.user; // Requires full user profile, assume populated or passed in body for now.
        const { income, caste, gender, occupation, education, district } = req.body;

        // Fetch all active schemes
        const schemes = await Scheme.find({ expiryDate: { $gte: new Date() } });

        let eligibleSchemes = [];

        schemes.forEach(scheme => {
            let score = 0;

            if (income <= scheme.incomeLimit) score += 30;
            if (scheme.casteEligible.includes('ALL') || scheme.casteEligible.includes(caste)) score += 20;
            if (scheme.genderEligible.includes('ALL') || scheme.genderEligible.includes(gender)) score += 10;
            if (scheme.occupationEligible.includes('ALL') || scheme.occupationEligible.includes(occupation)) score += 20;
            if (scheme.educationRequired === 'NONE' || scheme.educationRequired === education) score += 10;
            if (scheme.districtTarget.includes('ALL') || scheme.districtTarget.includes(district)) score += 10;

            if (score >= 60) {
                eligibleSchemes.push({
                    schemeId: scheme._id,
                    schemeName: scheme.schemeName,
                    eligibilityScore: score
                });
            }
        });

        // Sort by highest score descending
        eligibleSchemes.sort((a, b) => b.eligibilityScore - a.eligibilityScore);

        res.status(200).json({ eligibleSchemes });

    } catch (error) {
        res.status(500).json({ message: 'Eligibility Engine Error', error: error.message });
    }
};
