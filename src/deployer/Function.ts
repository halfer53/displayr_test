import { DeploymentConfig } from "./Deployment";
import { ResourceGroup } from "@pulumi/azure-native/resources";
import { StorageAccount } from "@pulumi/azure-native/storage";
import { storage } from "@pulumi/azure-native/types/enums";

export class DisplayrFunction {
    config: DeploymentConfig
    resourceGroup: ResourceGroup
    storageAccount: StorageAccount

    constructor(deploymentConfig: DeploymentConfig){
        this.config = deploymentConfig
        this.run()
    }

    run(){
        this.resourceGroup = this.deployResourceGroup(this.config);
        this.storageAccount = this.deployStorageAccount(this.config, this.resourceGroup)
    }

    deployResourceGroup(config: DeploymentConfig): ResourceGroup {
        const rgName = `${config.projectName}-${config.environment}-${config.locationCode}-rg`
        return new ResourceGroup(rgName, {
            resourceGroupName: rgName,
            location: config.projectConfig.location
        })
    }

    deployStorageAccount(config: DeploymentConfig, rg: ResourceGroup) : StorageAccount {
        const stname = `${config.projectName}${config.environment}${config.locationCode}st`
        return new StorageAccount(stname, {
            accountName: stname,
            location: config.projectConfig.location,
            kind: "StorageV2",
            resourceGroupName: rg.name,
            sku: {
                name: storage.SkuName.Standard_LRS,
            }
        })
    }
}