import type * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import type * as lambda from 'aws-cdk-lib/aws-lambda';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { type BaseFunctionProps, BaseFunction } from '../core/functions';
import { type ServiceCatalogEngineForTerraformOSStackProps } from '../service-catalog-engine-for-terraform-os-stack';

export type ProvisioningOperationsHandlerFunctionProps = {
};

export class ProvisioningOperationsHandlerFunction extends Construct {
    public functionImage: DockerImageAsset;
    public lambdaFunction: lambda.Function;
    public stagingAlias: lambda.Alias;

    constructor (scope: Construct, id: string, props?: ServiceCatalogEngineForTerraformOSStackProps & ProvisioningOperationsHandlerFunctionProps & cdk.StackProps) {
        super(scope, id);
        this.functionImage = new DockerImageAsset(this, 'provisioningOpsHandlerImageAsset', {
            directory: path.join(__dirname, 'src')
        });
        const functionProps = {
            cmd: undefined,
            description: '',
            entrypoint: undefined,
            imageAsset: this.functionImage,
            name: 'provisioning_operations_handler.handle_sqs_records',
            targetVpc: props && props.targetVpc
        } as BaseFunctionProps;
        this.lambdaFunction = BaseFunction.createFunction(scope, functionProps);
    }
}
