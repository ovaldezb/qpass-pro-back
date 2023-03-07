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
      //cc:['reparaciones@tdm.mx','manuel.leon@tecno-dinamica.com'],
      subject: 'QPASS Pro Invitacion ', // Subject line
      html: '<p>Estimado(a): <strong> usuario </strong></p>'
    };
    transporter.sendMail(message)
            .then((info: any)=>{
              console.log(info);
              return 200; 
            })
            .catch((err: string)=>{
              console.log(err);
              return 400; 
            });    
    transporter.close();
  }
}

module.exports = controller;