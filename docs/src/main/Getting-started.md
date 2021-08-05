# Getting started

## Prerequisites

The `v15.x` version of [Node.js](https://nodejs.org/en/download/package-manager/) must be installed.

### Required backend services/components

* Location Service
* Auth Service - user with esw-user role is required
* Agent Service
* One or more agents should be up and running.

### Running backend services locally

1. csw-services should be up & running.
   using sbt shell inside CSW `csw-services/run start -k -c`.

2. The latest binaries of ESW need to be present on machine with 0.1.0-SNAPSHOT version.
   run `sbt publishLocal` inside ESW sbt shell.
   Note: This step needs to be done atleast once and/or whenever new changes of esw are pulled from github.

3. Start esw services
  *  OCS-ENG-UI requires `AgentService` along with one or more agent should be up & running to manage observations on various agent/machine. To start, run following command inside ESW sbt shell `esw-services/run start --agent --agent-service`.

  * Sequence manager could be started from UI. However, Sometimes you may want to work in a simulation environment & to start a simulated Sequence Manager, use
    `esw-services/run start --agent-service -s --simulation`

  * Alternatively, You can use `esw-services/run start-eng-ui-services` command to start all the required services and agents required to test the observation scripts written in repo `sequencer-scripts/ui-setup` branch.

## Run the ESW-OCS-ENG-UI Application in Local Environment

Run following commands in the terminal.

  ```bash
    npm install
    npm start
  ```

## User details for login

For testing purposes, we are creating `osw-user1, esw-user1 & tcs-user1` users while launching the Keycloak from csw-services

Username: osw-user1
Password: osw-user1


