import * as cdk from 'aws-cdk-lib';
import { AuthApi } from './auth-api';
import { ProtectedApis } from './protected-apis';
import { CognitoUserPool } from './user-pool';
import { Construct } from 'constructs';


export class QpassProBackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const userPool = new CognitoUserPool(this, 'UserPool');

		const { userPoolId, userPoolClientId } = userPool;

		new AuthApi(this, 'AuthServiceApi', {
			userPoolId,
			userPoolClientId,
		});

		new ProtectedApis(this, 'ProtectedApis', {
			userPoolId,
			userPoolClientId,
		});
    
  }
}
