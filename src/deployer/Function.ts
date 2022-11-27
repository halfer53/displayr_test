import { DeploymentConfig, DisplayrFunctionAppArg } from "./Deployment";
import { ResourceGroup } from "@pulumi/azure/core";
import { Account as StorageAccount } from "@pulumi/azure/storage";
import { ServicePlan, LinuxFunctionApp } from "@pulumi/azure/appservice";
import * as Pulumi from "@pulumi/pulumi"
import { Monitor } from "@pulumi/newrelic/synthetics";

export class DisplayrFunction {
    config: DeploymentConfig
    resourceGroup: ResourceGroup
    storageAccount: StorageAccount
    asp: ServicePlan
    apps: Map<string, LinuxFunctionApp>

    constructor(deploymentConfig: DeploymentConfig){
        this.config = deploymentConfig
        this.run()
    }

    run(){
        this.resourceGroup = this.deployResourceGroup(this.config);
        this.storageAccount = this.deployStorageAccount(this.config, this.resourceGroup);
        this.asp = this.deployServicePlan(this.config, this.resourceGroup);
        this.apps = new Map<string, LinuxFunctionApp>();
        for (let [key, appConfig] of Object.entries(this.config.projectConfig.functionApps)){
            this.apps[key] = this.deployLinuxFunctionApp(key, appConfig, this.config, this.resourceGroup, this.asp, this.storageAccount);
            this.deployMonitoring(key, appConfig, this.apps[key])
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

        if(stname.length > 24){
            throw Error(`${stname} exceeds maximum length of 24`)
        }

        return new StorageAccount(stname, {
            name: stname,
            location: config.projectConfig.location,
            accountTier: "Standard",
            accountReplicationType: "LRS",
            accountKind: "StorageV2",
            resourceGroupName: rg.name,
        })
    }

    deployServicePlan(config: DeploymentConfig, rg: ResourceGroup): ServicePlan {
        const name = `${config.projectName}-${config.environment}-${config.locationCode}-asp-break-naming-convention`
        return new ServicePlan(name, {
            name: name,
            location: config.projectConfig.location,
            resourceGroupName: rg.name,
            osType: "Linux",
            skuName: "Y1"
        })
    }

    deployLinuxFunctionApp(appName: string, appConfig: DisplayrFunctionAppArg, deploymentConfig: DeploymentConfig,
         rg: ResourceGroup, asp: ServicePlan, storage: StorageAccount): LinuxFunctionApp {
        
        const name = `${deploymentConfig.environment}-${deploymentConfig.locationCode}-${appName}`

        const app = new LinuxFunctionApp(name, {
            resourceGroupName: rg.name,
            storageAccountName: storage.name,
            storageAccountAccessKey: storage.primaryAccessKey,
            servicePlanId: asp.id,
            enabled: true,
            siteConfig: {}
        })
        return app
    }

    deployMonitoring(appName: string, appConfig: DisplayrFunctionAppArg, app: LinuxFunctionApp) : Monitor {
        console.log(Pulumi.interpolate`https://${app.defaultHostname}${appConfig.healthCheckPath}`)
        return new Monitor(`${appName}-monitor`, {
            period: "EVERY_MINUTE",
            status: "ENABLED",
            type: "SIMPLE",
            uri: Pulumi.interpolate`https://${app.defaultHostname}${appConfig.healthCheckPath}`,
            locationsPublics: [
                "AP_SOUTHEAST_2"
            ]
        })
    }
}