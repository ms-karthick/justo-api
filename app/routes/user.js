const express = require('express');
const router = express.Router();
const { register, login, time, kickout, generateLink, verifyLink } = require('../controllers/user');

router.post('/register', register);
router.post('/login', login);
router.post('/generate-link', generateLink);
router.post('/verify-link/:token', verifyLink);
router.get('/time', time);
router.post('/kickout', kickout);

module.exports = router;