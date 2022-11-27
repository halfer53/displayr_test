import { beforeAll, describe, it, expect } from "@jest/globals";
import { app } from "@pulumi/azure-native/types/enums";
import { DisplayrFunction } from "../deployer/Function";
import { setupEnvironmentVariable, setupPulumiMock, DEPLOYMENT_CONFIG } from './__utils__/common'

beforeAll(() => {
    setupEnvironmentVariable();
    setupPulumiMock();
})

describe("Function", () => {
    let func: DisplayrFunction

    beforeAll(() => {
        func = new DisplayrFunction(DEPLOYMENT_CONFIG)
    })

    describe("resource group", () => {
        it("name", () => {
            func.resourceGroup.name.apply((name) => {
                expect(name).toBe("example-test-aue-rg")
            })
        })

        it("location", () => {
            func.resourceGroup.location.apply((location) => {
                expect(location).toBe("australiaeast")
            })
        })
    })

    describe("storage account", () => {
        it("name", () => {
            func.storageAccount.name.apply((name) => {
                expect(name).toBe("exampletestauest")
            })
        })
    })

    describe("app service plan", () => {
        it("name", () => {
            func.asp.name.apply((name) => {
                expect(name).toBe("example-test-aue-asp")
            })
        })
    })

    describe("linux function app", () => {
        it("name", () => {
            for (let [_, app] of func.apps){
                app.name.apply((name) => {
                    expect(name).toBe("test-aue-foo")
                })
            }
        })
    })

    
    
})