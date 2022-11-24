import { DeploymentConfig } from "./Deployment";
import { ResourceGroup } from "@pulumi/azure-native/resources";
import { StorageAccount } from "@pulumi/azure-native/storage";
import { storage } from "@pulumi/azure-native/types/enums";
import { AppServicePlan, WebApp } from "@pulumi/azure-native/web";

export class DisplayrFunction {
    config: DeploymentConfig
    resourceGroup: ResourceGroup
    storageAccount: StorageAccount
    asp: AppServicePlan

    constructor(deploymentConfig: DeploymentConfig){
        this.config = deploymentConfig
        this.run()
    }

    run(){
        this.resourceGroup = this.deployResourceGroup(this.config);
        this.storageAccount = this.deployStorageAccount(this.config, this.resourceGroup);
        this.asp = this.deployAppServicePlan(this.config, this.resourceGroup);
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

    deployAppServicePlan(config: DeploymentConfig, rg: ResourceGroup): AppServicePlan {
        const name = `${config.projectName}-${config.environment}-${config.locationCode}-asp`
        return new AppServicePlan(name, {
            name: name,
            location: config.locationCode,
            resourceGroupName: rg.name,
            sku: {
                name: 'Y1',
                tier: 'Dynamic'
            }
        })
    }
}