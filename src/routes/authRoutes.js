/**
 * Authentication Routes
 * Routes for user authentication
 */

const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authValidators } = require('../middleware/validators');

const router = express.Router();

// Public routes
router.post('/register', authValidators.register, register);
router.post('/login', authValidators.login, login);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/updatedetails', authValidators.updateDetails, updateDetails);
router.put('/updatepassword', authValidators.updatePassword, updatePassword);

module.exports = router; 