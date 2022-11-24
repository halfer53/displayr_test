import * as Pulumi from '@pulumi/pulumi'
import { DisplayrFunction } from './Function'

export interface DisplayrFunctionAppArg {
    readonly container: string
    readonly healthCheckPath: string
}
export interface FunctionAppDict {
    readonly [index: string]: DisplayrFunctionAppArg
}
export class ProjectConfig {
    readonly location: string
    readonly functionApps: FunctionAppDict
}

export class DeploymentConfig {
    readonly projectConfig: ProjectConfig
    readonly locationCode: string
    readonly projectName: string
    readonly environment: string
}

export const locationCodeMapping : Record<string, string> = { 
    "australiaeast": "aue",
    "australiasoutheast": "aus"
}

export class Deployment{
    readonly pulumiConfig: Pulumi.Config
    readonly projectConfig: ProjectConfig
    readonly deploymentConfig: DeploymentConfig
    readonly defaultTags: Record<string, string>

    constructor(){
        this.pulumiConfig = new Pulumi.Config()
        this.projectConfig = this.getProjectConfig()
        this.deploymentConfig = this.getDeploymentConfig()
    }

    getProjectConfig(): ProjectConfig {
        return this.pulumiConfig.requireObject<ProjectConfig>("project")
    }

    getDeploymentConfig(): DeploymentConfig {
        return {
            projectConfig: this.projectConfig,
            locationCode: locationCodeMapping[this.projectConfig.location],
            projectName: this.pulumiConfig.name,
            environment: Pulumi.getStack()
        }
    }

    run(){
        const func = new DisplayrFunction(this.deploymentConfig);
    }
}