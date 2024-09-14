import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken'
import { forgetPasswordModel } from "./model.js";
import dotenv from 'dotenv'
import { downloadImageFromAzure } from "./fileupload.js";
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

  const pdfBuffer=await downloadImageFromAzure(`${req.body.aadhar}/voterfile_protected.pdf`)

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
        content: pdfBuffer, // Attach the PDF buffer
        contentType: 'application/pdf',
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

const pdfBuffer=await downloadImageFromAzure(`${req.body.aadhar}/voterfile_protected.pdf`)

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
      content: pdfBuffer, // Attach the PDF buffer
      contentType: 'application/pdf',
}
]
      })
}


 async function forgetPasswordOtpMail(req,res,otp){
    
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
        subject: ` Verify OTP to Change Your Password`, // Subject line
        text: `Dear ${req.body.name},
Your OTP: ${otp}
We have received a request to change the password for your account associated with this email address. To ensure the security of your account, please verify your identity by entering the One-Time Password (OTP) provided below.
`
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



async function VotingStartedEmail(user){
    
//   const token = req.headers['authorization'].split(' ')[1];

// const decoded_token=decode(token,JWT_SECRET);

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
        to: user['email'], // list of receivers
        subject: `votercard conformation send by voting app`, // Subject line
        text: `Dear ${user.name},

Voting has officially started, and your participation is important! Please take a moment to cast your vote and make your voice heard.

Don't Have a Voter Card?
If you don't have a voter card, you can still apply for one. Visit the voting app website. Make sure to apply soon so you can participate in the voting process.

Let’s make a difference together by voting!

          Best regards,
          The Voting Team`
      })
}


export {voterFormConformation,voterIdmail,updateVoterFormConformation,updatedVoterIdmail,forgetPasswordOtpMail,VotingStartedEmail}