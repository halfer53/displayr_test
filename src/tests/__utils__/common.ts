import * as Pulumi from '@pulumi/pulumi'
import { MockCallArgs } from "@pulumi/pulumi/runtime/mocks";
import { DeploymentConfig } from "../../deployer/Deployment";

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
            switch (args.type) {
                case "azure-native:resources:ResourceGroup":
                    return {
                        id: `${args.inputs.name}-id`,
                        state: {
                            ...args.inputs,
                            name: args.inputs.resourceGroupName,
                        }
                    }
   
                case "azure-native:web:WebApp": {
                    return {
                        id: `${args.inputs.name}-id`,
                        state: {
                            ...args.inputs,
                            name: args.inputs.name,
                            resourceGroup: args.inputs.resourceGroupName,
                            siteConfig: args.inputs.siteConfig,
                            clientAffinityEnabled: args.inputs.clientAffinityEnabled,
                        }
                    }
                }
                
                case "azure-native:web:WebAppSlot": {
                    return {
                        id: `${args.inputs.name}-id`,
                        state: {
                            ...args.inputs,
                            resourceGroup: args.inputs.resourceGroupName,
                            siteConfig: args.inputs.siteConfig,
                            clientAffinityEnabled: args.inputs.clientAffinityEnabled
                        }
                    }
                }
            }

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

export const DEPLOYMENT_CONFIG: DeploymentConfig = {
    projectConfig: {
        location: "australiaeast"
    },
    locationCode: "aue",
    projectName: "example",
    environment: "test"
}
