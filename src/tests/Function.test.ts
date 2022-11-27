import { beforeAll, describe, it, expect } from "@jest/globals";
import { DisplayrFunction } from "../deployer/Function";
import { setupEnvironmentVariable, setupPulumiMock, DEPLOYMENT_CONFIG, PROJECT_CONFIG } from './__utils__/common'

beforeAll(() => {
    setupEnvironmentVariable();
    setupPulumiMock();
})

describe("Function", () => {
    let service: DisplayrFunction

    beforeAll(() => {
        service = new DisplayrFunction(DEPLOYMENT_CONFIG)
    })

    describe("resource group", () => {
        it("name", () => {
            service.resourceGroup.name.apply((name) => {
                expect(name).toBe("example-test-aue-rg")
            })
        })

        it("location", () => {
            service.resourceGroup.location.apply((location) => {
                expect(location).toBe("australiaeast")
            })
        })
    })

    describe("storage account", () => {
        it("name", () => {
            service.storageAccount.name.apply((name) => {
                expect(name).toBe("exampletestauest")
            })
        })
    })

    describe("app service plan", () => {
        it("name", () => {
            service.asp.name.apply((name) => {
                expect(name).toBe("example-test-aue-asp")
            })
        })
    })

    describe("linux function app", () => {
        it("name", () => {
            for (let [_, app] of service.apps){
                app.name.apply((name) => {
                    expect(name).toBe("test-aue-foo")
                })
            }
        })

        it("name too long", () => {
            let config = {
                projectConfig: PROJECT_CONFIG,
                locationCode: "aue",
                projectName: "projectNameTooLong",
                environment: "test"
            }
            const func = () => service.deployStorageAccount(config, service.storageAccount)
            expect(func).toThrow()
            expect(func).toThrow("projectNameTooLongtestauest exceeds maximum length of 24")
        })
    })

    
    
})