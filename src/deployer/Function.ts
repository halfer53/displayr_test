import { DeploymentConfig, DisplayrFunctionAppArg } from "./Deployment";
import { ResourceGroup } from "@pulumi/azure-native/resources";
import { StorageAccount, listStorageAccountKeysOutput } from "@pulumi/azure-native/storage";
import { AppServicePlan, WebApp } from "@pulumi/azure-native/web";
import * as Pulumi from "@pulumi/pulumi"
import { appconfiguration } from "@pulumi/azure-native/types/enums";

export class DisplayrFunction {
    config: DeploymentConfig
    resourceGroup: ResourceGroup
    storageAccount: StorageAccount
    asp: AppServicePlan
    apps: Map<string, WebApp>

    constructor(deploymentConfig: DeploymentConfig){
        this.config = deploymentConfig
        this.run()
    }

    run(){
        this.resourceGroup = this.deployResourceGroup(this.config);
        // this.storageAccount = this.deployStorageAccount(this.config, this.resourceGroup);
        this.asp = this.deployAppServicePlan(this.config, this.resourceGroup);
        // this.storageAccount = this.deployStorageAccount(this.config, this.resourceGroup);
        this.apps = new Map<string, WebApp>();
        for (let [key, appConfig] of Object.entries(this.config.projectConfig.functionApps)){
            this.apps[key] = this.deployFunctionApp(key, appConfig, this.config, this.resourceGroup, this.asp, this.storageAccount);
        }
    }

    deployResourceGroup(config: DeploymentConfig): ResourceGroup {
        const rgName = `${config.projectName}-${config.environment}-${config.locationCode}-rg`
        return new ResourceGroup(rgName, {
            resourceGroupName: rgName,
            location: config.projectConfig.location
        })
    }

    // deployStorageAccount(config: DeploymentConfig, rg: ResourceGroup) : StorageAccount {
    //     const stname = `${config.projectName}${config.environment}${config.locationCode}st`
    //     return new StorageAccount(stname, {
    //         accountName: stname,
    //         location: config.projectConfig.location,
    //         kind: "StorageV2",
    //         resourceGroupName: rg.name,
    //         sku: {
    //             name: "Standard_LRS"
    //         }
    //     })
    // }

    deployAppServicePlan(config: DeploymentConfig, rg: ResourceGroup): AppServicePlan {
        const name = `${config.projectName}-${config.environment}-${config.locationCode}-asp`
        return new AppServicePlan(name, {
            name: name,
            location: config.projectConfig.location,
            resourceGroupName: rg.name,
            kind: "linux",
            reserved: true,
            sku: {
                name: "Y1",
                tier: "Dynamic",
                size: "Y1",
                capacity: 1
            },
        })
    }

    deployFunctionApp(appName: string, appConfig: DisplayrFunctionAppArg, deploymentConfig: DeploymentConfig,
         rg: ResourceGroup, asp: AppServicePlan, storage: StorageAccount): WebApp {
        
        const name = `${deploymentConfig.projectName}-${deploymentConfig.environment}-${deploymentConfig.locationCode}-${appName}-app`

        return new WebApp(name, {
            resourceGroupName: rg.name,
            serverFarmId: asp.id,
            kind: "functionapp,linux",
            storageAccountRequired: false,
            siteConfig: {
                numberOfWorkers: 1,
                alwaysOn: false,
                linuxFxVersion: `DOCKER|${appConfig.container}`,
                
                appSettings: [
                    { name: "DOCKER_REGISTRY_SERVER_URL", value: "https://index.docker.io/v1" },
                    { name: "WEBSITES_ENABLE_APP_SERVICE_STORAGE", value: "false" },
                    { name: "FUNCTIONS_EXTENSION_VERSION", value: "~4"}
                ],
            },
            
        })
    }
}