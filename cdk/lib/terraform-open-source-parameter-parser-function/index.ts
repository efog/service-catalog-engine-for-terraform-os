import type * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import type * as lambda from 'aws-cdk-lib/aws-lambda';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { type BaseFunctionProps, BaseFunction } from '../core/functions';
import { type ServiceCatalogEngineForTerraformOSStackProps } from '../service-catalog-engine-for-terraform-os-stack';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TerraformOpenSourceParameterParserFunctionProps {
};

export class TerraformOpenSourceParameterParserFunction extends Construct {
    public functionImage: DockerImageAsset;
    public lambdaFunction: lambda.Function;
    public stagingAlias: lambda.Alias;

    constructor (scope: Construct, id: string, props?: ServiceCatalogEngineForTerraformOSStackProps & TerraformOpenSourceParameterParserFunctionProps & cdk.StackProps) {
        super(scope, id);
        this.functionImage = new DockerImageAsset(this, 'paramsParserImageAsset', {
            directory: path.join(__dirname, 'src')
        });
        const functionProps = {
            cmd: undefined,
            description: '',
            entrypoint: undefined,
            imageAsset: this.functionImage,
            name: 'terraformopensourceparameterparser.main',
            targetVpc: props && props.targetVpc,
            targetVpcSubnets: props && props.targetVpcSubnets
        } as BaseFunctionProps;
        this.lambdaFunction = BaseFunction.createFunction(scope, functionProps);
    }
}
