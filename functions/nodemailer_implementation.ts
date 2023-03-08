'use strict'

const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({            
  host: "gecoplus.mx",
  port: 587,
  secure: false ,
  auth: {
    type : 'login',
    user: "soporte@gecoplus.mx",
    pass: "@iI9p78a9"
  },
  ignoreTLS: true,
  tls: {
   // do not fail on invalid certs
   rejectUnauthorized: false
  },
  name : 'XEON',            
  debug : true
});

var controller = {
  sendEmail : (body:any) =>{
    const message = {             
      from: 'reparaciones@tdm.mx', // List of recipients
      to: 'omar.valdez.becerril@gmail.com',
      cc:['marianasari@gmail.com'],
      subject: 'QPASS Pro Invitacion ', // Subject line
      html: '<p>Estimado(a): <strong> usuario </strong></p>'
    };
    transporter.sendMail(message, function(err:any, info:any){
      if (err) {
          console.log('ERRO');
          console.log(err.message);
          
      }
      console.log("messageId",info.messageId);
      console.log("envelope", info.envelope);
      console.log("accepted", info.accepted);
      console.log("rejected", info.rejected);
      console.log("pending", info.pending);

  });
    transporter.close();
  }
}

module.exports = controller;