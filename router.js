import express from "express";
import dotenv from 'dotenv'
import { userModel, usersignupModel,otpModel, VotercardModel, forgetPasswordModel } from "./model.js";
const router = express.Router();
import nodemailer from "nodemailer";
import otpgenerator from "otp-generator";
import mongoose from "mongoose";
import { raw } from "mysql";
import jwt from 'jsonwebtoken'
import multer from "multer";
import fs from "fs";
import path from "path";
import Jimp from 'jimp'
import axios from 'axios'
import { exec } from 'child_process'
import Tesseract from "tesseract.js";
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import pdfgenerater from "./pdfgen.js";
import { forgetPasswordOtpMail, updatedVoterIdmail, updateVoterFormConformation, voterFormConformation, voterIdmail } from "./emailcontroller.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET;
const adminEmail=process.env.ADMIN_EMAIL;
const adminPassword=process.env.ADMIN_PASSWORD;

// JWT verification middleware
function authenticateToken(req, res, next) {

  const authHeader = req.headers['authorization'];
 
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token from 'Bearer <token>'
 
  if (token=='null') return res.status(401).send({message:"please login"}); // No token provided

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send({message:"session expired please login again"}); // Invalid token

    req.user = user; // Attach user info to the request
    next(); // Continue to the next middleware/route handler
  });
}

const otpgen = (len) => {
  const otp = otpgenerator.generate(len, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  return otp;
};

async function useroradmin(req,res,next){
  const user = await usersignupModel.findOne({ email: req.user.email });
 
  if(user){
    console.log(user.email)
    req.useroradmin='user'
    next()
  }
  else return res.status(400).send({message:"login as a User"})
}

router.get("/userauth",authenticateToken,useroradmin,(req,res)=>{
 return res.status(200)
})


router.get("/landingpage",authenticateToken,async (req,res)=>{
  const user = await usersignupModel.findOne({ email: req.user.email });
  if(user)return res.json({data:'user'})
    else if(req.user.email==adminEmail && req.user.password==adminPassword)return res.json({data:'admin'})
  else return res.json({data:null})
})


router.post("/signup", async (req, res) => {
  console.log(req.body)
  const user = await usersignupModel.findOne({ email: req.body.signupData.email });
  if(user){
    
    res.status(409).send({message:"user already exists"})
    return;
  }
  if(req.body.signup){
    const user = await otpModel.findOne({ email: req.body.signupData.email });
    console.log(user)
    if(user!=null){
      const waiting=Date.now()-user.time;
      if(waiting<120000) return res.status(400).send({message:"wait 2 min to generate otp"})
    }
  const otp=otpgen(6);
  const transporter = nodemailer.createTransport({
    host:process.env.GMAIL_HOST,
    port: process.env.GMAIL_SERVICE_PORT,

    auth: {
      user: process.env.GMAIL_AUTH_USER,
      pass: process.env.GMAIL_AUTH_PASSWORD,
    },
  });
  const info = await transporter
    .sendMail({
      from: process.env.GMAIL_AUTH_USER, // sender address
      to: req.body.signupData.email, // list of receivers
      subject: `otp send by voting app`, // Subject line
      text: `Hello ${req.body.signupData.name},\n

Your OTP for the Voting App is: ${otp}\n Please use this OTP to verify your identity and access the voting process. \n **Important:** Do not share this OTP with anyone else. The OTP is confidential and meant to be used only by you. If you did not request this OTP, please contact our support team immediately.\n Thank you for using the Voting App!\n Best regards,\n The Voting App Team`
     
    })
    .then(async() => {
      console.log("gen success");
      await otpModel.findOneAndUpdate(
        {email:req.body.signupData.email},
        {otp:otp,time:req.body.time},
        
        {upsert:true,new:true,setDefaultsOnInsert:true}
      )
      res.status(200).send({message:"otp generate successful"})
    }).catch((err)=>{
      console.log(err)
       res.status(422).send({message:"internal server error"})
    })

  }
  
  if(req.body.otp){
    const databaseotp = await otpModel.findOne({ email: req.body.signupData.email });
    if(req.body.otp.otpval==databaseotp.otp){
      return res.status(200).send({ message: "success" });
    }
    else return res.status(403).send({ message: "otp is incorrect" });
  }

  if(req.body.data){
  const user = new usersignupModel(req.body.signupData);
   user.save().then(()=>res.status(200).send({message:"success"}))
   .catch((err)=>res.status(500).send({message:err}))
  }
});

router.get("/admin",authenticateToken, async (req, res) => {
 
  if(req.user.email==adminEmail && req.user.password==adminPassword){
  
    return res.status(200)
  
}

else return res.status(400).send({message:"login as a Admin"})
});

router.get("/voterdata",authenticateToken, async (req, res) => {
 
  if(req.user.email==adminEmail && req.user.password==adminPassword){
  return res.json(
  
    await userModel.find()
  );
}else return res.status(400).send({message:"login as a Admin"})
});


router.post("/login", async (req, res) => {
  if(req.body.user=='user'){
  const user = await usersignupModel.findOne({ email: req.body.loginData.email });
  if (user) {
    if (user.password == req.body.loginData.password){
      const token = jwt.sign({ email: req.body.loginData.email,password:req.body.loginData.password }, JWT_SECRET);
      return res.status(200).send({ message: "user login successful", token:token });
    
    }
    else return res.status(401).send({ message: "password is incorrect" });
  }
  return res.status(400).send({ message: "user not found" });
}

else if(req.body.user=='admin'){
  if(req.body.loginData.email==adminEmail){
    if(req.body.loginData.password==adminPassword){
      const token = jwt.sign({ email: req.body.loginData.email,password:req.body.loginData.password }, JWT_SECRET);
      return res.status(200).send({ message: "admin login successful", token:token });
    }
    else return res.status(401).send({ message: "password is incorrect" });

  }
  return res.status(400).send({ message: "admin not found" });
}
});




const createDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    const uniqueKey = req.body.aadhar; // Assuming the unique key is sent in the form data
    const uploadPath = path.join(__dirname, 'upload', uniqueKey);

    createDirectory(uploadPath);

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })


