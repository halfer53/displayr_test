import "jest";
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

    
    
})