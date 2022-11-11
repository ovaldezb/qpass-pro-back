"use strict"
const database = require("../service/database");
const db = database(process.env.MONGODB_URI);

export const handler = async function(event:any) {
  
  const method = event.requestContext.httpMethod;
  switch(method){
    case 'GET' :
      if(event.pathParameters != null){
        return findById(event.pathParameters.idInvitacion);
      }else{
        return getAllInvitaciones();
      }
      break;
    case 'POST':
      return addInvitacion(event);
      break;
    default:
      throw new Error('Unsupported route '+method);
  }
  
}

async function addInvitacion(event:any) {
  const body = JSON.parse(event.body);
  const savedInvitacion = await db.create(body);
  
  return{
    statusCode: 200,
    body: JSON.stringify(savedInvitacion),
  }
}

async function findById(idInvitacion:String) {
  const getById = await db.getById(idInvitacion);
  if(getById === null){
    return{
      statusCode: 404,
      body: 'No existe la invitacion para ese ID:'+idInvitacion,
    }  
  }
  return{
    statusCode: 200,
    body: JSON.stringify(getById),
  }
}

async function getAllInvitaciones() {
  const getAllInvitaciones = await db.getAllInvitaciones();
  if(getAllInvitaciones === null){
    return{
      statusCode: 404,
      body: 'No existen registros',
    }
  }else{
    return{
      statusCode: 200,
      body: JSON.stringify(getAllInvitaciones),
    }
  }
}