async function convertImageToGrayscale(inputImagePath, outputImagePath) {
  
  const image = await Jimp.read(inputImagePath);
   image.grayscale().write(outputImagePath);
   // Set the global path to the grayscale image
}



async function downloadImage(url, dest,writer) {
  try {
      // Make a GET request to the image URL with responseType set to 'stream'
      const response = await axios({
          url,
          method: 'GET',
          responseType: 'stream',
      });

      // Create a writable stream to save the image
     

      // Pipe the response data to the file stream
     
        response.data.pipe(writer);
    
    

      // Return a promise that resolves when the file is fully written
      return new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
      });
  } catch (error) {
      console.error(`Error downloading image: ${error.message}`);
  }
}

async function extractAadharNumber_dob(imagePath) {
  try {
    // Perform OCR using Tesseract on the original image
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
      tessedit_char_whitelist: '0123456789',
    });

    // Use regex to find the Aadhaar number pattern (usually a 12-digit number)
    const aadharNumber = text.match(/\d{4}\s\d{4}\s\d{4}/);
    const optionaadhar=text.match(/\b\d{12}\b/)
    const dobPattern = /\b\d{2}\/\d{2}\/\d{4}\b/;
    const dobMatch = text.match(dobPattern);
    console.log(`text: ${text}`);
    console.log(`Extracted Aadhaar Number: ${aadharNumber}, ${optionaadhar}, ${dobMatch}`);
    if(aadharNumber){
      return [aadharNumber,dobMatch];
    }
    else if(optionaadhar){
      return [optionaadhar,dobMatch]
    }
    else return ['', '']
    // if (aadharNumber && dobMatch) {
    //   console.log(`Extracted Aadhaar Number: ${aadharNumber[0]}`);
    //   return [aadharNumber,dobMatch];
    // } else {
    //   console.log('Aadhaar number not found');
    // }
  } catch (error) {
    console.error('Error extracting Aadhaar number:', error);
  }
}




