import * as cdk from "aws-cdk-lib";
import { ProtectedApis } from "./protected-apis";
import { Construct } from "constructs";

export class QpassProBackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPoolId = process.env.COGNITO_USER_POOL_ID as string;
    const userPoolClientId = process.env.COGNITO_USER_POOL_CLIENT_ID as string;

    new ProtectedApis(this, "ProtectedApis", {
      userPoolId,
      userPoolClientId,
    });
  }
}
