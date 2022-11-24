import "jest";
import { Deployment } from "../deployer/Deployment";
import { setupEnvironmentVariable, setupPulumiMock, PROJECT_CONFIG } from './__utils__/common'

beforeAll(() => {
    setupEnvironmentVariable();
    setupPulumiMock();
})

describe("Deployment", () => {
    let deployment: Deployment

    beforeAll(() => {
        jest.spyOn(Deployment.prototype, 'getProjectConfig').mockImplementation(() => PROJECT_CONFIG)
        deployment = new Deployment()
    })

    it("getDeploymentConfig", () => {
        expect(deployment.getDeploymentConfig()).toStrictEqual({
            projectConfig: {
                location: "australiaeast"
            },
            locationCode: "aue",
            projectName: "example",
            environment: "test"
        })
    })
    
})