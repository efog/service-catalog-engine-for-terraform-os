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

export type ServiceCatalogEngineForTerraformOSStackProps = {
  serviceCatalogEndpoint: string | null;
  serviceCatalogVerifySSL: boolean;
  targetVpc: IVpc;
  targetVpcSubnets: SubnetSelection | undefined;
  terraformCLIVersion: string;
};

export class ServiceCatalogEngineForTerraformOSFoundationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const targetVpcId = process.env.CDK_STACK_TARGET_VPCID;
    let targetVpc: IVpc | undefined;
    targetVpc = Vpc.fromVpcAttributes(this, `targetVpc-${targetVpcId}`, {
      availabilityZones: cdk.Stack.of(this).availabilityZones,
      vpcId: targetVpcId || "",
    });
    this.ensureVpcHasPublicSubnets(targetVpc);
  }

  ensureVpcHasPublicSubnets(targetVpc: IVpc) {
    let idx = 1;
    const subnets = targetVpc.availabilityZones.map((az) => {
      const subnet = new PublicSubnet(this, `targetVpcSubnet-${idx}`, {
        availabilityZone: az,
        cidrBlock: `172.31.${32 + 16 * idx}.0/20`,
        vpcId: targetVpc.vpcId,
      });
      idx++;
    });
  }
}

export class ServiceCatalogEngineForTerraformOSStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const serviceCatalogEndpoint = process.env.CDK_STACK_SERVICECATALOGENDPOINT;
    const serviceCatalogVerifySSL =
      process.env.CDK_STACK_SERVICECATALOGVERIFYSSL || false;
    const targetVpcId = process.env.CDK_STACK_TARGET_VPCID;

    const terraforCLIVersion =
      process.env.CDK_STACK_TERRAFORMCLIVERSION || "1.2.8";

    let targetVpc: IVpc | undefined;
    targetVpc = Vpc.fromVpcAttributes(this, `targetVpc-${targetVpcId}`, {
      availabilityZones: cdk.Stack.of(this).availabilityZones,
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
  }
}
