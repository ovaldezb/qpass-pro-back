
import  { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
const database = require("../service/invitacionDB");
const db = database(process.env.MONGODB_URI);
const snsClient = new SNSClient({});


const headers ={
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Headers':'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Credentials' : true,
    'Content-Type': 'application/json'
};

export const handler = async function(event:any) {
  
  const method = event.requestContext.httpMethod;
  switch(method){
    case 'GET' :
      if(event.pathParameters != null){
        return findById(event.pathParameters.idInvitacion);
      }else{
        return getAllInvitaciones();
      }
    case 'POST':
      return addInvitacion(event);
    case 'PUT':
      return updateInvitacion(event);
    case 'DELETE':
      return deleteInvitacion(event.pathParameters.idInvitacion);
    default:
      throw new Error('Unsupported route '+method);
  }
  
}

async function addInvitacion(event:any) {
  
  const body = JSON.parse(event.body);
  const savedInvitacion =  await db.create(body);
  
  var params = {
    Message: JSON.stringify(savedInvitacion),
    TopicArn: process.env.TOPIC_ARN
  }
  const data = await snsClient.send(new PublishCommand(params));
  return{
    statusCode: 200,
    body: JSON.stringify(savedInvitacion),
    headers:headers
  }
}

async function findById(idInvitacion:String) {
  const getById = await db.getById(idInvitacion);
  if(getById === null){
    var errMessage = {
      message:'No existe la invitacion para ese ID'
    };
    return{
      statusCode: 404,
      body: JSON.stringify(errMessage),
      headers:headers
    }  
  }
  return{
    statusCode: 200,
    body: JSON.stringify(getById),
    headers:headers
  }
}

async function getAllInvitaciones() {
  const getAllInvitaciones = await db.getAllInvitaciones();
  if(getAllInvitaciones === null){
    return{
      statusCode: 404,
      body: "\'message\':\'No existen registros\'",
      headers: headers
    }
  }else{
    return{
      statusCode: 200,
      body: JSON.stringify(getAllInvitaciones),
      headers:headers
    }
  }
}

async function updateInvitacion(event:any) {
  const body = JSON.parse(event.body);
  const idInvitacion = event.pathParameters.idInvitacion;
  const updateInvitacion = await db.updateInvitacion(idInvitacion,body);
  if(updateInvitacion===null){
    let bodyMessage = {
      message : 'No existen registros'
    };
    return{
      statusCode: 404,
      body: JSON.stringify(bodyMessage),
      headers:headers
    }
  }else{
    return{
      statusCode:200,
      body: JSON.stringify(updateInvitacion),
      headers:headers,
    }
  }
}

async function deleteInvitacion(idInvitacion:String) {
  const deleteInvitacion = await db.deleteInvitacion(idInvitacion);
  let bodyMessage = {
    message:''
  };
  if(deleteInvitacion === null){
    bodyMessage.message = 'No existen registros';
    return{
      statusCode: 404,
      body: JSON.stringify(bodyMessage), //"\'message\':\'No existen registros\'",
      headers:headers
    }
  }else{
    bodyMessage.message = 'Registro Eliminado'
    return{
      statusCode: 200,
      body: JSON.stringify(bodyMessage),
      headers:headers
    }
  }
}