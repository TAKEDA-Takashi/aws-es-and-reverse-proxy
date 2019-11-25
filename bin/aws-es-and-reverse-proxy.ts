#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { AwsEsAndReverseProxyStack } from '../lib/aws-es-and-reverse-proxy-stack';

const app = new cdk.App();
new AwsEsAndReverseProxyStack(app, 'AwsEsAndReverseProxyStack');
