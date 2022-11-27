import { DeploymentConfig, DisplayrFunctionAppArg } from "./Deployment";
import { ResourceGroup } from "@pulumi/azure/core";
import { Account as StorageAccount } from "@pulumi/azure/storage";
import { Plan as AppServicePlan, FunctionApp } from "@pulumi/azure/appservice";
import * as Pulumi from "@pulumi/pulumi"

export class DisplayrFunction {
    config: DeploymentConfig
    resourceGroup: ResourceGroup
    storageAccount: StorageAccount
    asp: AppServicePlan
    apps: Map<string, FunctionApp>

    constructor(deploymentConfig: DeploymentConfig){
        this.config = deploymentConfig
        this.run()
    }

    run(){
        this.resourceGroup = this.deployResourceGroup(this.config);
        this.storageAccount = this.deployStorageAccount(this.config, this.resourceGroup);
        this.asp = this.deployAppServicePlan(this.config, this.resourceGroup);
        this.apps = new Map<string, FunctionApp>();
        for (let [key, appConfig] of Object.entries(this.config.projectConfig.functionApps)){
            this.apps[key] = this.deployFunctionApp(key, appConfig, this.config, this.resourceGroup, this.asp, this.storageAccount);
        }
    }

    deployResourceGroup(config: DeploymentConfig): ResourceGroup {
        const rgName = `${config.projectName}-${config.environment}-${config.locationCode}-rg`
        return new ResourceGroup(rgName, {
            name: rgName,
            location: config.projectConfig.location
        })
    }

    deployStorageAccount(config: DeploymentConfig, rg: ResourceGroup) : StorageAccount {
        const stname = `${config.projectName}${config.environment}${config.locationCode}st`
        return new StorageAccount(stname, {
            name: stname,
            location: config.projectConfig.location,
            accountTier: "Standard",
            accountReplicationType: "LRS",
            accountKind: "StorageV2",
            resourceGroupName: rg.name
        })
    }

    deployAppServicePlan(config: DeploymentConfig, rg: ResourceGroup): AppServicePlan {
        const name = `${config.projectName}-${config.environment}-${config.locationCode}-asp`
        return new AppServicePlan(name, {
            name: name,
            location: config.projectConfig.location,
            resourceGroupName: rg.name,
            kind: "Linux",
            reserved: true,
            sku: {
                tier: "Dynamic",
                size: "Y1"
            }
        })
    }

    deployFunctionApp(appName: string, appConfig: DisplayrFunctionAppArg, deploymentConfig: DeploymentConfig,
         rg: ResourceGroup, asp: AppServicePlan, storage: StorageAccount): FunctionApp {
        
        const name = `${deploymentConfig.projectName}-${deploymentConfig.environment}-${deploymentConfig.locationCode}-${appName}`

        const app = new FunctionApp(name, {
            resourceGroupName: rg.name,
            storageAccountName: storage.name,
            storageAccountAccessKey: storage.primaryAccessKey,
            appServicePlanId: asp.id,
            enabled: true,
            version: '~4',
            siteConfig: {
                alwaysOn: true,
                healthCheckPath: appConfig.healthCheckPath,
                linuxFxVersion: `DOCKER|${appConfig.container}`
            },
            appSettings: {
                WEBSITE_CONTENTAZUREFILECONNECTIONSTRING: storage.primaryConnectionString,
                WEBSITE_CONTENTSHARE: storage.name,
                WEBSITES_ENABLE_APP_SERVICE_STORAGE: "false",
                AzureWebJobsDisableHomepage: "true",
            },
        })
        return app
    }
}