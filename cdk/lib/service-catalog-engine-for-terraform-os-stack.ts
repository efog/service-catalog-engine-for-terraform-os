import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { TerraformOpenSourceParameterParserFunction } from "./terraform-open-source-parameter-parser-function";
import { ProvisioningOperationsHandlerFunction } from "./provisioning-operations-handler-function";
import { StateMachineLambdaFunctions } from "./state_machine_lambda_functions";
import {
  IVpc,
  ISubnet,
  Vpc,
  Subnet,
  SubnetSelection,
  SubnetType,
  PublicSubnet,
} from "aws-cdk-lib/aws-ec2";
import { TerraformRunnersCluster } from "./terraform_runner";

export type ServiceCatalogEngineForTerraformOSStackProps = {
  serviceCatalogEndpoint: string | null;
  serviceCatalogVerifySSL: boolean;
  targetVpc: IVpc;
  targetVpcSubnets: SubnetSelection | undefined;
  terraformCLIVersion: string;
};

export class ServiceCatalogEngineForTerraformOSStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const serviceCatalogEndpoint = process.env.CDK_STACK_SERVICECATALOGENDPOINT;
    const serviceCatalogVerifySSL =
      process.env.CDK_STACK_SERVICECATALOGVERIFYSSL || false;
    const targetVpcId = process.env.CDK_STACK_TARGET_VPCID;
    const targetVpcSubnetIds = process.env.CDK_STACK_TARGET_VPC_SUBNETIDS;

    const terraforCLIVersion =
      process.env.CDK_STACK_TERRAFORMCLIVERSION || "1.2.8";

    let targetVpc: IVpc | undefined;
    targetVpc = Vpc.fromVpcAttributes(this, `targetVpc-${targetVpcId}`, {
      availabilityZones: cdk.Stack.of(this).availabilityZones,
      privateSubnetIds: targetVpcSubnetIds && targetVpcSubnetIds.split(",") || undefined,
      vpcId: targetVpcId || "",
    });

    let targetVpcSubnets: SubnetSelection | undefined;

    const stackProps = Object.assign({}, props, {
      serviceCatalogEndpoint: serviceCatalogEndpoint,
      serviceCatalogVerifySSL: serviceCatalogVerifySSL,
      targetVpc: targetVpc,
      terraformCLIVersion: terraforCLIVersion,
    } as ServiceCatalogEngineForTerraformOSStackProps);

    const parameterParserFunction =
      new TerraformOpenSourceParameterParserFunction(
        this,
        "terraformOpenSourceParameterParserFunction",
        stackProps,
      );
    const provisioningOperationsHandlerFunction =
      new ProvisioningOperationsHandlerFunction(
        this,
        "provisioningOperationsHandlerFunction",
        stackProps,
      );
    const stateMachineLambdaFunctions = new StateMachineLambdaFunctions(
      this,
      "stateMachineLambdaFunctions",
      stackProps,
    );
    const terraformRunnersCluster = new TerraformRunnersCluster(this, "terraformRunnersCluster", Object.assign({}, stackProps, {
        supportedTerraformVersions: ["1.5.7", "1.5.6", "1.5.5"]
    } ));
  }
}
