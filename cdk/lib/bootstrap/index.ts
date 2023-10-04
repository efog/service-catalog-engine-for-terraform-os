import { type StackProps } from 'aws-cdk-lib';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class ServiceCatalogEngineForTerraformBootstrap extends Construct {
    public readonly serviceCatalogLaunchRole: Role;
    constructor (scope: Construct, id: string, props: StackProps) {
        super(scope, id);
        const accountNumber =
        this.serviceCatalogLaunchRole = new Role(this, 'serviceCatalogLaunchRole', {
            assumedBy: new ServicePrincipal('servicecatalog.amazonaws.com'),
            path: 'TerraformEngine',
            
        });
    }
}
