import type * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import type * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { BaseFunction, type BaseFunctionProps } from '../core/functions';
import { type ServiceCatalogEngineForTerraformOSStackProps } from '../service-catalog-engine-for-terraform-os-stack';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export type StateMachineLambdaFunctionsProps = {
};

export class StateMachineLambdaFunctions extends Construct {
    public functionImage: DockerImageAsset;
    public lambdaFunctions: lambda.Function[];
    private readonly stateMachineFunctions: Record<string, BaseFunctionProps> = {};
    private readonly stateMachineFunctionsRole: cdk.aws_iam.Role;

    constructor (scope: Construct, id: string, props?: ServiceCatalogEngineForTerraformOSStackProps & StateMachineLambdaFunctionsProps & cdk.StackProps) {
        super(scope, id);
        this.functionImage = new DockerImageAsset(this, 'stateMachineFunctionsImageAsset', {
            directory: path.join(__dirname, 'src')
        });

        this.stateMachineFunctionsRole = new Role(this, 'stateMachineFunctionsRole', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com')
        });

        this.stateMachineFunctions['get_state_file_outputs.parse'] = {
            cmd: ['get_state_file_outputs.parse'],
            description: '',
            entrypoint: undefined,
            imageAsset: this.functionImage,
            name: 'get_state_file_outputs.parse',
            role: this.stateMachineFunctionsRole,
            targetVpc: props && props.targetVpc,
            targetVpcSubnets: props && props.targetVpcSubnets
        } as BaseFunctionProps;
        this.stateMachineFunctions['notify_provision_result.notify'] = {
            cmd: ['notify_provision_result.notify'],
            description: '',
            entrypoint: undefined,
            imageAsset: this.functionImage,
            name: 'notify_provision_result.notify',
            role: this.stateMachineFunctionsRole,
            targetVpc: props && props.targetVpc
        } as BaseFunctionProps;
        this.stateMachineFunctions['notify_provision_result.notify'] = {
            cmd: ['notify_provision_result.notify'],
            description: '',
            entrypoint: undefined,
            imageAsset: this.functionImage,
            name: 'notify_provision_result.notify',
            role: this.stateMachineFunctionsRole,
            targetVpc: props && props.targetVpc,
            targetVpcSubnets: props && props.targetVpcSubnets
        } as BaseFunctionProps;
        this.stateMachineFunctions['notify_terminate_result.notify'] = {
            cmd: ['notify_terminate_result.notify'],
            description: '',
            entrypoint: undefined,
            imageAsset: this.functionImage,
            name: 'notify_terminate_result.notify',
            role: this.stateMachineFunctionsRole,
            targetVpc: props && props.targetVpc
        } as BaseFunctionProps;
        this.stateMachineFunctions['notify_update_result.notify'] = {
            cmd: ['notify_update_result.notify'],
            description: '',
            entrypoint: undefined,
            imageAsset: this.functionImage,
            name: 'notify_update_result.notify',
            role: this.stateMachineFunctionsRole,
            targetVpc: props && props.targetVpc
        } as BaseFunctionProps;
        this.stateMachineFunctions['poll_command_invocation.poll'] = {
            cmd: ['poll_command_invocation.notify'],
            description: '',
            entrypoint: undefined,
            imageAsset: this.functionImage,
            name: 'poll_command_invocation.poll',
            role: this.stateMachineFunctionsRole,
            targetVpc: props && props.targetVpc
        } as BaseFunctionProps;
        this.stateMachineFunctions['select_worker_host.select'] = {
            cmd: ['select_worker_host.select'],
            description: '',
            entrypoint: undefined,
            imageAsset: this.functionImage,
            name: 'select_worker_host.select',
            role: this.stateMachineFunctionsRole,
            targetVpc: props && props.targetVpc
        } as BaseFunctionProps;
        this.stateMachineFunctions['send_destroy_command.send'] = {
            cmd: ['send_destroy_command.send'],
            description: '',
            entrypoint: undefined,
            imageAsset: this.functionImage,
            name: 'send_destroy_command.send',
            role: this.stateMachineFunctionsRole,
            targetVpc: props && props.targetVpc
        } as BaseFunctionProps;
        this.stateMachineFunctions['send_apply_command.send'] = {
            cmd: ['send_apply_command.send'],
            description: '',
            entrypoint: undefined,
            imageAsset: this.functionImage,
            name: 'send_apply_command.send',
            role: this.stateMachineFunctionsRole,
            targetVpc: props && props.targetVpc
        } as BaseFunctionProps;
        this.lambdaFunctions = Object.keys(this.stateMachineFunctions).map((key: string) => {
            const props = this.stateMachineFunctions[key];
            const lambdaFunction = BaseFunction.createFunction(scope, props);
            return lambdaFunction;
        });
    }
}
