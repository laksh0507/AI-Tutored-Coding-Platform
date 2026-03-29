const {getLanguageById,submitbatch,submittoken}=require("../utils/problemutility");
const Problem=require("../models/problem");
const User=require("../models/user");
const Submission=require("../models/submission");
const redisclient=require("../config/redis");

const createproblem=async(req,res)=>{

    const {title,description,difficulty,tags,visibletestcases,hiddentestcases,startcode,referencesolution,problemcreator}=req.body;
    try{
        for(const {language,completecode} of referencesolution){
            //source_code:
            //language_id:
            //stdin:
            //expectedoutput:
            const languageId=getLanguageById(language);
            
            // I am creating batch submissions
            const submissions=visibletestcases.map((testcase)=>({
                source_code:completecode,
                language_id:languageId,
                stdin:testcase.input,
                expected_output:testcase.output
            }));

            const submitresult= await submitbatch(submissions);
            const resultoken=submitresult.map((value)=> value.token);
            const testresult=await submittoken(resultoken);
            
            for(const test of testresult)
            {
                if(test.status_id!=3)
                {
                    return res.status(400).send("error occured");
                }
            }
       
        }

        //we can store it in our DB
       const userproblem = await Problem.create({
            ...req.body,
            problemcreator:req.result._id
        })
        
        res.status(201).send("problem saved");
    }
    catch(err)
        {
            res.status(400).send("Error: "+err);
        }
}

const updateproblem = async (req, res) => {
    const { id } = req.params;
    const { title, description, difficulty, tags, visibletestcases, hiddentestcases, startcode, referencesolution, problemcreator } = req.body;
    
    try {
        for (const { language, completecode } of referencesolution) {
            const languageId = getLanguageById(language);
            
            const submissions = visibletestcases.map((testcase) => ({
                source_code: completecode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitresult = await submitbatch(submissions);
            const resulttoken = submitresult.map((value) => value.token);
            const testresult = await submittoken(resulttoken);
            
            for (const test of testresult) {
                if (test.status_id != 3) {
                    return res.status(400).send("error occured");
                }
            }
        }

        if (!id) {
            return res.status(500).send("missing id field");
        }

        const dsaproblem = await Problem.findById(id);
        if(!dsaproblem)
        {
            return res.status(500).send("id is not present in server");
        }

        const newproblem=await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true, new:true});

        res.status(200).send(newproblem);
    } catch (err) {
        res.status(500).send("error:" + err.message);
    }
}

const deleteproblem=async(req,res)=>{
    const {id}=req.params;
    try{
        if(!id)
        {
            return res.status(400).send("ID is missing");
        }
        const deletedproblem=await Problem.findByIdAndDelete(id);
        if(!deletedproblem)
        {
            return res.status(404).send("problem is missing");
        }

        res.status(200).send("sucessfully deleted");
    }
    catch(err){
        res.status(500).send("error: "+err);
    }
}

const getproblembyid=async(req,res)=>{
    const {id}=req.params;
    try{
        if(!id)
        {
            return res.status(400).send("ID is invalid");
        }

        // Check Redis cache first
        const cached=await redisclient.get(`problem:${id}`);
        if(cached){
            return res.status(200).send(JSON.parse(cached));
        }

        // Cache miss — fetch from MongoDB
        const ans=await Problem.findById(id);
        if(!ans)
        {
            return res.status(404).send("problem is missing"); 
        }

        // Save to Redis for 1 hour (3600 seconds)
        await redisclient.setEx(`problem:${id}`,3600,JSON.stringify(ans));

        res.status(200).send(ans);
    }
    catch(err)
    {
        res.status(400).send("error:"+err.message);
    }
}

const getallproblem=async(req,res)=>{
    
    try{
        
        const ans=await Problem.find({});
        if(ans.length===0)
        {
            return res.status(404).send("problem is missing"); 
        }
        res.status(200).send(ans);
    }
    catch(err)
    {
        res.status(400).send("error:"+err.message);
    }
}

const solvedallproblembyuser=async(req,res)=>{
    try{
        const userid=req.result._id;
        const foundUser=await User.findById(userid).populate({
            path:"problemsolved",
            select:"_id title difficulty tags"
        });
        res.status(200).send(foundUser.problemsolved);
    }
    catch(err)
    {
        return res.status(500).send("server error");
    }
}

const submittedproblem=async(req,res)=>{
    try{
        const userid=req.result._id;
        const problemid=req.params.id;
        const ans=await Submission.find({userid,problemid});
        if(ans.length===0)
        {
            return res.status(200).send("no submission is present");
        }
        res.status(200).send(ans);
    }
    catch(err)
    {
        res.status(500).send("internal server error");
    }
    
}
module.exports={createproblem,updateproblem,deleteproblem,getproblembyid,getallproblem,solvedallproblembyuser,submittedproblem};