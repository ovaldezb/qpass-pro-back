var nodemailer1 = require('nodemailer')

var transporter = nodemailer1.createTransport({
  host:process.env.EMAIL_HOST,
  port:process.env.EMAIL_PORT,
  secure:true,
  auth:{
    type: 'login',
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  },
  ignoreTLS: true,
  tls: {
   // do not fail on invalid certs
   rejectUnauthorized: false
  }
});

exports.handler = (event: any, context: any, callback: any) =>{
  console.log('Enviando correo');
  console.log('Recieved Event:'+JSON.stringify(event, null, 4) );
  var message = event.Records[0].Sns.Message;
  console.log(message);
  //let _body = JSON.parse(event.body);
  //console.log(_body);
    let body_txt='<h2>Contact Form Details</h2>';
    /*for (var key in _body) {
        var res = key.replace("_", " ");
        body_txt +='<p><strong>' + titleCase(res) +' : </strong>'+_body[key] + '</p>';
    }*/
    //console.log(body_txt);

    let mailOptions = {
        from: 'soporte@gecoplus.mx',
        to: 'omar.valdez.becerril@gmail.com',
        subject: 'EmailHandler',
        html: body_txt
    };

    transporter.verify((err:any, success:any)=>{
      if(err){
        console.log(err);
      }else{
        console.log('Server is ready');
      }
    });

    var response = transporter.sendMail(mailOptions);
    console.log(response);
    transporter.close();

    return {
      statusCode:200,
      body:'Se envio',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST'
      }
    }
}

function titleCase(str: string) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // return the joined string
    return splitStr.join(' ');
}