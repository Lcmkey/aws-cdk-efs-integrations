import { Construct, Stack, StackProps, RemovalPolicy } from "@aws-cdk/core";
import { InstanceClass, InstanceSize, InstanceType, Port, SecurityGroup, Vpc } from "@aws-cdk/aws-ec2";
import { Cluster } from "@aws-cdk/aws-ecs";
import { FileSystem } from "@aws-cdk/aws-efs";
import {
  ApplicationLoadBalancedFargateService,
  ApplicationLoadBalancedEc2Service,
} from "@aws-cdk/aws-ecs-patterns";

import { EfsAccessPoints } from './efs-integrations/efs-access-points';
import { EfsFileSystemPolicy } from './efs-integrations/efs-filesystem-policy';
import { EcsEfsIntegrationService, ServiceType } from './efs-integrations/ecs-service';

export interface AmazonEfsIntegrationsStackProps extends StackProps {
  /**
   * Whether or not to create the ECS on EC2 service to show the EFS integration
   */
  readonly createEcsOnEc2Service: boolean;
  /**
   * Whether or not to create the ECS on EC2 service to show the EFS integration
   */
  readonly createEcsOnFargateService: boolean;
  /**
   * Whether or not to create the EFS filesystem to show the EFS integration
   */
  readonly createEfsFilesystem: boolean;

  /**
   * Whether or not to create the EFS access points to show the EFS integration
   */
  readonly createEfsAccessPoints: boolean;

  readonly prefix: string;
  readonly stage: string;
}

export class AwsCdkEfsIntegrationsStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: AmazonEfsIntegrationsStackProps,
  ) {
    if (props.createEfsAccessPoints && !props.createEfsFilesystem) {
      throw new Error(
        "`createEfsFileSystem` must be set to true if `createEfsAccessPoints` is true",
      );
    }

    super(scope, id, props);

    /**
     * Get var from props
     */
    const {
      prefix,
      stage,
      createEfsFilesystem,
      createEfsAccessPoints,
      createEcsOnEc2Service,
      createEcsOnFargateService
    } = props;

    /**
     * Vpc Definition
     */
    const vpc = new Vpc(this, `${prefix}-${stage}-Vpc`, { maxAzs: 2 });

    /**
     * Define Security Group
     */
    const efsSecurityGroup = new SecurityGroup(this, `${prefix}-${stage}-EFS-SG`, {
      securityGroupName: `${prefix}-${stage}-EFS-SG`,
      vpc,
    });

    let fileSystem;
    let efsAccessPoints;

    /**
     * Create Efs
     */
    if (createEfsFilesystem) {
      /* tslint:disable-next-line:no-unused-expression */
      fileSystem = new FileSystem(this, `${prefix}-${stage}-EFS`, {
        fileSystemName: `${prefix}-${stage}-EFS`,
        encrypted: true,
        securityGroup: efsSecurityGroup,
        vpc,
        removalPolicy: RemovalPolicy.DESTROY // not recommand to enable in production env
      });

      /**
       * Create Efs Access Points
       */
      if (createEfsAccessPoints) {
        efsAccessPoints = new EfsAccessPoints(
          fileSystem,
          createEcsOnEc2Service,
          createEcsOnFargateService,
        );
      }
    }

    if (createEcsOnEc2Service || createEcsOnFargateService) {
      /**
       * Cluster Definition
       */
      const cluster = new Cluster(this, `${prefix}-${stage}-Custer`, {
        clusterName: `${prefix}-${stage}-Custer`,
        vpc
      });

      let ecsOnEc2Service;
      let ecsOnFargateService;

      /**
       * Ecs - Ec2 Service
       */
      if (createEcsOnEc2Service) {
        cluster.addCapacity(`${prefix}-${stage}-DefaultAutoScalingGroup`, {
          instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MEDIUM),
          maxCapacity: 2,
          minCapacity: 2,
        });

        ecsOnEc2Service = EcsEfsIntegrationService.create(
          prefix,
          stage,
          ServiceType.EC2,
          cluster,
          fileSystem,
          efsAccessPoints
        ) as ApplicationLoadBalancedEc2Service;

        efsSecurityGroup.connections.allowFrom(ecsOnEc2Service.service, Port.tcp(2049));
      }

      /**
       * Ecs - Fargate Service
       */
      if (createEcsOnFargateService) {
        ecsOnFargateService = EcsEfsIntegrationService.create(
          prefix,
          stage,
          ServiceType.FARGATE,
          cluster,
          fileSystem,
          efsAccessPoints
        ) as ApplicationLoadBalancedFargateService;

        efsSecurityGroup.connections.allowFrom(ecsOnFargateService.service, Port.tcp(2049));
      }

      if (createEfsAccessPoints && fileSystem && efsAccessPoints) {
        // tslint:disable-next-line: no-unused-expression
        new EfsFileSystemPolicy(
          fileSystem,
          efsAccessPoints,
          ecsOnEc2Service,
          ecsOnFargateService,
        );
      }
    }
  }
}
