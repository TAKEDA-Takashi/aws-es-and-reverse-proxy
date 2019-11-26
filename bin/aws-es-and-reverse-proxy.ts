#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsEsAndReverseProxyStack } from '../lib/aws-es-and-reverse-proxy-stack';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
};

const app = new cdk.App();
new AwsEsAndReverseProxyStack(app, 'AwsEsAndReverseProxyStack', {
  env,
});
