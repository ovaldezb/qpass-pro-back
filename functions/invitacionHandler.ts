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
  const savedInvitacion = await db.create(body);
  
  return{
    statusCode: 200,
    body: JSON.stringify(savedInvitacion),
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
      body: JSON.stringify(errMessage)
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
      body: "\'message\':\'No existen registros\'",
    }
  }else{
    return{
      statusCode: 200,
      body: JSON.stringify(getAllInvitaciones),
    }
  }
}

async function updateInvitacion(event:any) {
  const body = JSON.parse(event.body);
  const idInvitacion = event.pathParameters.idInvitacion;
  console.log('Actualizando '+idInvitacion);
  const updateInvitacion = await db.updateInvitacion(idInvitacion,body);
  if(updateInvitacion===null){
    let bodyMessage = {
      message : 'No existen registros'
    };
    return{
      statusCode: 404,
      body: JSON.stringify(bodyMessage),
    }
  }else{
    return{
      statusCode:200,
      body: JSON.stringify(updateInvitacion)
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
      body: JSON.stringify(bodyMessage) //"\'message\':\'No existen registros\'",
    }
  }else{
    bodyMessage.message = 'Registro Eliminado'
    return{
      statusCode: 200,
      body: JSON.stringify(bodyMessage),
    }
  }
}