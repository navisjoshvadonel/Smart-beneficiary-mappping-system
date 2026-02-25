const Scheme = require('../models/Scheme');

exports.createScheme = async (req, res) => {
    try {
        const newScheme = new Scheme({
            ...req.body,
            createdBy: req.user.id
        });

        await newScheme.save();
        res.status(201).json({ message: 'Scheme created successfully', scheme: newScheme });
    } catch (error) {
        res.status(500).json({ message: 'Error creating scheme', error: error.message });
    }
};

exports.updateScheme = async (req, res) => {
    try {
        const updatedScheme = await Scheme.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedScheme) return res.status(404).json({ message: 'Scheme not found' });

        res.status(200).json({ message: 'Scheme updated successfully', scheme: updatedScheme });
    } catch (error) {
        res.status(500).json({ message: 'Error updating scheme', error: error.message });
    }
};

exports.deleteScheme = async (req, res) => {
    try {
        const deletedScheme = await Scheme.findByIdAndDelete(req.params.id);
        if (!deletedScheme) return res.status(404).json({ message: 'Scheme not found' });
        res.status(200).json({ message: 'Scheme deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting scheme', error: error.message });
    }
};

exports.getAllSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find().populate('createdBy', 'name');
        res.status(200).json(schemes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schemes', error: error.message });
    }
};
