# Javascript Key-Value Database - Test Task

## Getting started

```sh
# Install dependencies
npm install
```

Then you can begin development:

```sh
# npm
npm run start
```

This will launch a [nodemon](https://nodemon.io/) process for automatic server restarts when your code changes.

### Environmental variables

The project uses [dotenv](https://www.npmjs.com/package/dotenv) for setting environmental variables during development. Simply copy `.env.example`, rename it to `.env` and add your env vars as you see fit. 

It is **strongly** recommended **never** to check in your .env file to version control. It should only include environment-specific values such as database passwords or API keys used in development. Your production env variables should be different and be set differently depending on your hosting solution. `dotenv` is only for development.

```sh
# Environmental variables
DB_PORT= (default: 3000)
DB_NAME=
DB_MQ_PATH=
DB_INCOME_QUEUE=
DB_OUTCOME_QUEUE=
DB_PERSISTENCE_STORAGE= (default: storage/)
DB_LOG_PATH= (default: logs/)
```

### Deployment

Deployment is specific to hosting platform/provider but generally:

```sh
# npm
npm run -s build
```

will compile your `src` into `/dist`, and 

```sh
# npm
npm run start:prod
```

will start the compiled application from the `/dist` folder.

The last command is generally what most hosting providers use to start your application when deployed, so it should take care of everything.


### Data Structures

Income messages:

```
{
  "type": "db" | "store", // required
  "command": "get" | "set" | "delete", // required
  "namespace": string, // required
  "data": {
    "key": string,
    "value": any,
    "ttl": number
  }
}
```

Outcome messages: 

```
{
  "type": "db" | "store",
  "command": "get" | "set" | "delete",
  "namespace": string,
  "response": {}
}
```
