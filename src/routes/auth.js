const express = require('express');
const router = express.Router();

const verifyAuth = require('../middleware/verifyAuth');
const { loginUser, registerUser } = require('../controllers/authController');

//register user and issue tokens (logs them in too)
router.post('/register', registerUser)

//login user and issue tokens
router.post('/login', loginUser)

// router.get('/user', verifyAuth, async (req, res, next) => {
//     const {
//         id, username, firstName, lastName, email, profilePic, bio
//     } = await User.findByPk(req.user.userId);
//     res.json({
//         data: {
//             user: { 
//                 id, username, firstName, lastName, email, profilePic, bio 
//             },
//             accessToken: req.token
//         }
//     });
// })

module.exports = router;