router.post("/votercard",authenticateToken,useroradmin, upload.fields([{name:'picfile',maxCount:1},{name:'address_proof',maxCount:1}]),async (req,res)=>{
  const voter = await VotercardModel.findOne({ aadhar:req.body.aadhar });
if(voter){
 return res.status(400).send({message:"voter is already exist"})
}
 console.log(req.body)



convertImageToGrayscale("./upload/"+`${req.body.aadhar}`+"/"+`${req.files['picfile'][0]['filename']}`,"./upload/"+`${req.body.aadhar}`+"/bnw/"+`${req.files['picfile'][0]['filename']}`)
convertImageToGrayscale("./upload/"+`${req.body.aadhar}`+"/"+`${req.files['address_proof'][0]['filename']}`,"./upload/"+`${req.body.aadhar}`+"/bnw/"+`${req.files['address_proof'][0]['filename']}`)


const extracted_aadharNo_dob=await extractAadharNumber_dob("./upload/"+`${req.body.aadhar}`+"/bnw/"+`${req.files['address_proof'][0]['filename']}`)


//console.log(extracted_aadharNo_dob[0][0],','+extracted_aadharNo_dob[1][0])
try{
const split_dob=extracted_aadharNo_dob[1][0].split('/')
const dob= split_dob[2].concat("-",split_dob[1],'-',split_dob[0])
const aadhar=extracted_aadharNo_dob[0][0].split(' ').join('')

// console.log(dob,","+aadhar)
// console.log(req.body.dob,","+req.body.aadhar)
if(aadhar!=req.body.aadhar )return res.status(400).send({message:"aadhar number is not match with aadhar document"})
if(dob!=req.body.dob )return res.status(400).send({message:"dob is not match with aadhar document"})
}catch{
  return res.status(400).send({message:"document is invalid"})
}
const imageurl= "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+"Name:"+req.body.name+" FatherName:"+req.body.fname+" DOB:"+req.body.dob+" Aadhar No:"+req.body.aadhar;

const filepath="./upload/"+`${req.body.aadhar}`+"/"+"qrcode.png";

const writer = fs.createWriteStream(filepath);
  const num=otpgen(7)
  let name=req.body.name.trim().substr(0,3).toUpperCase();
  const epic_no=name+num;
 

  req.body.epic_no=epic_no;
  setTimeout(()=>{
    downloadImage(imageurl,filepath,writer);
  },1000)

  const subscriptionKey = process.env.TRANSLATE_SUBSCRIPTION_KEY; // Replace with your Azure subscription key
const endpoint = process.env.TRANSLATE_ENDPOINT;

// The target language for translation (Marathi - 'mr')
const targetLanguage = 'mr';

// const address=`${req.body.house_no}+" , "+${req.body.area}+" , "+${req.body.village}+" , "+${req.body.post_office}+" , "+${req.body.taluka}+" , "+${req.body.pincode}`;
// // The text you want to translate
// const textToTranslate = `${req.body.name}+"/"+${req.body.fname}+"/"+${address}`;

const addresscon=req.body.house_no.concat(" , ",req.body.area," , ",req.body.village," , ",req.body.post_office," , ",req.body.taluka," , ",req.body.pincode);

const textToTranslateCon=req.body.name.concat("/",req.body.fname,"/",addresscon,"/",req.body.assembly_name)
// The request body
// const requestBody = 
//     {
//         'Text': "hello good morning"
//     }


// Make the POST request to the Translator Text API
axios({
  baseURL: endpoint,
  url: '/translate',
  method: 'post',
  headers: {
      'Ocp-Apim-Subscription-Key':subscriptionKey,
       // location required if you're using a multi-service or regional (not global) resource.
      'Ocp-Apim-Subscription-Region': 'centralindia',
      'Content-type': 'application/json',
      'X-ClientTraceId': uuidv4().toString()
  },
  params: {
      'api-version': '3.0',
      'from': 'en',
      'to': 'mr'
  },
  data: [{
      'text': textToTranslateCon
  }],
  responseType: 'json'
}).then(function(response){
  // console.log('Translation:', response.data[0].translations[0].text);
  req.body.marathidata=response.data[0].translations[0].text;
}).catch((err)=>{
  return res.status(500).send({message:'server error'})
})

  setTimeout(()=>{
    pdfgenerater(req)
  },4000)
  
   const passdob=req.body.dob.split('-').join('')
  const inputFile = "C:\\Users\\Avishkar kale\\Desktop\\backend\\upload\\"+`${req.body.aadhar}`+"\\"+`${req.body.aadhar}`+'.pdf';
const outputFile = "C:\\Users\\Avishkar kale\\Desktop\\backend\\upload\\"+`${req.body.aadhar}`+"\\"+`${req.body.aadhar}_protected`+'.pdf';
const userPassword = passdob;
const ownerPassword = process.env.PDF_FILE_PROTECTION_OWNER_PASSWORD;

// QPDF command to encrypt the PDF file
const command = `qpdf --encrypt ${userPassword} ${ownerPassword} 256 -- "${inputFile}" "${outputFile}"`;


setTimeout(() => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error encrypting PDF: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(`PDF encrypted successfully! Output file: ${outputFile}`);
  });
}, 5000);




