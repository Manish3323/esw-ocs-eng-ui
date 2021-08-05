# ESW-OCS-ENG-UI

This project is a React web application.

## Prerequisites Required for Running OCS-UI Application

1. csw-services should be up & running.
    using sbt shell inside CSW `csw-services/run start -k -c`.

2. The latest binaries of ESW need to be present on machine with 0.1.0-SNAPSHOT version.
    run `sbt publishLocal` inside ESW sbt shell.
    Note: This step needs to be done atleast once and/or whenever new changes of esw are pulled from github.

3a. `AgentService` along with one or more `Agent's` should be up & running.
    using sbt shell inside ESW `esw-services/run start --agent --agent-service`.

3b. Alternatively, to run esw-services with a simulated Sequence Manager, use
    `esw-services/run start --agent-service -s --simulation`

The `v15.x` version of [Node.js](https://nodejs.org/en/download/package-manager/) must be installed.

## User role for login

For testing purposes, we are creating a `esw-user` while launching the Keycloak from csw-services

Username: esw-user
Password: esw-user

## Run the Application in Local Environment

Run following commands in the terminal.

  ```bash
    npm install
    npm start
  ```

Then, open [localhost:8080](http://localhost:8080) in a browser

### Required backend services/components

* Location Service
* Auth Service - user with esw-user role is required
* Agent Service
* One or more agents should be up and running.

## Build the App for Production

Run following commands in the terminal.

```bash
npm install
npm run build
```

## Running Tests

```bash
npm test
```

## How to Use the Project

The project has following structure:

```bash
.
├── src
│   ├── assets
│   ├── components
|   ├── containers
│   ├── config
│   ├── features
│   ├── routes
├── test
├── types
```

* `assets`: This directory contains all the files (images, audio etc) that are used by the UI component.
* `components`: App reusable functions / components created for this UI application.
* `config`: This contains the application specific configurations.
* `containers`: App reusable functions / utilities goes here.
* `test`: This directory contains all the tests for the UI application.
* `types`: This directory contains all the types that needs to be imported externally for UI application.

## References

* ESW-TS Library - [Link](https://github.com/tmtsoftware/esw-ts/)
* ESW-TS Library Documentation - [Link](https://tmtsoftware.github.io/esw-ts/)

## code-visualization

![Visualization of the codebase](./diagram.svg)
