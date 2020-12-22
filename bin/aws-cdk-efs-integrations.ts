#!/usr/bin/env node
require("dotenv").config();

import "source-map-support/register";
import * as cdk from "@aws-cdk/core";

import { AwsCdkEfsIntegrationsStack } from "../lib/aws-cdk-efs-integrations-stack";

/**
 * Get variables from Env
 */
const {
    PREFIX: prefix = "[STACK PREFIX NAME]",
    STAGE: stage = "[DEPLOYMENT STAGE]",
    CDK_ACCOUNT: accountId = "[AWS ACCOUNT ID]",
    CDK_REGION: region = "ap-southeast-1",
} = process.env;

/**
 * AWS defulat ENV config Definition
 */
const env = {
    account: accountId,
    region: region,
};

const app = new cdk.App();

/* tslint:disable-next-line:no-unused-expression */
new AwsCdkEfsIntegrationsStack(app, `${prefix}-${stage}-AwsCdkEfsIntegrationsStack`, {
    createEcsOnEc2Service: true,
    createEcsOnFargateService: true,
    createEfsFilesystem: true,
    createEfsAccessPoints: true,
    prefix,
    stage,
});

app.synth();
