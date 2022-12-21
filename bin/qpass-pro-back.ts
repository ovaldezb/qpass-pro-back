#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { QpassProBackStack } from '../lib/qpass-pro-back-stack';

const app = new cdk.App();
new QpassProBackStack(app, 'QpassProBackStack', {});