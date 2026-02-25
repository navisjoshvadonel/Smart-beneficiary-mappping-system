const Application = require('../models/Application');

exports.getGeoData = async (req, res) => {
    try {
        const geoData = await Application.aggregate([
            { $match: { status: 'APPROVED' } },
            // Join User table to get the District
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            // Join Scheme table to get the Scheme Name
            { $lookup: { from: "schemes", localField: "schemeId", foreignField: "_id", as: "scheme" } },
            { $unwind: "$scheme" },
            // Group by District and push schemes to an array
            {
                $group: {
                    _id: "$user.district",
                    totalBeneficiaries: { $sum: 1 },
                    schemesUsed: { $push: "$scheme.schemeName" }
                }
            },
            // Restructure the array to count occurrences of each scheme within the district
            {
                $project: {
                    _id: 0,
                    district: "$_id",
                    totalBeneficiaries: 1,
                    // Counts frequency of schemes using reduce
                    schemeUsage: {
                        $reduce: {
                            input: "$schemesUsed",
                            initialValue: [],
                            in: {
                                $let: {
                                    vars: {
                                        idx: { $indexOfArray: ["$$value.name", "$$this"] }
                                    },
                                    in: {
                                        $cond: [
                                            { $eq: ["$$idx", -1] },
                                            { $concatArrays: ["$$value", [{ name: "$$this", count: 1 }]] },
                                            {
                                                $concatArrays: [
                                                    { $slice: ["$$value", "$$idx"] },
                                                    [{ name: "$$this", count: { $add: [{ $arrayElemAt: ["$$value.count", "$$idx"] }, 1] } }],
                                                    { $slice: ["$$value", { $add: ["$$idx", 1] }, { $size: "$$value" }] }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        res.status(200).json({ geoData });
    } catch (error) {
        res.status(500).json({ message: 'GIS Engine Error', error: error.message });
    }
};
