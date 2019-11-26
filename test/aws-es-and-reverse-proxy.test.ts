import * as cdk from '@aws-cdk/core';
import { SynthUtils } from '@aws-cdk/assert';
import { AwsEsAndReverseProxyStack } from '../lib/aws-es-and-reverse-proxy-stack';

test('Stack Snapshot test', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new AwsEsAndReverseProxyStack(app, 'MyTestStack', {
    env: {
      account: '123456789012',
      region: 'ap-northeast-1',
    },
  });
  // THEN
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});