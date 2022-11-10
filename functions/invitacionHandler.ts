"use strict"
const database = require("../service/database");
//const uri = 'mongodb+srv://admin:Jafra2018!@hheisego.zc7y9qf.mongodb.net/?retryWrites=true&w=majority';
const db = database(process.env.MONGODB_URI);
/*const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = process.env.MONGODB_URI;
let cachedDb:any = null;

async function connectToDatabase () {
  console.log('=> connect to database');
  if (cachedDb) {
    console.log('=> using cached database instance');
    return Promise.resolve(cachedDb);
  }
  // Connect to our MongoDB database hosted on MongoDB Atlas
  const client = await MongoClient.connect(MONGODB_URI);
  // Specify which database we want to use
  const db = await client.db("QPass-Pro");
  cachedDb = db;
  return db;
}*/



export const handler = async function(event:any) {
  
  const method = event.requestContext.httpMethod;
  switch(method){
    case 'GET' :
      if(event.pathParameters != null){
        return findById(event.pathParameters.idInvitacion);
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