## Overview

This repo provides an example that aims to provide golden path for developers to create infrastructures with self-service and standard platform, similar to Spotify's [Golden Path](https://engineering.atspotify.com/2020/08/how-we-use-golden-paths-to-solve-fragmentation-in-our-software-ecosystem/)

By using this repo, development teams can utilise standardised infrastructure deployments, which provides consistency across the entire organisation. This is to enable teams to use Azure best practices, standard naming standards, and manage everything Azure related in a single place; without the need to fully understand what’s going on in the background.

Example of Pull Request that create new function app: https://github.com/halfer53/displayr_test/pull/1

## Supported Infrastructure

At this stage, this repository only deploys Azure Function app along with associated Resource Group, App Service Plan, Storage Account and New Relic Synthetic Monitoring

## Getting started

View examples under [src/infrastructure/example](src/infrastructure/example), this is an example project that demonstrate the structure of this repository. Each folder under `infrastructure` is a separate folder, in this instance, `example` is the project name. 

Each project consists of at least 3 files

`Pulumi.yaml`: this describes the project info

`Pulumi.<environment>.yaml`: each project can have different environments (or stacks) that isolate between different components. 

`index.ts`: this is standardised default file required by Pulumi to run, it generally just references `Deployment` under [src/deployer/Deployment.ts](src/deployer/Deployment.ts)

## Example of YAML file

Example of `Pulumi.<environment>.yaml` looks like this as shown in [src/infrastructure/example/Pulumi.test.yaml](src/infrastructure/example/Pulumi.test.yaml)

```yaml
config:
  example:project:
    location: australiaeast
    functionApps:
      foo:
        healthCheckPath: '/'
```

In the above example, Pulumi will create a new Linux Function App `foo` using shared App Service Plan within the project. An associated New Relic Synthetic monitoring would be created on the default hostname of the function app with path specified in `healthCheckPath`

## Unit Test

Although YAML file does not contain schema validation, the code itself contains unit tests and robust error checking. The tests contain basic tests that validate against expected valid or invalid inputs.

Tests are located under [src/tests](src/tests/) 

 - [Deployment.tests.ts](src/tests/Deployment.test.ts)
 - [Function.tests.ts](src/tests/Function.test.ts)

## Integration Tests

Integrations tests are run as part of the pipeline, YAML file of github action can be found at [push.yaml](.github/workflows/push.yaml) and [pull_request.yaml](.github/workflows/pull_request.yaml)

When a PR is raised, Pulumi bot post the results of unit tests and integration tests of example app in the PR comment section, as shown in this example https://github.com/halfer53/displayr_test/pull/1.

Upon the completion of PR and merged to master, a separate pipeline will be run to update the production pipeline 




