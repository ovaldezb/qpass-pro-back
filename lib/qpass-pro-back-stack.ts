import * as cdk from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class QpassProBackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const nodeJsFunctionProps : NodejsFunctionProps = {
      bundling:{
        externalModules :[
          'aws-sdk'
        ]
      },
      environment:{
        MONGODB_URI: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`
      },
      runtime: Runtime.NODEJS_16_X
    }
    const qpasProFunction = new NodejsFunction(this,'InvitadosFunction',{
      functionName:'invitadosFunction',
      entry: join(__dirname,'/../functions/invitacionHandler.ts'),
      ...nodeJsFunctionProps
    });

    const apiGw = new LambdaRestApi(this,'InvitacionApiGw',{
      restApiName:'Invitacion Service',
      handler: qpasProFunction,
      proxy: false,
      deployOptions:{
        stageName: 'dev'
      }
    });

    const invitacion = apiGw.root.addResource('invitacion');
    invitacion.addMethod('GET');
    invitacion.addMethod('POST');
    const singleInvitacion = invitacion.addResource('{idInvitacion}');
    singleInvitacion.addMethod('GET');
    singleInvitacion.addMethod('PUT');
    singleInvitacion.addMethod('DELETE');
    
    /*const templatedSecret = new cdk.aws_secretsmanager.Secret(this, 'ReadSecret', {
      secretName:'QPASSPRO/MONGODB/CREDENTIALS',
      secretObjectValue:{
        user: SecretValue.unsafePlainText('*****'),
        password: SecretValue.unsafePlainText('******'),
        host:SecretValue.unsafePlainText('****'),
        database:SecretValue.unsafePlainText('****')
      }
    });
    templatedSecret.grantRead(qpasProFunction);*/
    
  }
}
