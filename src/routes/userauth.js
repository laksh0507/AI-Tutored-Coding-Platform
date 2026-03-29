const express = require('express');
const authrouter = express.Router();
const { register, login, logout, adminregister, deleteprofile, deactivateprofile, activateprofile } = require("../controllers/userauthent.js");
const usermiddleware = require("../middleware/usermiddleware");
const adminmiddleware = require("../middleware/adminmiddleware");

//register
authrouter.post('/register', register);
authrouter.post('/login', login);
authrouter.post('/logout', usermiddleware, logout);
authrouter.post('/admin/register', adminmiddleware, adminregister);
authrouter.delete('/deleteprofile', usermiddleware, deleteprofile);
authrouter.patch('/deactivateprofile', usermiddleware, deactivateprofile);
authrouter.patch('/activateprofile', activateprofile);
// authrouter.get('/getprofile',getprofile);
//login
//logout
//getprofile

module.exports = authrouter;