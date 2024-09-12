import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken'
import { forgetPasswordModel } from "./model.js";
import dotenv from 'dotenv'
dotenv.config()
function decode(token,secretKey){
  return  jwt.verify(token, secretKey, (err, decoded) => {
        
        // If token is valid, you can access the decoded payload
        console.log('Decoded Token:', decoded);
  
        // Proceed with your logic, e.g., granting access
        return decoded;
      });
}
async function voterFormConformation(req,JWT_SECRET){
    
    const token = req.headers['authorization'].split(' ')[1];

const decoded_token=decode(token,JWT_SECRET);

    const transporter = nodemailer.createTransport({
        host: process.env.GMAIL_HOST,
        port: process.env.GMAIL_SERVICE_PORT,
    
        auth: {
          user: process.env.GMAIL_AUTH_USER,
          pass: process.env.GMAIL_AUTH_PASSWORD,
        },
      });
      const info = await transporter
        .sendMail({
          from: process.env.GMAIL_AUTH_USER, // sender address
          to: decoded_token['email'], // list of receivers
          subject: `votercard conformation send by voting app`, // Subject line
          text: `Dear ${req.body.name},

            Thank you for submitting your Voter ID Generation form. We have received your details and our team is currently in the process of validating the information provided.
            
            Please allow us a few working days to complete the verification process. Once your information is validated, we will proceed with the generation of your Voter ID. You will receive your Voter ID via email shortly thereafter.
            
            If any additional information is required, our team will reach out to you.
            
            Thank you for your cooperation and patience.
            
            Best regards,
            The Voting Team`
        })
}

async function voterIdmail(req,JWT_SECRET){

    const token = req.headers['authorization'].split(' ')[1];
    
const decoded_token=decode(token,JWT_SECRET);
console.log(decoded_token)
    const transporter = nodemailer.createTransport({
        host: process.env.GMAIL_HOST,
        port:  process.env.GMAIL_SERVICE_PORT,
    
        auth: {
          user:  process.env.GMAIL_AUTH_USER,
          pass:  process.env.GMAIL_AUTH_PASSWORD,
        },
      });
      const info = await transporter
        .sendMail({
          from: process.env.GMAIL_AUTH_USER, // sender address
          to: decoded_token['email'], // list of receivers
          subject: `Your Voter ID Has Been Successfully Generated`, // Subject line
          text: ` 

      Dear ${req.body.name},

We are pleased to inform you that your Voter ID has been successfully generated. After thoroughly validating the information you provided, we have completed the process.

Your Voter ID is attached to this email as a password-protected PDF file. For your security, the password to open the file is your date of birth in the YYYYMMDD format (e.g., if your date of birth is January 15, 1990, the password would be 19900115).

Please review the details in the PDF and keep both the document and the password secure, as they will be required when participating in elections.

If you have any questions or require further assistance, feel free to contact us.

Thank you for your trust and participation.

Best regards,
The Voting Team`,


attachments:[
    {
        filename: `${req.body.aadhar}_protected.pdf`, // File name you want to send
        path: `./upload/${req.body.aadhar}/${req.body.aadhar}_protected.pdf`
}
]
        })
}


async function updateVoterFormConformation(req,JWT_SECRET){
    
  const token = req.headers['authorization'].split(' ')[1];

const decoded_token=decode(token,JWT_SECRET);

  const transporter = nodemailer.createTransport({
      host:  process.env.GMAIL_HOST,
      port:  process.env.GMAIL_SERVICE_PORT,
  
      auth: {
        user:  process.env.GMAIL_AUTH_USER,
        pass: process.env.GMAIL_AUTH_PASSWORD,
      },
    });
    const info = await transporter
      .sendMail({
        from:  process.env.GMAIL_AUTH_USER, // sender address
        to: decoded_token['email'], // list of receivers
        subject: `votercard conformation send by voting app`, // Subject line
        text: `Dear ${req.body.name},

          Thank you for submitting your Voter ID Updation form. We have received your details and our team is currently in the process of validating the information provided.
          
          Please allow us a few working days to complete the verification process. Once your information is validated, we will proceed with the generation of your Voter ID. You will receive your Voter ID via email shortly thereafter.
          
          If any additional information is required, our team will reach out to you.
          
          Thank you for your cooperation and patience.
          
          Best regards,
          The Voting Team`
      })
}

async function updatedVoterIdmail(req,JWT_SECRET){

  const token = req.headers['authorization'].split(' ')[1];
  
const decoded_token=decode(token,JWT_SECRET);
console.log(decoded_token)
  const transporter = nodemailer.createTransport({
      host:  process.env.GMAIL_HOST,
      port:  process.env.GMAIL_SERVICE_PORT,
  
      auth: {
        user:  process.env.GMAIL_AUTH_USER,
        pass:  process.env.GMAIL_AUTH_PASSWORD,
      },
    });
    const info = await transporter
      .sendMail({
        from: process.env.GMAIL_AUTH_USER, // sender address
        to: decoded_token['email'], // list of receivers
        subject: `Your Voter ID Has Been Successfully Updated`, // Subject line
        text: ` 

    Dear ${req.body.name},

We are pleased to inform you that your Voter ID has been successfully Updated. After thoroughly validating the information you provided, we have completed the process.

Your Voter ID is attached to this email as a password-protected PDF file. For your security, the password to open the file is your date of birth in the YYYYMMDD format (e.g., if your date of birth is January 15, 1990, the password would be 19900115).

Please review the details in the PDF and keep both the document and the password secure, as they will be required when participating in elections.

If you have any questions or require further assistance, feel free to contact us.

Thank you for your trust and participation.

Best regards,
The Voting Team`,


attachments:[
  {
      filename: `${req.body.aadhar}_protected.pdf`, // File name you want to send
      path: `./upload/${req.body.aadhar}/${req.body.aadhar}_protected.pdf`
}
]
      })
}


 function forgetPasswordOtpMail(req,res,otp){
    
  const transporter = nodemailer.createTransport({
      host:  process.env.GMAIL_HOST,
      port:  process.env.GMAIL_SERVICE_PORT,
  
      auth: {
        user:  process.env.GMAIL_AUTH_USER,
        pass: process.env.GMAIL_AUTH_PASSWORD,
      },
    });
    const info =  transporter
      .sendMail({
        from:  process.env.GMAIL_AUTH_USER, // sender address
        to: req.body.email, // list of receivers
        subject: `votercard conformation send by voting app`, // Subject line
        text: `Dear ${req.body.name},

       Your OTP for the Voting App is: ${otp}\n Please use this OTP to verify your identity and access the voting process. \n **Important:** Do not share this OTP with anyone else. The OTP is confidential and meant to be used only by you. If you did not request this OTP, please contact our support team immediately.\n Thank you for using the Voting App!\n Best regards,\n The Voting App Team`
      })
      .then(async()=>{
        await forgetPasswordModel.findOneAndUpdate(
          {email:req.body.email},
          {otp:otp,time:req.body.time},
          
          {upsert:true,new:true,setDefaultsOnInsert:true}
        )
      return  res.status(200).send({message:"otp generate successful"})
      })
      .catch(()=>{
        return res.status(422).send({message:"invalid email Id or network connection error"})
      })
}

export {voterFormConformation,voterIdmail,updateVoterFormConformation,updatedVoterIdmail,forgetPasswordOtpMail}