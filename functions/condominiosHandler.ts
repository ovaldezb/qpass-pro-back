const database = require("../service/condominioDB");
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
        return findById(event.pathParameters.idCondominio);
      }else{
        return getAllCondominios();
      }
    case 'POST':
      return addCondominio(event);
    case 'PUT':
      return updateCondominio(event);
    case 'DELETE':
      return deleteCondominio(event.pathParameters.idCondominio);
    default:
      throw new Error('Unsupported route '+method);
  }
}

async function findById(idCondominio:String) {
  const getById = await db.getById(idCondominio);
  if(getById === null){
    var errMessage = {
      message:'No existe el condominio para ese ID'
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

async function getAllCondominios() {
  const getAllCondominios = await db.getAllCondominios();
  if(getAllCondominios === null){
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
    body: JSON.stringify(getAllCondominios),
    headers:headers
  }
}

async function addCondominio(event:any) {
  const body = JSON.parse(event.body);
  const savedCondominio =  await db.create(body);
  return{
    statusCode: 200,
    body: JSON.stringify(savedCondominio),
    headers:headers
  }
}

async function updateCondominio(event:any) {
  const body = JSON.parse(event.body);
  const idCondominio = event.pathParameters.idCondominio;
  const updateCondominio = await db.updateCondominio(idCondominio,body);
  if(updateCondominio===null){
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
      body: JSON.stringify(updateCondominio),
      headers:headers,
    }
  }
}

async function deleteCondominio(idCondominio:String) {
  const deleteCondominio = await db.deleteCondominio(idCondominio);
  if(deleteCondominio===null){
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
      body: JSON.stringify(deleteCondominio),
      headers:headers,
    }
  }
}