const Voter=new VotercardModel({
  ...req.body,
  picfile:"./upload/"+`${req.body.aadhar}`+"/"+`${req.files['picfile'][0]['filename']}`,
  address_proof:"./upload/"+`${req.body.aadhar}`+"/"+`${req.files['address_proof'][0]['filename']}`,
  epic_no:epic_no
})

Voter.save().then(()=>{
  voterFormConformation(req,JWT_SECRET)
  setTimeout(() => {
    voterIdmail(req,JWT_SECRET)
  }, 8000);
 return res.status(200).send({message:"form submitted successfully"})
})
.catch((err)=>{
return res.send({message:err})
})

})


router.post('/userheader',authenticateToken,async(req,res)=>{
 
  const user = await usersignupModel.findOne({ email: req.user.email });
  if(user){
   
    const data={
      username:user.name,
      email:req.user.email
    }
   return res.status(200).send({data:data})
   
  }
  else if(adminEmail==req.user.email && adminPassword==req.user.password){
    const data={
      username:"admin",
      email:req.user.email
    }
    return res.status(200).send({data:data})
  }
  return res.status(404).send({message:'user not found'})
})

router.post("/downloadvotercard",authenticateToken,useroradmin,async(req,res)=>{
 const voter =  await VotercardModel.findOne({epic_no:req.body.epic_no})
 if(voter){
   const file=`C:\\Users\\Avishkar kale\\Desktop\\backend\\upload\\${voter.aadhar}\\${voter.aadhar}.pdf`
   
 
 return res.download(file)
 }
 else return res.status(404).send({message:"Voter Not Found"})
})


