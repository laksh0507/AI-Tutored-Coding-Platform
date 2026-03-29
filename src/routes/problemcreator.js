const express = require('express');
const problemrouter = express.Router();
const adminmiddleware = require("../middleware/adminmiddleware");
const usermiddleware = require("../middleware/usermiddleware");
const { createproblem, updateproblem, deleteproblem, getproblembyid, getallproblem, solvedallproblembyuser, submittedproblem } = require("../controllers/userproblem");

//create->admin
problemrouter.post("/create", adminmiddleware, createproblem);
// fetch a problem
problemrouter.get("/problembyid/:id", usermiddleware, getproblembyid);
//fetch all problems
problemrouter.get("/getallproblem", usermiddleware, getallproblem);
//upadte a problem->admin
problemrouter.put("/update/:id", adminmiddleware, updateproblem);
//delete a problem->admin
problemrouter.delete("/delete/:id", adminmiddleware, deleteproblem);
//show all the problems that the usuer has solved
problemrouter.get("/problemsolvedbyuser", usermiddleware, solvedallproblembyuser);
//show all submitted problem by the user 
problemrouter.get("/submittedproblem/:id", usermiddleware, submittedproblem);
module.exports = problemrouter;