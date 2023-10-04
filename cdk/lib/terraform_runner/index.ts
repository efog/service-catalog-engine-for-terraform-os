import { Construct } from 'constructs';
import { type StackProps } from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import path = require('path');
import { type IVpc } from 'aws-cdk-lib/aws-ec2';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { type IBucket } from 'aws-cdk-lib/aws-s3';

export interface TerraformRunnersClusterProps {
    supportedTerraformVersions: string[]
    targetVpc: IVpc
};

export class TerraformRunnersCluster extends Construct {
    private readonly terraformRunnerCluster: ecs.Cluster;
    private readonly terraformRunnerImages: Record<string, DockerImageAsset> = {};
    private readonly terraformRunnerTask: Record<string, ecs.TaskDefinition> = {};
    private readonly terraformRunnerServices: Record<string, ecs.FargateService> = {};
    public readonly terraformRunnerExecutionRole: Role;
    public readonly terraformRunnerTaskRole: Role;

    constructor (scope: Construct, id: string, props: StackProps & TerraformRunnersClusterProps) {
        super(scope, id);

        const executionRole = new Role(this, 'terraform_runner_executionRole', {
            assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
            description: 'Terraform runner execution role',
            path: 'TerraformEngine',
            roleName: 'terraform_runner_executionrole'
        });
        this.terraformRunnerExecutionRole = executionRole;
        const taskRole = new Role(this, 'terraform_runner_taskRole', {
            assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
            description: 'Terraform runner task role',
            path: 'TerraformEngine',
            roleName: 'terraform_runner_taskrole'
        });
        this.terraformRunnerTaskRole = taskRole;
        this.terraformRunnerCluster = new ecs.Cluster(this, 'terraformRunnersEcsCluster', {
            enableFargateCapacityProviders: true,
            vpc: props.targetVpc
        });
        for (let idx = 0; idx < props.supportedTerraformVersions.length; idx++) {
            const element = props.supportedTerraformVersions[idx];
            const cdkSafeTFVersionName = element.replace(/\./gi, '');
            this.terraformRunnerImages[element] = new DockerImageAsset(this, `tfr_v${cdkSafeTFVersionName}_imageAsset`, {
                directory: path.join(__dirname, 'src'),
                buildArgs: {
                    terraform_version: element
                }
            });
            this.terraformRunnerTask[element] = new ecs.FargateTaskDefinition(this, `tfr_v${cdkSafeTFVersionName}_taskdefinition`, {
                cpu: 1024,
                memoryLimitMiB: 2048,
                executionRole,
                taskRole
            });
            this.terraformRunnerTask[element].addContainer(`tfr_v${cdkSafeTFVersionName}_taskdefinition_container`, {
                image: ecs.ContainerImage.fromEcrRepository(this.terraformRunnerImages[element].repository)
            });
            this.terraformRunnerServices[element] = new ecs.FargateService(this, `tfr_v${cdkSafeTFVersionName}_service`, {
                assignPublicIp: false,
                cluster: this.terraformRunnerCluster,
                desiredCount: 0,
                enableExecuteCommand: true,
                minHealthyPercent: 0,
                maxHealthyPercent: 100,
                platformVersion: ecs.FargatePlatformVersion.LATEST,
                capacityProviderStrategies: [
                    {
                        capacityProvider: 'FARGATE',
                        weight: 1
                    }
                ],
                taskDefinition: this.terraformRunnerTask[element]
            });
        }
    }
}
