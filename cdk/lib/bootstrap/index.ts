import * as cdk from 'aws-cdk-lib';
import { StackProps } from 'aws-cdk-lib';
import { Role, ServicePrincipal, PolicyDocument, PolicyStatement, Effect, PrincipalBase, ArnPrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';

export type ServiceCatalogEngineForTerraformBootstrapProps = {
    terraformEngineAccount: string | null,
    terraformEnginePartition: string | null
}

export class ServiceCatalogEngineForTerraformBootstrap extends Construct {
    public readonly serviceCatalogLaunchRole: Role;
    constructor (scope: Construct, id: string, props: StackProps & ServiceCatalogEngineForTerraformBootstrapProps) {
        super(scope, id);
        const accountId = cdk.Stack.of(this).account;
        const region = cdk.Stack.of(this).region;
        this.serviceCatalogLaunchRole = new Role(this, 'serviceCatalogLaunchRole', {
            assumedBy: new ServicePrincipal('servicecatalog.amazonaws.com'),
            path: 'TerraformEngine',
        });
        this.serviceCatalogLaunchRole.assumeRolePolicy?.addStatements(
            new PolicyStatement({
                actions: ["sts:AssumeRole"],
                effect: Effect.ALLOW,
                conditions: [{
                    "StringLike": [
                        `arn:${props.terraformEnginePartition || 'aws'}:iam::${props.terraformEngineAccount || accountId}:role/TerraformEngine/TerraformExecutionRole*`,
                        `arn:${props.terraformEnginePartition || 'aws'}:iam::${props.terraformEngineAccount || accountId}:role/TerraformEngine/ServiceCatalogTerraformOSParameterParserRole*`]
                }],
                principals: [new ArnPrincipal(`arn:${props.terraformEnginePartition || 'aws'}:iam::${props.terraformEngineAccount || accountId}:root`)],
                sid: "GivePermissionsToServiceCatalog"
            })
        );
    }
}
