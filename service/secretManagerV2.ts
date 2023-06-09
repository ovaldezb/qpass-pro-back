'use strict'

import {SecretsManagerClient, GetSecretValueCommand} from "@aws-sdk/client-secrets-manager";

class SecretsManagerV2{
  static async getSecret(){
    const secret_name = "QPASSPRO/MONGODB/CREDENTIALS";
    const client = new SecretsManagerClient({
      region: "us-east-1",
    });
    let response;
    try {
      response = await client.send(
        new GetSecretValueCommand({
          SecretId: secret_name,
          VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        })
      );
      //console.log('Response',response);
    } catch (error) {
      // For a list of exceptions thrown, see
      // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
      throw error;
    }
    return response.SecretString;
  }
}

module.exports = SecretsManagerV2;
