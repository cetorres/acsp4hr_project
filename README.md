# ACSP4HR

Assuring Cyber Security and Privacy for Human Resilience - Research Project

## Structure of the project

- client
  - The frontend application in React.
- server
  - The server API in Nest JS.

## Server setup

Create a file `server/.env` based on `server/.env.example` with your server configuration for:

- Database secrets and server
- JWT secret
- Sendgrid secrets

## Deployment

To build the applications and deploy, run the following commands:

client

```sh
npm --prefix client install
npm --prefix client run build
```

server

```sh
npm --prefix server install
npm --prefix server run build
npm --prefix server run start:prod
```

## Team

University of Colorado - Colorado Springs (<https://uccs.edu>)

Computer Science Department (<https://eas.uccs.edu/cs>)

- Carlos Eugenio Torres (<carlos.torres@uccs.edu>) - Research Assistant - PhD student
- Dr. Shouhuai Xu (<sxu@uccs.edu>) - Project PI
- Dr. Yanyan Zhuang (<yzhuang@uccs.edu>) - Project Co PI
