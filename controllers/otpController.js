// const nodemailer = require("nodemailer");
// const otpGenerator = require('otp-generator')

// let gloabal = null;

// const sendMail = (email, otp) => {
//   const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 465,
//       secure: true,
//       auth: {
//           user: "irshadsulthani24@gmail.com",
//           pass: "mzor mjho gmky lmur",
//       },
      
//   });

//   const mailOptions = {
//       from: 'irshadpallar24@gmail.com',
//       to: email,
//       subject: "This is your otp for Further Otp verification",
//       text: `This is your Otp ${otp}`,
//       html: `Here is your otp Please take. ${otp}`,
//   };
//   transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//           console.log(error);
//       } else {
//           console.log(`Mail has been sent to ${info.response}`);
//       }
//   });
// }

// function sendOtp (email){
// const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false ,digits:true,lowerCaseAlphabets:false});

// sendMail(email,otp)
// gloabal = otp;
// return otp
// }
// function resendOtp (email){
//     const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false ,digits:true,lowerCaseAlphabets:false});
    
//     sendMail(email,otp)
//     gloabal = otp;
//     return otp
//     }


// module.exports = {
//        sendOtp,
//        resendOtp
// }

const nodemailer = require("nodemailer");
const otpGenerator = require('otp-generator');
require('dotenv').config(); // Ensure you have a .env file for environment variables

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail password or app password
  },
});

// Function to send an email with the OTP
const sendMail = (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: email, // List of receivers
    subject: "Your OTP for Verification", // Subject line
    text: `This is your OTP: ${otp}`, // Plain text body
    html: `<p>This is your OTP: <strong>${otp}</strong></p>`, // HTML body
  };

  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error(`Error sending email: ${error}`);
    }
    console.log(`Mail sent: ${info.response}`);
  });
};

// Function to generate and send an OTP
const sendOtp = (email) => {
  const otp = otpGenerator.generate(4, { 
    upperCaseAlphabets: false, 
    specialChars: false, 
    digits: true, 
    lowerCaseAlphabets: false 
  });
  sendMail(email, otp);
  return otp;
};

// Function to regenerate and resend an OTP
const resendOtp = (email) => {
  const otp = otpGenerator.generate(4, { 
    upperCaseAlphabets: false, 
    specialChars: false, 
    digits: true, 
    lowerCaseAlphabets: false 
  });
  sendMail(email, otp);
  return otp;
};

module.exports = {
  sendOtp,
  resendOtp
};
