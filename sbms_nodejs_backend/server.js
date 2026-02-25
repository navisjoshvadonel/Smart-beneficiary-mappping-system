require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// Rate Limiting to prevent brute force / DoS
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected successfully to SBMS Database'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Route Setup
app.use('/auth', require('./routes/auth.routes'));
app.use('/admin', require('./routes/admin.routes'));
app.use('/', require('./routes/citizen.routes')); // Exposes /eligibility/check, /citizen/apply
app.use('/', require('./routes/workflow.routes')); // Exposes /officer/pending, /admin/approve

// Default Route
app.get('/', (req, res) => {
    res.send('Smart Beneficiary Mapping System (SBMS) Engine Running');
});

// Railway + Hotspot Binding Fix
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`SBMS Microservice Architecture Gateway running on port ${PORT}`);
});
