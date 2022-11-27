import * as Pulumi from '@pulumi/pulumi'
import { MockCallArgs } from "@pulumi/pulumi/runtime/mocks";
import { DeploymentConfig, ProjectConfig } from "../../deployer/Deployment";

export function setupEnvironmentVariable() {
    // Calls to Pulumi.GetProject() and Pulumi.GetStack() returns the following
    process.env.PULUMI_TEST_MODE = "true";
    process.env.PULUMI_NODEJS_PROJECT = "example"
    process.env.PULUMI_NODEJS_STACK = "test";
}


export function setupPulumiMock() {

    // Set mocks for all pulumi resources
    Pulumi.runtime.setMocks({
        newResource: function (args: Pulumi.runtime.MockResourceArgs): { id: string, state: any } {
            // generic return type
            return {
                id: `${args.inputs.name}-id`,
                state: {
                    ...args.inputs,
                    name: args.name
                },
            };
        },
        call: function (args: MockCallArgs) {
            return args.inputs;
        },
    },
        // configure the runtime mocks for the project and environment passed in
        process.env.PULUMI_NODEJS_PROJECT,
        process.env.PULUMI_NODEJS_STACK
    );
}

export const PROJECT_CONFIG: ProjectConfig = {
    location: "australiaeast",
    functionApps: {
        foo: {
            healthCheckPath: "/"
        }
    }
}

export const DEPLOYMENT_CONFIG: DeploymentConfig = {
    projectConfig: PROJECT_CONFIG,
    locationCode: "aue",
    projectName: "example",
    environment: "test"
}