router.put("/updatevotercard",authenticateToken,useroradmin, upload.fields([{name:'picfile',maxCount:1},{name:'address_proof',maxCount:1}]),async (req,res)=>{
  const voter = await VotercardModel.findOne({ epic_no:req.body.epic_no });
if(!voter){
 return res.status(400).send({message:"voter not found"})
}
 console.log(req.body)



convertImageToGrayscale("./upload/"+`${req.body.aadhar}`+"/"+`${req.files['picfile'][0]['filename']}`,"./upload/"+`${req.body.aadhar}`+"/bnw/"+`${req.files['picfile'][0]['filename']}`)
convertImageToGrayscale("./upload/"+`${req.body.aadhar}`+"/"+`${req.files['address_proof'][0]['filename']}`,"./upload/"+`${req.body.aadhar}`+"/bnw/"+`${req.files['address_proof'][0]['filename']}`)


const extracted_aadharNo_dob=await extractAadharNumber_dob("./upload/"+`${req.body.aadhar}`+"/bnw/"+`${req.files['address_proof'][0]['filename']}`)


//console.log(extracted_aadharNo_dob[0][0],','+extracted_aadharNo_dob[1][0])
try{
const split_dob=extracted_aadharNo_dob[1][0].split('/')
const dob= split_dob[2].concat("-",split_dob[1],'-',split_dob[0])
const aadhar=extracted_aadharNo_dob[0][0].split(' ').join('')

// console.log(dob,","+aadhar)
// console.log(req.body.dob,","+req.body.aadhar)
if(aadhar!=req.body.aadhar )return res.status(400).send({message:"aadhar number is not match with aadhar document"})
if(dob!=req.body.dob )return res.status(400).send({message:"dob is not match with aadhar document"})
}catch{
  return res.status(400).send({message:"document is invalid"})
}
const imageurl= "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+"Name:"+req.body.name+" FatherName:"+req.body.fname+" DOB:"+req.body.dob+" Aadhar No:"+req.body.aadhar;

const filepath="./upload/"+`${req.body.aadhar}`+"/"+"qrcode.png";

const writer = fs.createWriteStream(filepath);
  // const num=otpgen(7)
  // let name=req.body.name.trim().substr(0,3).toUpperCase();
  // const epic_no=name+num;
 

const epic_no=req.body.epic_no;
  setTimeout(()=>{
    downloadImage(imageurl,filepath,writer);
  },1000)

  const subscriptionKey = process.env.TRANSLATE_SUBSCRIPTION_KEY; // Replace with your Azure subscription key
const endpoint = process.env.TRANSLATE_ENDPOINT;

// The target language for translation (Marathi - 'mr')
const targetLanguage = 'mr';

// const address=`${req.body.house_no}+" , "+${req.body.area}+" , "+${req.body.village}+" , "+${req.body.post_office}+" , "+${req.body.taluka}+" , "+${req.body.pincode}`;
// // The text you want to translate
// const textToTranslate = `${req.body.name}+"/"+${req.body.fname}+"/"+${address}`;

const addresscon=req.body.house_no.concat(" , ",req.body.area," , ",req.body.village," , ",req.body.post_office," , ",req.body.taluka," , ",req.body.pincode);

const textToTranslateCon=req.body.name.concat("/",req.body.fname,"/",addresscon,"/",req.body.assembly_name)
// The request body
// const requestBody = 
//     {
//         'Text': "hello good morning"
//     }


// Make the POST request to the Translator Text API
axios({
  baseURL: endpoint,
  url: '/translate',
  method: 'post',
  headers: {
      'Ocp-Apim-Subscription-Key':subscriptionKey,
       // location required if you're using a multi-service or regional (not global) resource.
      'Ocp-Apim-Subscription-Region': 'centralindia',
      'Content-type': 'application/json',
      'X-ClientTraceId': uuidv4().toString()
  },
  params: {
      'api-version': '3.0',
      'from': 'en',
      'to': 'mr'
  },
  data: [{
      'text': textToTranslateCon
  }],
  responseType: 'json'
}).then(function(response){
  // console.log('Translation:', response.data[0].translations[0].text);
  req.body.marathidata=response.data[0].translations[0].text;
}).catch((err)=>{
  return res.status(500).send({message:'server error'})
})

  setTimeout(()=>{
    pdfgenerater(req)
  },4000)
  
   const passdob=req.body.dob.split('-').join('')
  const inputFile = "C:\\Users\\Avishkar kale\\Desktop\\backend\\upload\\"+`${req.body.aadhar}`+"\\"+`${req.body.aadhar}`+'.pdf';
const outputFile = "C:\\Users\\Avishkar kale\\Desktop\\backend\\upload\\"+`${req.body.aadhar}`+"\\"+`${req.body.aadhar}_protected`+'.pdf';
const userPassword = passdob;
const ownerPassword = process.env.PDF_FILE_PROTECTION_OWNER_PASSWORD;

// QPDF command to encrypt the PDF file
const command = `qpdf --encrypt ${userPassword} ${ownerPassword} 256 -- "${inputFile}" "${outputFile}"`;


setTimeout(() => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error encrypting PDF: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(`PDF encrypted successfully! Output file: ${outputFile}`);
  });
}, 5000);


try{
await VotercardModel.findOneAndUpdate(
  {epic_no:req.body.epic_no},
  {
    ...req.body,
    picfile:"./upload/"+`${req.body.aadhar}`+"/"+`${req.files['picfile'][0]['filename']}`,
    address_proof:"./upload/"+`${req.body.aadhar}`+"/"+`${req.files['address_proof'][0]['filename']}`,
    epic_no:voter.epic_no
  },
  
  {upsert:true,new:true,setDefaultsOnInsert:true}
)


updateVoterFormConformation(req,JWT_SECRET)
setTimeout(() => {

  updatedVoterIdmail(req,JWT_SECRET)
}, 8000);
return res.status(200).send({message:"form submitted successfully"})
}
catch(err){
 return res.send({message:err})
}
})

