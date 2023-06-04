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
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
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

    const apiGw = new LambdaRestApi(this, "InvitacionApiGw", {
      restApiName: "Invitacion Service",
      handler: invitacionFunction,
      proxy: false,
      deployOptions: {
        stageName: "dev",
      },
    });

    const apiGwEmail = new LambdaRestApi(this, "EmailApiG", {
      restApiName: "EnvioEmail",
      handler: emailSendFunction,
      proxy: false,
      deployOptions: {
        stageName: "dev",
      },
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

    const email = apiGwEmail.root.addResource("email");
    email.addMethod("POST");

    const invitacion = apiGw.root.addResource("invitacion");
    invitacion.addMethod("GET", new LambdaIntegration(invitacionFunction), {
      authorizer: authCognito,
      authorizationType: AuthorizationType.COGNITO,
    });
    invitacion.addMethod("POST", new LambdaIntegration(invitacionFunction), {
      authorizer: authCognito,
      authorizationType: AuthorizationType.COGNITO,
    });
    const singleInvitacion = invitacion.addResource("{idInvitacion}");
    singleInvitacion.addMethod(
      "GET",
      new LambdaIntegration(invitacionFunction),
      {
        authorizer: authCognito,
        authorizationType: AuthorizationType.COGNITO,
      }
    );
    singleInvitacion.addMethod(
      "PUT",
      new LambdaIntegration(invitacionFunction),
      {
        authorizer: authCognito,
        authorizationType: AuthorizationType.COGNITO,
      }
    );
    singleInvitacion.addMethod(
      "DELETE",
      new LambdaIntegration(invitacionFunction),
      {
        authorizer: authCognito,
        authorizationType: AuthorizationType.COGNITO,
      }
    );
  }
}
