const database = require("../service/usuarioDB");
const db = database(process.env.MONGODB_URI);

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
        return findById(event.pathParameters.idUsuario);
      }else{
        return getAllUsuarios();
      }
    case 'PATCH':
      return validaUsuario(event);
    case 'POST':
      return addUsuario(event);
    case 'PUT':
      return updateUsuario(event);
    case 'DELETE':
      return deleteUsuario(event.pathParameters.idUsuario);
    default:
      throw new Error('Unsupported route '+method);
  }
}

async function findById(idUsuario:String) {
  const getById = await db.getById(idUsuario);
  if(getById === null){
    var errMessage = {
      message:'No existe el usuarios para ese ID'
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

async function getAllUsuarios() {
  const getAllUsuarios = await db.getAllUsuarios();
  if(getAllUsuarios === null){
    var errMessage = {
      message:'No existe registros'
    };
    return{
      statusCode: 404,
      body: JSON.stringify(errMessage),
      headers:headers
    }  
  }
  return{
    statusCode: 200,
    body: JSON.stringify(getAllUsuarios),
    headers:headers
  }
}

async function addUsuario(event:any) {
  const body = JSON.parse(event.body);
  const savedUsuarios =  await db.create(body);
  return{
    statusCode: 200,
    body: JSON.stringify(savedUsuarios),
    headers:headers
  }
}

async function updateUsuario(event:any) {
  const body = JSON.parse(event.body);
  const idUsuario = event.pathParameters.idUsuario;
  const updateUsuario = await db.updateUsuario(idUsuario,body);
  if(updateUsuario===null){
    let bodyMessage = {
      message : 'No existen registros para actualizar'
    };
    return{
      statusCode: 404,
      body: JSON.stringify(bodyMessage),
      headers:headers
    }
  }else{
    return{
      statusCode:200,
      body: JSON.stringify(updateUsuario),
      headers:headers,
    }
  }
}

async function deleteUsuario(idUsuario:String) {
  const deleteUsuario = await db.deleteUsuario(idUsuario);
  if(deleteUsuario===null){
    let bodyMessage = {
      message : 'No existen registros para borrar'
    };
    return{
      statusCode: 404,
      body: JSON.stringify(bodyMessage),
      headers:headers
    }
  }else{
    return{
      statusCode:200,
      body: JSON.stringify(deleteUsuario),
      headers:headers,
    }
  }
}

async function validaUsuario(event:any) {
  let parametroUsuario = event.pathParameters.idUsuario;
  const usuario = await db.getByParameter(parametroUsuario);
  if(usuario === undefined || usuario === null){
    return{
      statusCode: 404,
      body: JSON.stringify({message : 'No existen registros para borrar'}),
      headers:headers
    }
  }
  return{
    statusCode:200,
    body: JSON.stringify(usuario),
    headers:headers,
  }

}