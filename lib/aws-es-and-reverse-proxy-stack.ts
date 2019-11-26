import * as path from 'path';

import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';

import { CfnServiceLinkedRole } from '@aws-cdk/aws-iam';
import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import { ApplicationLoadBalancedFargateService } from '@aws-cdk/aws-ecs-patterns';

export class AwsEsAndReverseProxyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new CfnServiceLinkedRole(this, 'EsServiceLinkedRole', {
      awsServiceName: 'es.amazonaws.com',
    });

    const vpc = new ec2.Vpc(this, 'Vpc', {
      cidr: '10.0.0.0/16',
      maxAzs: 2,
      natGateways: 1,
    });

    const essg = new ec2.SecurityGroup(this, 'EsSecurityGroup', {
      vpc,
    });

    const domainName = 'es-test-domain';
    const domain = new CfnDomain(this, 'Domain', {
      domainName,
      elasticsearchVersion: '7.1',
      elasticsearchClusterConfig: {
        instanceCount: 1,
        instanceType: 't2.small.elasticsearch',
        zoneAwarenessEnabled: false,
      },
      ebsOptions: {
        ebsEnabled: true,
        volumeType: 'gp2',
        volumeSize: 10,
      },
      vpcOptions: {
        securityGroupIds: [essg.securityGroupId],
        subnetIds: [vpc.privateSubnets[0].subnetId],
      },
      accessPolicies: {
        'Version': '2012-10-17',
        'Statement': [
          {
            'Effect': 'Allow',
            'Principal': {
              'AWS': '*',
            },
            'Action': 'es:*',
            'Resource': `arn:aws:es:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:domain/${domainName}/*`,
          },
        ],
      },
    });

    const nginxAsset = new DockerImageAsset(this, 'NginxAsset', {
      directory: path.join(__dirname, '../nginx'),
    });

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
    });

    const nginxService = new ApplicationLoadBalancedFargateService(this, 'NginxService', {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(nginxAsset.repository),
        environment: {
          SCHEMA: 'https',
          ENDPOINT: domain.attrDomainEndpoint,
        },
      },
      memoryLimitMiB: 512,
      cpu: 256,
    });

    nginxService.service.connections.securityGroups.forEach((sg, i) => {
      new ec2.CfnSecurityGroupIngress(this, `EsSecurityGroupIngressNginx-${i}`, {
        groupId: essg.securityGroupId,
        sourceSecurityGroupId: sg.securityGroupId,
        ipProtocol: 'tcp',
        fromPort: 443,
        toPort: 443,
      });
    });
  }
}
