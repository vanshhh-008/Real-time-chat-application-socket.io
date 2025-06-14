const { signup, login,protect ,allUsers  } = require('../controllers/AuthController');
const { signupValidation, loginValidation } = require('../middlewares/AuthValidation');

const router = require('express').Router();

// Login route
router.post('/login', loginValidation, login);

// Signup route
router.post('/signup', signupValidation, signup);

// Get all users
router.get('/', protect,allUsers);

module.exports = router;
