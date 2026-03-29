const express=require('express');
const submitrouter=express.Router();
const usermiddleware=require('../middleware/usermiddleware');
const ratelimit=require('../middleware/ratelimit');
const {submitcode,runcode}=require("../controllers/usersubmission")

submitrouter.post('/submit/:id',usermiddleware,ratelimit,submitcode);
submitrouter.post('/run/:id',usermiddleware,ratelimit,runcode);

module.exports=submitrouter;
