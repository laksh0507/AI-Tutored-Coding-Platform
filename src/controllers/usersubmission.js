const Problem=require("../models/problem");
const Submission=require("../models/submission");
const {getLanguageById,submitbatch,submittoken}=require("../utils/problemutility");

const submitcode=async(req,res)=>{
    try{
        const userid=req.result._id;
        const problemid=req.params.id.trim();

        const {code,language}=req.body;
        if(!userid||!code||!problemid||!language)
            return res.status(400).send("some field missing");
        //fetch the problem from database
        const foundProblem=await Problem.findById(problemid);
        if(!foundProblem)
            return res.status(404).send("problem not found");

        //create submission record
        const submittedresult=await Submission.create({
            userid,
            problemid,
            code,
            language,
            testcasespassed:0,
            status:"pending",
            testcasestotal:foundProblem.hiddentestcases.length,
            errorMessage:"",
            runtime:0
        })

        //judge0 ko code submit krna hai 
        const languageId=getLanguageById(language);
        const submissions=foundProblem.hiddentestcases.map((testcase)=>({
                source_code:code,
                language_id:languageId,
                stdin:testcase.input,
                expected_output:testcase.output
        }));
        
        const submitresult= await submitbatch(submissions);
        
        const resultoken=submitresult.map((value)=> value.token);
        
        const testresult=await submittoken(resultoken);

        //submitresult ko update kro
        let testcasespassed=0;
        let runtime=0;
        let memory=0;
        let status="accepted";
        let errorMessage=" ";
        for(const test of testresult)
        {
            if(test.status_id===3)
            {
                testcasespassed++;
                runtime=runtime+parseFloat(test.time);
                memory=Math.max(memory,test.memory);
            }
            else
            {
                if(test.status_id===4)
                {
                    status="error";
                    errorMessage=test.stderr;
                }
                else
                {
                    status="wrong";
                    errorMessage=test.stderr;

                }
            }
        }
    
        //store the result in database in submission
        submittedresult.status=status;
        submittedresult.testcasespassed=testcasespassed;
        submittedresult.errorMessage=errorMessage;
        submittedresult.runtime=runtime;
        submittedresult.memory=memory;

        await submittedresult.save();

        if(status==="accepted" && !req.result.problemsolved.includes(problemid))
        {
            req.result.problemsolved.push(problemid);
            await req.result.save();
        }
        res.status(201).send(submittedresult);
    }
    catch(err)
    {
        res.status(500).send("there is an error: "+err.message);
    }
}

const runcode=async(req,res)=>{
     try{
        const userid=req.result._id;
        const problemid=req.params.id.trim();

        const {code,language}=req.body;
        if(!userid||!code||!problemid||!language)
            return res.status(400).send("some field missing");
        //fetch the problem from database
        const foundProblem=await Problem.findById(problemid);
        if(!foundProblem)
            return res.status(404).send("problem not found");

        //judge0 ko code submit krna hai 
        const languageId=getLanguageById(language);
        const submissions=foundProblem.visibletestcases.map((testcase)=>({
                source_code:code,
                language_id:languageId,
                stdin:testcase.input,
                expected_output:testcase.output
        }));
        
        const submitresult= await submitbatch(submissions);
        
        const resultoken=submitresult.map((value)=> value.token);
        
        const testresult=await submittoken(resultoken);

        res.status(201).send(testresult);
    }
    catch(err)
    {
        res.status(500).send("there is an error: "+err.message);
    }
}

module.exports={submitcode,runcode};