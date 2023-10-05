import { Stack, type StackProps } from 'aws-cdk-lib';
import { AnyPrincipal, Effect, type IRole, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { type IKey, Key } from 'aws-cdk-lib/aws-kms';
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface TerraformStateStorageProps {
    stateMachineLambdaFunctionsRole: IRole
    terraformStateBucketEncryptionKMSKeyArn: string | undefined
};

export class TerraformStateStorage extends Construct {
    public readonly terraformStateBucket: Bucket;
    constructor (scope: Construct, id: string, props: StackProps & TerraformStateStorageProps) {
        super(scope, id);
        const region = Stack.of(this).region;
        const accountId = Stack.of(this).account;

        const tfStateBucketKMSKey = props.terraformStateBucketEncryptionKMSKeyArn &&
            Key.fromKeyArn(this, 'terraformStateBucketEncryptionKMSKey', props.terraformStateBucketEncryptionKMSKeyArn);

        this.terraformStateBucket = new Bucket(this, 'terraformStateBucket', {
            bucketName: `sc-terraform-engine-state-${accountId}-${region}`,
            encryption: tfStateBucketKMSKey === undefined ? BucketEncryption.S3_MANAGED : BucketEncryption.KMS,
            encryptionKey: (tfStateBucketKMSKey && tfStateBucketKMSKey) as IKey | undefined,
            versioned: true
        });
        this.terraformStateBucket.grantReadWrite(props.stateMachineLambdaFunctionsRole);
        this.terraformStateBucket.addToResourcePolicy(new PolicyStatement(
            {
                actions: ['s3:*'],
                conditions: [
                    {
                        Bool: [{
                            'aws:SecureTransport': false
                        }]
                    }
                ],
                effect: Effect.DENY,
                principals: [new AnyPrincipal()],
                sid: 'DenyInsecureCommunications'
            }));
        this.terraformStateBucket.addToResourcePolicy(new PolicyStatement(
            {
                actions: ['s3:*'],
                conditions: [
                    {
                        ArnNotEquals: [props.stateMachineLambdaFunctionsRole.roleArn]
                    }
                ],
                effect: Effect.DENY,
                principals: [new AnyPrincipal()],
                sid: 'DenyEveryoneElseExceptDesignatedRoles'
            }));
    }
}
