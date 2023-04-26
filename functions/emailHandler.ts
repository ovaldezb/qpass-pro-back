var nodemailer1 = require('nodemailer')
var handlebars = require('handlebars')
const crypto = require('crypto');
const algorithm = 'aes-256-cbc'; //Using AES encryption
const crypto_key = process.env.CRYPTO_KEY ? process.env.CRYPTO_KEY : '';
const crypto_iv = process.env.CRYPTO_IV ? process.env.CRYPTO_IV : '';
const key = Buffer.from(crypto_key,'hex');//crypto.randomBytes(32);
const iv = Buffer.from(crypto_iv,'hex');
function encrypt(text: string) {
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}
var email_html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      /* Add your custom CSS styles here */
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      .qr-code {
        max-width: 500px;
        margin: 10px;
      }
      
      .header {
        background-color: #2D3E50;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      
      .content {
        padding: 20px;
        text-align: left;
      }
      
      .footer {
        background-color: #2D3E50;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1> Atenta Invitación </h1>
    </div>
    <div class="content">
      <p>Estimado {{ nombreInvitado }},</p>
      <p>Estas cordialmente invitado a un evento, el cual se llevará a cabo en {{ lugar }}, el día {{ fechaEvento }} a las {{ horaEvento}}.</p>
      <p>Por favor considera las reglas de nuestro condominio:</p>
      <ul>
        <li>La invitación es válida únicamente para la fecha indicada</li>
        <li>No fumar en zonas cerradas.</li>
        <li>No se permitirá música despues de las 10 pm.</li>
        <li>No se permiten mascotas.</li>
      </ul>
      <p>Para poder ingresar al complejo, favor de presentar el siguiente código QR en seguridad:</p>
      <img class="qr-code" src="{{ qr_url }}" alt="QR Code" width="500"/>
      <p>Esperamos recibirlo pronto!</p>
      <p>Saludos,</p>
      <p>{{ anfitrion }}</p>
    </div>
    <div class="footer">
      <p>Copyright © 2023 {{ nombreCondominio }}</p>
    </div>

  </body>
</html>
`;
var transporter = nodemailer1.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    type: 'login',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  ignoreTLS: true,
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  }
});

exports.handler = (event: any, context: any, callback: any) => {
  console.log('Recieved Event:' + JSON.stringify(event, null, 4));
  var message = event.Records[0].Sns.Message;
  
  var message = JSON.parse(message);
  var cadenaEncriptada = encrypt(JSON.stringify(message));
  var template = handlebars.compile(email_html);
  
  var replacements = {
    anfitrion: message.anfitrion,
    qr_url: 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl='+cadenaEncriptada.encryptedData+'&choe=UTF-8',
    lugar: message.lugar,
    fechaEvento:message.fechaEvento,
    horaEvento: message.horaEvento,
    nombreInvitado: message.nombreInvitado,
    nombreCondominio: "Quinta Palmeras"
  };
  var htmlToSend = template(replacements);

  let mailOptions = {
    from: 'soporte@gecoplus.mx',
    to: message.correoInvitado,
    subject: "Invitacion para "+message.asunto,
    html: htmlToSend
  };

  transporter.verify((err: any, success: any) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Server is ready');
    }
  });

  var response = transporter.sendMail(mailOptions)
                  .then((res: any)=>{
                    console.log(res);
                  })
                  .catch((err: any)=>{
                    console.log(err);
                  });
  transporter.close();

  return {
    statusCode: 200,
    body: 'Se envio',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST'
    }
  }
}
