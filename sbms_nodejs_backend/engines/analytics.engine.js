const Application = require('../models/Application');
const User = require('../models/User');
const Scheme = require('../models/Scheme');

exports.getGlobalAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalSchemes = await Scheme.countDocuments();
        const totalApplications = await Application.countDocuments();

        const approvedCount = await Application.countDocuments({ status: 'APPROVED' });
        const rejectedCount = await Application.countDocuments({ status: 'REJECTED' });

        // Calculate Fraud cases based on score threshold
        const fraudCases = await Application.countDocuments({ fraudProbability: { $gt: 0.7 } });

        // Aggregation: Scheme-wise application count
        const schemeWiseApplicationCount = await Application.aggregate([
            { $group: { _id: "$schemeId", count: { $sum: 1 } } },
            { $lookup: { from: "schemes", localField: "_id", foreignField: "_id", as: "scheme" } },
            { $unwind: "$scheme" },
            { $project: { _id: 0, schemeName: "$scheme.schemeName", count: 1 } }
        ]);

        // Aggregation: District-wise beneficiary count (Only looking at APPROVED applications)
        const districtWiseBeneficiaryCount = await Application.aggregate([
            { $match: { status: 'APPROVED' } },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $group: { _id: "$user.district", count: { $sum: 1 } } },
            { $project: { _id: 0, district: "$_id", count: 1 } }
        ]);

        // Aggregation: Income Distribution
        const incomeCategoryDistribution = await User.aggregate([
            {
                $bucket: {
                    groupBy: "$income",
                    boundaries: [0, 50000, 150000, 300000, 500000, 1000000],
                    default: "1000000+",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        // Aggregation: Gender Ratio
        const genderRatio = await User.aggregate([
            { $group: { _id: "$gender", count: { $sum: 1 } } },
            { $project: { _id: 0, gender: "$_id", count: 1 } }
        ]);

        res.status(200).json({
            totalUsers,
            totalSchemes,
            totalApplications,
            approvedCount,
            rejectedCount,
            fraudCases,
            schemeWiseApplicationCount,
            districtWiseBeneficiaryCount,
            incomeCategoryDistribution,
            genderRatio
        });

    } catch (error) {
        res.status(500).json({ message: 'Analytics Engine Error', error: error.message });
    }
};
