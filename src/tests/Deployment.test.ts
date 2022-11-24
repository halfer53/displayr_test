import "jest";
import { Deployment, ProjectConfig } from "../deployer/Deployment";
import { setupEnvironmentVariable, setupPulumiMock, DEPLOYMENT_CONFIG } from './__utils__/common'

beforeAll(() => {
    setupEnvironmentVariable();
    setupPulumiMock();
})

describe("Deployment", () => {
    let deployment: Deployment

    beforeAll(() => {
        const mockconfig : ProjectConfig = {
            location: "australiaeast"
        }
        jest.spyOn(Deployment.prototype, 'getProjectConfig').mockImplementation(() => mockconfig)
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

    it("getDefaultTags", () => {
        expect(deployment.getDefaultTags()).toStrictEqual({
            location: "australiaeast",
            project: "example",
            environment: "test"
        })
    })
    
})