router.post('/userepicverify',authenticateToken,useroradmin,async (req,res)=>{
  const voter =  await VotercardModel.findOne({epic_no:req.body.epic_no})
  if(voter){
   
  return res.status(200).send({message:"voter found"})
  }
  else return res.status(404).send({message:"Voter Not Found"})
})

router.post("/uservote",authenticateToken,useroradmin,async (req,res)=>{
  console.log(new Date(+req.body.time));
  const time=new Date(+req.body.time).toISOString().slice(0, 10)
  const voter = await userModel.findOne({"election.time":time} );
  const user =  await VotercardModel.findOne({epic_no:req.body.epic_no})
 
  if(voter){
    console.log("voter"+voter)
//    voter.election.voting_data.map((e)=>{
// //  console.log(e)
//     if(e.epic_no==req.body.epic_no) {
//       return  res.status(409).send({message:"user already vote"})
//     }
//     })
const alreadyVoted = voter.election.voting_data.some(e => e.epic_no === req.body.epic_no);
   
if (alreadyVoted) {
  return res.status(409).send({ message: "user already voted" });
}

   return  userModel.updateOne(
      { "election.time": time}, // Query to find the document
      { $push: { "election.voting_data": {...req.body,voter_name:user.name}} } // Update operation to add the new hobby
    ).then((result)=>{
      console.log("result"+result[0])
      return res.status(200).send({message:"vote successful"})
    }).catch((err)=>{
      console.log(err)
      return res.status(500).send({message:" error"})
    })
  }

  const userVote = new userModel({election:{time:time,voting_data:{...req.body,voter_name:user.name}}});
  userVote.save().then(()=>res.status(200).send({message:"vote successful"}))
  .catch((err)=>{ console.log(err)
    return res.status(500).send({message:"internal server error"})})
})

router.post("/verifyepic_no",authenticateToken,useroradmin,async (req,res)=>{
  console.log(req.body.epic_no)
  const user =  await VotercardModel.findOne({epic_no:req.body.epic_no})
  if(user){
  return res.status(200).send({message:"voter found",aadhar:user.aadhar})
  }
  else return res.status(404).send({message:"Voter Not Found"})
})


router.get("/displayresult",async (req,res)=>{
  const data = await userModel.aggregate([
    { $unwind: "$election.voting_data" }, // Flatten the voting_data array
    {
      $group: {
        _id: {
          time: "$election.time",
          party_name: "$election.voting_data.party_name"
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: "$_id.time",
        parties: {
          $push: {
            _id: "$_id.party_name",
            count: "$count"
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        parties: 1
      }
    }
  ]);
  return res.json(
    data
  );
})


router.post("/forgetpasswordotp",async (req,res)=>{
  console.log(req.body)
  const user = await usersignupModel.findOne({ email: req.body.email });
  if(!user){
    res.status(409).send({message:"user not exists"})
    return;
  }
  const userInModel = await forgetPasswordModel.findOne({ email: req.body.email });

  if(userInModel !=null){
    const waiting=Date.now()-userInModel.time;
    if(waiting<120000) return res.status(400).send({message:"wait 2 min to generate otp"})
  }
   req.body.name=user.name;
   const otp=otpgen(6)
   try{
    console.log(req.body)
     forgetPasswordOtpMail(req,res,otp)
   }
  catch{
    return  res.status(500).send({message:"server error"})
   }
})

router.post("/forgetpasswordverifyotp",async(req,res)=>{
  const userInModel = await forgetPasswordModel.findOne({ email: req.body.email });

  if(userInModel.otp==req.body.otp){
    return res.status(200).send({message:"otp verified"})
  }
  else{
    return res.status(401).send({message:"otp is incorrect"})
  }

})

router.patch("/updateforgetpassword",async(req,res)=>{
  console.log(req.body)
  const user = await usersignupModel.findOne({ email: req.body.email });
  if(user.password==req.body.password){
    res.status(400).send({message:"new password have to be different from previous password"})
    return;
  }
  try{
  await usersignupModel.findOneAndUpdate(
    {email:req.body.email},
    {password:req.body.password},  
    {upsert:true,new:true,setDefaultsOnInsert:true}
  )
  return res.status(200).send({message:"password updated"})
  }catch{
    return res.status(500).send({message:"internal server error"})
  }
})

export default router;
