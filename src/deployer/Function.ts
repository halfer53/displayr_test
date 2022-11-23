import { DeploymentConfig } from "./Deployment";
import { ResourceGroup } from "@pulumi/azure-native/resources";

export class DisplayrFunction {
    projectConfig: DeploymentConfig
    resourceGroup: ResourceGroup

    constructor(deploymentConfig: DeploymentConfig){
        this.projectConfig = deploymentConfig
        this.run()
    }

    run(){
        this.resourceGroup = this.deployResourceGroup(this.projectConfig);
    }

    deployResourceGroup(deploymentConfig: DeploymentConfig): ResourceGroup {
        const rgName = `${deploymentConfig.projectName}-${deploymentConfig.environment}-${deploymentConfig.locationCode}-rg`
        return new ResourceGroup(rgName, {location: deploymentConfig.projectConfig.location})
    }
}