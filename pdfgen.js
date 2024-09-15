import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { downloadImageFromAzure, uploadFileToAzure } from './fileupload.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



async function pdfgenerater(req) {
  const picfile=req.files['picfile'][0]
  const picfileBuffer = await downloadImageFromAzure(`${req.body.aadhar}/${picfile.originalname}`)
  const picfilegrayBuffer = await downloadImageFromAzure(`${req.body.aadhar}/bnw/${picfile.originalname}`)
   
  const qrcodeBuffer = await downloadImageFromAzure(`${req.body.aadhar}/qrcode.png`)
   
  const doc = new PDFDocument();
  const pdfChunks = [];
    
  // Collect the PDF data into chunks (to store it in memory)
  doc.on('data', chunk => pdfChunks.push(chunk));
  doc.on('end', async () => {
    const pdfBuffer = Buffer.concat(pdfChunks);

    // Step 3: Upload the PDF buffer to Azure Blob Storage
    await uploadFileToAzure(pdfBuffer,`${req.body.aadhar}/voterfile.pdf`);
  });
      
    // doc.pipe(fs.createWriteStream("./upload/"+`${req.body.aadhar}`+"/"+`${req.body.aadhar}`+'.pdf'));
    const backgroundImagePath =path.join(__dirname,'photos','voter.jpeg') ; // Path to your background image
    const backgroundWidth = 250; // Specify the desired width
    const backgroundHeight = 150; // Specify the desired height
    const xPos = 45; // X position where the background image starts
    const yPos = 100; // Y position where the background image starts

    const backgroundfrontImagePath = path.join(__dirname,'photos','back.jpg') ; // Path to your background image
    const backgroundfrontWidth = 250; // Specify the desired width
    const backgroundfrontHeight = 150; // Specify the desired height
    const xPosfront = 330; // X position where the background image starts
    const yPosfront = 100; // Y position where the background image starts

    // Draw the background image first
    doc.image(backgroundImagePath, xPos, yPos, { width: backgroundWidth, height: backgroundHeight });
    doc.image(backgroundfrontImagePath, xPosfront, yPosfront, { width: backgroundfrontWidth, height: backgroundfrontHeight });

    doc.rect(45, 100, 250, 150)  // (x, y, width, height)
    .lineWidth(1)            // Border thickness
    .stroke();     
            
  
 
 // Add the second box
 doc.rect(330, 100, 250, 150)  // (x, y, width, height)
    .lineWidth(1)            // Border thickness
    .stroke();    
 

    doc.rect(30, 530, 560, 230)
    .strokeColor('#c43636') // (x, y, width, height)
    .lineWidth(3)            // Border thickness
    .stroke();    
   

    doc.registerFont('MarathiFont', path.join(__dirname,"fonts","AnekDevanagari-VariableFont_wdth,wght.ttf"));
   
   
    doc.fontSize(9).font('MarathiFont').text("कृपया नोंद घ्यावी / Kindly note that",250,540,{width:550})
.text("1. ई-ओळखपत्र हेनिवडणुकीकरीता ओळखीचा पुरावा आहे.",35,560,{width:550})
.text("2. केवळ मतदार ओळखपत्र असणेम्हणजे मतदार यादीत नाव असण्याची हमी नाही. कृपया प्रत्येक निवडणुकीपूर्वी वर्तमान मतदार यादीत तुमचे नाव तपासा. यासाठी",35,575,{width:550})
.text("https://voters.eci.gov.in/ ला भेट द्या.",35,585,{width:550})
.text("3. या कार्डमध्ये नमूद केलेली जन्मतारीख ही मतदार यादीतील नोंदणीशिवाय इतर कोणत्याही कारणासाठी वयाचा किंवा जन्मतारीखेचा पुरावा मनाला जाणार नाही.",35,600,{width:550})
.text("4. जोपर्यंत तुमचे नाव भारतातील कोणत्याही मतदारसंघाच्या मतदार यादीत आहे तोपर्यंत ई-ओळखपत्र संपूर्ण देशात वैध आहे",35,612,{width:550})
.text("5. ई-ओळखपत्र हेप्रमाणित आणि सुरक्षित क्यु.आर कोड रीडर ऍप्लिकेशन वापरून सत्यापित केले जाऊ शकते.",35,625,{width:550})
.text("6. हा इलेक्ट्रॉनिक पद्धतीने तयार केलेला दस्तऐवज आहे.",35,635,{width:550})

.text("1. e-EPIC is a proof of identity for the purpose of an election.",35,650,{width:550})
.text("2. Mere possession of EPIC is no guarantee of name being present in electoral roll. Please check your name in the current electoral roll before",35,660,{width:550})
  .text("every election. Kindly visit https://voters.eci.gov.in/",35,670,{width:550})
.text("3. Date of birth mentioned in this card shall not be treated as proof of age or date of birth for any purpose.",35,679,{width:550})
.text("4. e-EPIC is valid throughout the country, till you are enrolled in electoral roll for any constituency in India.",35,689,{width:550})
.text("5. e-EPIC can be verified using authentic and secure QR code reader application.",35,696,{width:550})
.text("6. This is electronically generated document.",35,704,{width:550})


    
        doc.image(picfileBuffer, 50, 160, { width: 60 , height:70}); // 

        doc.image(picfilegrayBuffer,253,140,{width:25})
  
       
      try{
        doc.image(qrcodeBuffer,353,140,{width:65})
        
        doc.image(qrcodeBuffer,45,340,{width:130})
      }catch{}
 //line upper to qrcode
        doc.moveTo(30, 300)       // Start the line at x=100, y=150
   .lineTo(590, 300)       // End the line at x=500, y=150
   .strokeColor('#c43636') // Set the color of the line
   .lineWidth(3)           // Set the thickness of the line
   .stroke();

//side of qr
   doc.moveTo(200, 320)        // Starting point (x, y)
   .strokeColor('#32f239')
   .lineTo(200, 520)       // Ending point (x, y)
   .lineWidth(3)           // Set line width for a light line
   .stroke();


        const logoPath_satyamev =path.join(__dirname,'photos','satyamev-jayate.png') 
        const logoPath_eci = path.join(__dirname,'photos','eci.png') 
        
        const userDetails = {
          // number: '1234567890',
          name: req.body.name,
          fname: req.body.fname,
          gender: req.body.gender,
          // fatherName: 'Father Name',
          dob: req.body.dob,
          address:req.body.house_no+" , "+req.body.area+" , "+req.body.village+" , "+req.body.post_office+" , "+req.body.taluka+" , "+req.body.pincode ,
          state: req.body.state,
          district: req.body.district,
          assemblyName: req.body.assembly_name,
          assemblyNumber: req.body.assembly_no,
          epic_no:req.body.epic_no,
          marathiData: req.body.marathidata
        };
        
        const mData=userDetails.marathiData.split("/")
        doc.image(  logoPath_satyamev, 40, 100, { width: 45 });
        doc.image(  logoPath_eci, 253, 104, { width: 30 });
       
       
       
      

       
        doc.font('MarathiFont')
        .fontSize(15)
        .text('भारत निवडणूक आयोग', 80, 15,{align:'center'});

          doc
     .fontSize(18)
     .text('ELECTION  COMMISSION  OF  INDIA', 70, 30,{align:'center'});
   
     //upper strong
     doc.moveTo(130, 60)        // Starting point (x, y)
     .strokeColor('#000000')
     .lineTo(480, 60)       // Ending point (x, y)
   .lineWidth(3)           // Set line width for a strong, bold line
   .stroke();     
   
   //lefet box strong
   doc.moveTo(80, 120)        // Starting point (x, y)
   .strokeColor('#000000')
   .lineTo(250, 120)       // Ending point (x, y)
   .lineWidth(1)           // Set line width for a strong, bold line
   .stroke();  
  //UPPER DASH
   doc.moveTo(5, 75)        // Starting point (x, y)
  
   .strokeColor('#000000') 
   .lineTo(doc.page.width, 75)       // Ending point (x, y)
   .dash(5, { space: 5 })  // Create a dotted line: (dash length, { space: space between dashes })
   .lineWidth(1)           // Set line width for a light line
   .stroke();
  
   //LOWER DASH
   doc.moveTo(5, 275)        // Starting point (x, y)
   .strokeColor('#000000')
   .lineTo(doc.page.width, 275)       // Ending point (x, y)
   .dash(5, { space: 5 })  // Create a dotted line: (dash length, { space: space between dashes })
   .lineWidth(1)           // Set line width for a light line
   .stroke();


   //INSIDE DASH
   doc.moveTo(315, 80)        // Starting point (x, y)
   .strokeColor('#000000')
   .lineTo(315, 270)       // Ending point (x, y)
   .dash(5, { space: 5 })  // Create a dotted line: (dash length, { space: space between dashes })
   .lineWidth(1)           // Set line width for a light line
   .stroke();
  
   
  
    

 

   
   doc
     .font('MarathiFont')
  
  .fontSize(8)
  .text('पत्ता: '+mData[2], 430, 110,{width:140,height:50})
  .text('Address: '+userDetails.address, 430, 160,{width:140,height:50});
 
  doc.font('MarathiFont')
  .fontSize(9)
  .text(`Electoral Registration Officer ${userDetails.assemblyNumber}-${userDetails.assemblyName}`, 430, 200,{width:140,height:50});

  doc.font('MarathiFont')
  .fontSize(9)
  .text('भारत निवडणूक आयोग', 120, 108);

   
    doc
.fontSize(10)
.text('ELECTION  COMMISSION  OF  INDIA', 90, 120);

doc.fontSize(10).text(userDetails.epic_no,53,143)
doc.fontSize(9).text(userDetails.epic_no,360,210)

  doc.font('MarathiFont')
  .fontSize(7)
.text(`नाव: ${mData[0]}`,125,157)
  .text(`Name: ${userDetails.name}`, 125, 165)
  .text(`वडिलांचे नाव:  ${mData[1]}`,125,176)
  .text(`Father Name: ${userDetails.fname}`, 125, 186)
  .text(`Gender: ${userDetails.gender}`, 125, 196)
  .text(`Date of Birth: ${userDetails.dob}`, 125, 205)
 
 
 
 
  

  doc.font('MarathiFont')
  .text(`मतदार ओळखपत्र क्र. / Epic no. :                            ${userDetails.epic_no}`,220,320)
  .text(` विधानसभा मतदारसंघ क्रमांक आणि नाव :              ${userDetails.assemblyNumber} ${mData[3]}`,219,340)
  .text(`Assembly Constituency No. and Name :        ${userDetails.assemblyNumber} ${userDetails.assemblyName}`,220,360)
  
  doc
  .text(`State:                                                                         ${userDetails.state}`, 220, 380)
  .text(`District:                                                                      ${userDetails.district}`, 220, 400)  
  .text(`Assembly Name:                                                    ${userDetails.assemblyName}`, 220, 420)
  .text(`Assembly Number:                                                ${userDetails.assemblyNumber}`, 220, 440);

    doc.end();
}

export default pdfgenerater;