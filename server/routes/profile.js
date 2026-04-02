const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

// Protected route to get user profile
router.get('/me', verifyToken, (req, res) => {
    // req.user is populated by the verifyToken middleware
    res.json({
        message: 'Successfully retrieved profile',
        user: req.user
    });
});

module.exports = router;
