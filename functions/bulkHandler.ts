'use strict'

export const handler = async function(event:any) {
  console.log(event);
  return {
    statusCode: 200,
    body: 'ok',
    headers:{
      'content-type':'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  }
}