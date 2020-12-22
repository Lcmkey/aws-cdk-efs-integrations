# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template


# [Amazon EFS Integrations][amazon-efs-integrations]

### How to Run

1. Install the package

    ```properties
    $ npm i
    ```

2. Create `.env` file with `.env.example` file content in `root` directory && change some params


3. List all Stacks

    ```properties
    $ cdk ls
    ```

4. Deploy to AWS

    ```properties
    $ cdk deploy
    ```

### Example EFS file system policy

If you're looking the example of the EFS file system policy mentioned in the demo video to use as a reference, it can be found below. Please note the values enclosed <WITHIN_ANGLE_BRACKETS>, which would need to be modified to suit your particular deployment.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "DisableRootAccessAndEnforceReadOnlyByDefault",
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "elasticfilesystem:ClientMount",
            "Resource": "arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:file-system/<EFS_FILESYSTEM_ID>",
        },
        {
            "Sid": "EnforceInTransitEncryption",
            "Effect": "Deny",
            "Principal": {
                "AWS": "*"
            },
            "Action": "*",
            "Resource": "arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:file-system/<EFS_FILESYSTEM_ID>",
            "Condition": {
                "Bool": {
                    "aws:SecureTransport": "false"
                }
            }
        },
        {
            "Sid": "EcsOnEc2CloudCmdTaskReadWriteAccess",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::${AWS::AccountId}:role/<ECS_ON_EC2_TASK_ROLE>"
            },
            "Action": [
                "elasticfilesystem:ClientMount",
                "elasticfilesystem:ClientWrite"
            ],
            "Resource": "arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:file-system/<EFS_FILESYSTEM_ID>",
            "Condition": {
                "StringEquals": {
                    "elasticfilesystem:AccessPointArn": [
                        "arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:access-point/<COMMON_AP_ID>",
                        "arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:access-point/<ECS_PRIVATE_AP_ID>",
                        "arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:access-point/<ECS_SHARED_AP_ID>"
                    ]
                }
            }
        },
        {
            "Sid": "EcsOnEc2CloudCmdTaskReadAccess",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::${AWS::AccountId}:role/<ECS_ON_EC2_TASK_ROLE>"
            },
            "Action": "elasticfilesystem:ClientMount",
            "Resource": "arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:file-system/<EFS_FILESYSTEM_ID>",
            "Condition": {
                "StringEquals": {
                    "elasticfilesystem:AccessPointArn": "arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:access-point/<FARGATE_SHARED_AP_ID>"
                }
            }
        },
        {
            "Sid": "EcsOnFargateCloudCmdTaskReadWriteAccess",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::${AWS::AccountId}:role/<ECS_ON_FARGATE_TASK_ROLE>"
            },
            "Action": [
                "elasticfilesystem:ClientMount",
                "elasticfilesystem:ClientWrite"
            ],
            "Resource": "arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:file-system/<EFS_FILESYSTEM_ID>",
            "Condition": {
                "StringEquals": {
                    "elasticfilesystem:AccessPointArn": [
                        "arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:access-point/<COMMON_AP_ID>",
                        "arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:access-point/<FARGATE_PRIVATE_AP_ID>",
                        "arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:access-point/<FARGATE_SHARED_AP_ID>"
                    ]
                }
            }
        },
        {
            "Sid": "EcsOnFargateCloudCmdTaskReadAccess",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::${AWS::AccountId}:role/<ECS_ON_FARGATE_TASK_ROLE>"
            },
            "Action": "elasticfilesystem:ClientMount",
            "Resource": "arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:file-system/<EFS_FILESYSTEM_ID>",
            "Condition": {
                "StringEquals": {
                    "elasticfilesystem:AccessPointArn": "arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:access-point/<ECS_SHARED_AP_ID>"
                }
            }
        }
    ]
}
```

<!-- Reference -->

[amazon-efs-integrations]: https://github.com/aws-samples/amazon-efs-integrations