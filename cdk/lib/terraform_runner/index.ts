import { Construct } from 'constructs';
import { StackProps } from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import path = require('path');
import { IVpc } from 'aws-cdk-lib/aws-ec2';

export type TerraformRunnersClusterProps = {
    supportedTerraformVersions: string[],
    targetVpc: IVpc,
}

export class TerraformRunnersCluster extends Construct {
    private terraformRunnerCluster: ecs.Cluster;
    private terraformRunnerImages: {[key: string]: DockerImageAsset } = {};
    private terraformRunnerTask: {[key: string]: ecs.TaskDefinition } = {};
    private terraformRunnerServices:  {[key: string]: ecs.FargateService } = {};
    constructor(scope: Construct, id: string, props : StackProps & TerraformRunnersClusterProps) {
        super(scope, id);
        
        this.terraformRunnerCluster = new ecs.Cluster(this, "terraformRunnersEcsCluster", {
            enableFargateCapacityProviders: true,
            vpc: props.targetVpc
        });
        for(let idx = 0; idx < props.supportedTerraformVersions.length; idx++) {
            const element = props.supportedTerraformVersions[idx];
            const cdkSageTFVersionName = element.replace(/\./gi, "");
            this.terraformRunnerImages[element] = new DockerImageAsset(this, `tfr_v${cdkSageTFVersionName}_imageAsset`, {
                directory: path.join(__dirname, "src"),
                buildArgs: {
                    "terraform_version": element
                }
            });
            this.terraformRunnerTask[element] = new ecs.FargateTaskDefinition(this, `tfr_v${cdkSageTFVersionName}_taskdefinition`, {
                cpu: 1024,
                memoryLimitMiB: 2048
            });
            this.terraformRunnerTask[element].addContainer(`tfr_v${cdkSageTFVersionName}_taskdefinition_container`, {
                image: ecs.ContainerImage.fromEcrRepository(this.terraformRunnerImages[element].repository),
            });
            this.terraformRunnerServices[element] = new ecs.FargateService(this, `tfr_v${cdkSageTFVersionName}_service`, {
                assignPublicIp: false,
                cluster: this.terraformRunnerCluster,
                desiredCount: 0,
                enableExecuteCommand: true,
                minHealthyPercent: 0,
                maxHealthyPercent: 100,
                platformVersion: ecs.FargatePlatformVersion.LATEST,
                capacityProviderStrategies: [
                    {
                        capacityProvider: "FARGATE",
                        weight: 1
                    }
                ],
                taskDefinition: this.terraformRunnerTask[element]
            });
        }
    }
}