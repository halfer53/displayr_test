import * as Pulumi from '@pulumi/pulumi'
import { DisplayrFunction } from './Function'

export class ProjectConfig {
    readonly location: string
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
        this.defaultTags = this.getDefaultTags()
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

    getDefaultTags(): Record<string, string> {
        return {
            location: this.projectConfig.location,
            environment: this.deploymentConfig.environment,
            project: this.deploymentConfig.projectName
        }
    }

    run(){
        const func = new DisplayrFunction(this.deploymentConfig);
    }
}