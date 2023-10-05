import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { type Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { type DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { type IVpc, ISubnet, SubnetSelection } from 'aws-cdk-lib/aws-ec2';
import { type IRole } from 'aws-cdk-lib/aws-iam';

export type BaseFunctionProps = {
    cmd: [string] | undefined
    description: string | null | undefined
    entrypoint: [string] | undefined
    imageAsset: DockerImageAsset
    name: string
    role: IRole | undefined
    targetVpc: IVpc | undefined
};
export class BaseFunction {
    public static createFunction (scope: Construct, props: BaseFunctionProps): lambda.Function {
        const imageCode = new lambda.EcrImageCode(props.imageAsset.repository, {
            tagOrDigest: props.imageAsset.imageTag,
            cmd: props.cmd,
            entrypoint: props.entrypoint
        });
        const lambdaFunction = new lambda.Function(scope, props.name, {
            code: imageCode,
            handler: lambda.Handler.FROM_IMAGE,
            role: props.role,
            runtime: lambda.Runtime.FROM_IMAGE,
            vpc: props.targetVpc
        });
        return lambdaFunction;
    }
}
