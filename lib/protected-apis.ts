import { Duration } from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as iam from "aws-cdk-lib/aws-iam";
import {
  LambdaRestApi,
  EndpointType,
  Cors,
  AuthorizationType,
  IdentitySource,
  LambdaIntegration,
  CognitoUserPoolsAuthorizer,
} from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import { UserPool } from "aws-cdk-lib/aws-cognito";
type ProtectedApiProps = {
  userPoolId: string;
  userPoolClientId: string;
};

export class ProtectedApis extends Construct {
  constructor(scope: Construct, id: string, props: ProtectedApiProps) {
    super(scope, id);

    const snsTopic = new sns.Topic(this, "sns-topic", {
      topicName: "EmailTopic",
      displayName: "Email Topic",
    });

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        MONGODB_URI: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
        TOPIC_ARN: snsTopic.topicArn,
        USER_POOL_ID: props.userPoolId,
        CLIENT_ID: props.userPoolClientId,
      },
      runtime: Runtime.NODEJS_16_X,
    };
    const nodeJsEmailProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        CRYPTO_KEY: `${process.env.CRYPTO_KEY}`,
        CRYPTO_IV: `${process.env.CRYPTO_IV}`,
        EMAIL_USER: `${process.env.EMAIL_USER}`,
        EMAIL_PASS: `${process.env.EMAIL_PASS}`,
        EMAIL_HOST: `${process.env.EMAIL_HOST}`,
        EMAIL_PORT: `${process.env.EMAIL_PORT}`,
      },
      runtime: Runtime.NODEJS_16_X,
    };

    const nodeJsCondominiosProps: NodejsFunctionProps = {
      bundling:{
        externalModules:[
          'aws-sdk'
        ]
      },
      environment:{
        MONGODB_URI: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
      },
      runtime: Runtime.NODEJS_16_X
    }

    const nodeJsUsuarioProps: NodejsFunctionProps = {
      bundling:{
        externalModules:[
          'aws-sdk'
        ]
      },
      environment:{
        MONGODB_URI: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
      },
      runtime: Runtime.NODEJS_16_X
    }

    const invitacionFunction = new NodejsFunction(this, "InvitadosFunction", {
      functionName: "invitadosFunction",
      entry: join(__dirname, "/../functions/invitacionHandler.ts"),
      ...nodeJsFunctionProps,
    });

    const snsTopicPolicy = new iam.PolicyStatement({
      actions: ["sns:publish"],
      resources: ["*"],
    });

    invitacionFunction.addToRolePolicy(snsTopicPolicy);

    const emailSendFunction = new NodejsFunction(this, "EnvioEmail", {
      functionName: "EnvioEmail",
      entry: join(__dirname, "/../functions/emailHandler.ts"),
      ...nodeJsEmailProps,
    });

    snsTopic.addSubscription(new subs.LambdaSubscription(emailSendFunction));

    const condominioFunction = new NodejsFunction(this,'CondominiosFunction',{
      functionName:'CondominiosFunction',
      entry:join(__dirname,'/../functions/condominiosHandler.ts'),
      ...nodeJsCondominiosProps
    });

    const usuarioFunction = new NodejsFunction(this,'UsuarioFunction',{
      functionName:'UsuarioFunction',
      entry:join(__dirname,'/../functions/usuarioHandler.ts'),
      ...nodeJsUsuarioProps
    });

    const bulkFunction = new NodejsFunction(this,'BulkLoad',{
      functionName:'BulkLoad',
      entry: join(__dirname,'/../functions/bulkHandler.ts'),
      ...nodeJsFunctionProps
    });

    const apiGw = new LambdaRestApi(this, "InvitacionApiGw", {
      restApiName: "Invitacion Service",
      handler: invitacionFunction,
      proxy: false,
      deployOptions: {
        stageName: "dev",
      },
    });

    const apiGwCondiminio = new LambdaRestApi(this,'CondominiosApiGw',{
      restApiName: 'Condominios Service',
      handler: condominioFunction,
      proxy: false,
      deployOptions:{
        stageName:'dev'
      }
    });

    const apiGwBulk = new LambdaRestApi(this,'BulkApiG',{
      restApiName:'Bulk Service',
      handler: bulkFunction,
      proxy: false,
      deployOptions:{
        stageName:'dev'
      }
    });

    const apiGwUsuario = new LambdaRestApi(this,'UsuarioApiGw',{
      restApiName: 'Usuario Service',
      handler: usuarioFunction,
      proxy: false,
      deployOptions:{
        stageName:'dev'
      }
    });

    const userPool = UserPool.fromUserPoolId(
      this,
      "UserPool",
      props.userPoolId
    );

    const authCognito = new CognitoUserPoolsAuthorizer(
      this,
      "invitacionesAuthorizer",
      {
        cognitoUserPools: [userPool],
      }
    );

    const authCognitoCondominio = new CognitoUserPoolsAuthorizer(this,
      'CondominioAuthorizer',
      {
        cognitoUserPools:[userPool]
      }
    );

    const authCognitoUsuario = new CognitoUserPoolsAuthorizer(this,
      'UsuarioAuthorizer',
      {
        cognitoUserPools:[userPool]
      }
    );

    const authCognitoBulk = new CognitoUserPoolsAuthorizer(this,
      'bulkAuthorizer',
      {
        cognitoUserPools:[userPool]
      }
    );

    const invitacion = apiGw.root.addResource("invitacion");
    invitacion.addCorsPreflight({
      allowOrigins:['*'],
      allowMethods:['GET','POST']
    });
    invitacion.addMethod("GET", new LambdaIntegration(invitacionFunction), {
      authorizer: authCognito,
      authorizationType: AuthorizationType.COGNITO,
    });
    invitacion.addMethod("POST", new LambdaIntegration(invitacionFunction), {
      authorizer: authCognito,
      authorizationType: AuthorizationType.COGNITO,
    });
    const singleInvitacion = invitacion.addResource("{idInvitacion}");
    singleInvitacion.addCorsPreflight({
      allowOrigins:['*'],
      allowMethods:['GET','DELETE','PUT']
    });
    singleInvitacion.addMethod("GET",new LambdaIntegration(invitacionFunction),
      {
        authorizer: authCognito,
        authorizationType: AuthorizationType.COGNITO,
      }
    );
    singleInvitacion.addMethod("PUT",new LambdaIntegration(invitacionFunction),
      {
        authorizer: authCognito,
        authorizationType: AuthorizationType.COGNITO,
      }
    );
    singleInvitacion.addMethod("DELETE",new LambdaIntegration(invitacionFunction),
      {
        authorizer: authCognito,
        authorizationType: AuthorizationType.COGNITO,
      }
    );

    const condominio = apiGwCondiminio.root.addResource("condominio");
    condominio.addCorsPreflight({
      allowOrigins:['*'],
      allowMethods:['GET','POST']
    });
    condominio.addMethod('GET', new LambdaIntegration(condominioFunction),
    {
      authorizer: authCognitoCondominio,
      authorizationType: AuthorizationType.COGNITO
    });
    condominio.addMethod('POST', new LambdaIntegration(condominioFunction),
    {
      authorizer: authCognitoCondominio,
      authorizationType: AuthorizationType.COGNITO
    });
    const singleCondominio = condominio.addResource("{idCondominio}");
    singleCondominio.addCorsPreflight({
      allowOrigins:['*'],
      allowMethods:['GET','DELETE','PUT']
    });
    singleCondominio.addMethod('GET', new LambdaIntegration(condominioFunction),
    {
      authorizer: authCognitoCondominio,
      authorizationType: AuthorizationType.COGNITO
    });
    singleCondominio.addMethod('PUT',new LambdaIntegration(condominioFunction),
    {
      authorizer: authCognitoCondominio,
      authorizationType: AuthorizationType.COGNITO
    });
    singleCondominio.addMethod('DELETE', new LambdaIntegration(condominioFunction),{
      authorizer: authCognitoCondominio,
      authorizationType: AuthorizationType.COGNITO
    });

    const usuario = apiGwUsuario.root.addResource('usuario');
    usuario.addCorsPreflight({
      allowOrigins:['*'],
      allowMethods:['GET','POST']
    });
    usuario.addMethod('GET', new LambdaIntegration(usuarioFunction),
    {
      authorizer: authCognitoUsuario,
      authorizationType: AuthorizationType.COGNITO
    });
    usuario.addMethod('POST', new LambdaIntegration(usuarioFunction),
    {
      authorizer: authCognitoUsuario,
      authorizationType: AuthorizationType.COGNITO
    }
    );
    const singleUsuario = usuario.addResource('{idUsuario}');
    singleUsuario.addCorsPreflight({
      allowOrigins:['*'],
      allowMethods:['GET','PUT','DELETE']
    });
    singleUsuario.addMethod('GET',new LambdaIntegration(usuarioFunction),
    {
      authorizer: authCognitoUsuario,
      authorizationType: AuthorizationType.COGNITO
    }
    );
    singleUsuario.addMethod('PUT', new LambdaIntegration(usuarioFunction),
    {
      authorizer: authCognitoUsuario,
      authorizationType: AuthorizationType.COGNITO
    }
    );
    singleUsuario.addMethod('DELETE', new LambdaIntegration(usuarioFunction),
    {
      authorizer: authCognitoUsuario,
      authorizationType: AuthorizationType.COGNITO
    }
    );

    const bulk = apiGwBulk.root.addResource('bulk');
    bulk.addCorsPreflight({
      allowOrigins:['*'],
      allowMethods:['POST']
    });
    bulk.addMethod('POST',new LambdaIntegration(bulkFunction),
    {
      authorizer: authCognitoBulk,
      authorizationType: AuthorizationType.COGNITO
    });
  }
}
