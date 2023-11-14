# ACSP4HR - SPDS

![SPDS_01](images/spds_01.png)

More screenshots: [Screenshot 2](images/spds_02.png), [Screenshot 3](images/spds_03.png), [Screenshot 4](images/spds_04.png)

This system (SPDS) is part of a research project called ACSP4HR - Assuring Cyber Security and Privacy for Human Resilience. It is sponsored by [UCCS](https://uccs.edu) and the [NSF](https://www.nsf.gov/) and it is part of my [PhD in Computer Science](https://eas.uccs.edu/cs/academics/graduate-programs/phd-in-engineering-concentration-in-computer-science) research at [UCCS](https://uccs.edu).

The system is currently accessible at: <https://acsp4hr.tk>

SPDS (Secure and Privacy-Preserving Data Sharing for Data Science Computations) is a secure and privacy-preserving data sharing system for data science computations toward the scientific community that actually `does not share the data`. The main goal is to provide a way to securely and privately share datasets that can still be used to run data science computations for research, but without the data itself ever being disclosed, just the computations results.
In addition, the system provides secure authentication for users (for integrity) and a workflow for permission management to access datasets. This allows users to request access and dataset owners to grant or reject it, placing the control of the datasets in their hands.

The system usage is very straightforward to facilitate any person without much knowledge in data science to utilize it. Users are able to browse and search datasets using keywords that match the metadata associated with them (added by the owners). More information about a dataset can be viewed, but only the metadata, along with the variables (or features) that describe the data, but never the data itself. Then, if a dataset interests a user, they can request access to it. The owner of the dataset receives the request, analyzes it, and grants or rejects it. If granted, the user that requested can now run computations on it from a list of available, pre-created, and pre-vetted computations on the system. The datasets are stored on the server always encrypted, never shared or transmitted via network, and only decrypted locally and temporarily for computation processing. More details about the whole system workflow, dataset encryption, and computations process will be explained later in the next sections.

A `paper` is being written to formalize all the scientific aspects of the project. It will be made available here once is done.

## Events and presentations

The project has been presented at the following events:

- ISTSS (International Society for Traumatic Stress Studies) 39th Annual Meeting, Oct. 2023. The event's [program](https://istss.org/am23/program) is available online. The slides of the presentation can be found in the [events](/events) folder.

## Problem statement

The scientific research community often needs to share datasets to spread scientific data results that can help other groups in their own research. But often these datasets contain private information from subjects that may not have consented for their information to be publicly disclosed. Thus, many datasets end up not being shared at all, or they are data blinded to strip, sometimes, too much person-identifiable information, decreasing the quality of the data.

The main problem this work aims to solve is securing and preserving the privacy of scientific data during its sharing process. That is a real problem that can even prevent some important research datasets from being shared. So this work brings a solution to this problem, by allowing data sharing without actually having to share the data, but only the permission to run computation on it and see the results. So the data is always preserved.

## Usage scenario

![SPDS_USAGE](images/Scenario_1_v3.png)

The scenario demonstrates how users who own datasets may publish them, and how other users can request access to these available datasets that fit their search criteria through a secure data-sharing system. The steps below the scenario from the perspective of Alice (dataset owner) and Bob (requester).

- `Step 1`: Alice publishes a dataset she owns with a brief description of what data it contains, its purpose, data format, attributes, and other information as the metadata. This metadata will then be available for other users in the system to browse, among all the available datasets.
- `Step 2`: Bob, who needs access to a dataset for his research project, can browse, and view all available datasets' metadata using search filters. The search results will show all the datasets with metadata that meets Bob's search criteria. After Bob finds that Alice's dataset fits his needs, he sends an access request to Alice.
- `Step 3`: Alice receives a notification of the request and responds to it by accepting, rejecting, or requesting more information from Bob, such as more details about his research needs and his use of the dataset. Bob will have access to the dataset if his request is accepted. If Alice requests more information from Bob, then Bob will respond accordingly and wait for Alice's decision.
- `Step 4`: Bob may need to respond with more information that Alice may have requested. After Bob's request is accepted, he can run computations on the dataset. It is important that dataset requesters like Bob cannot view or download Alice's dataset --- they can only run computations on the dataset in the data-sharing system's runtime environment, and visualize the results. The contents of Alice's dataset are never disclosed to anyone.
- `Step 5`: Bob browses a list of available computation, selects a subset, and execute the selected computation using Alice's dataset.
- `Step 6`: To run a computation, the system internally retrieves the dataset, temporarily decrypts it, and runs queries to provide data to the computation.
- `Step 7`: After the computation is done, the system saves the computation results for Bob to view and retrieve. The computation results are all Bob can see.

## System architecture

![SPDS_ARCH](images/System_Architecture_v6.png)

- Client
  - For the frontend UI, we are using [React JS](https://react.dev), an industry-leading reactive web user interface framework originally created by Facebook. It can be used as the front-end UI, where the users will be able to interact with the system visually and securely authenticated.
- Backend API
  - The backend API is based on [NodeJS](https://nodejs.org) with another layer using [NestJS](https://www.nestjs.com), which is an open-source, widely-used NodeJS framework for building efficient, reliable, and scalable server-side applications. It can be used as the server API of the front-end UI application, providing secure authentication, access to the application's functionalities, and interacting with the databases.
- File server
  - The file server is going to store the datasets files, accessible
to the backend API, and always encrypted, using a cryptosystem secure against an adaptive chosen-ciphertext attack (IND-CCA) called AES-GCM.
- Database
  - We are using [Postgres DB](https://www.postgresql.org), a powerful, open-source object-relational database system with active development and has earned a strong reputation for reliability, feature robustness, and performance. It can be used to store non-sensitive data, like data files metadata, access requests, activity logs, and
participant consent revocations.

## Encryption model

This is the client-server encryption scheme that we created for the system.

![SPDS_MODEL](images/Client_Server_Encryption_v2.png)

## Database design

The database used is [Postgres DB](https://www.postgresql.org).

![SPDS_DB](images/database_design_v3.png)

### Tables descriptions

- `users`
  - Stores all the users of the system, with regular and admin roles.
- `datasets`
  - Stores the datasets' information and metadata. 
- `variables`
  - Stores variables (features) associated with each dataset.
- `favorites`
  - Stores the favorite datasets of a user.
- `requests`
  - Stores the requests a user makes to get access to a dataset.
- `computations`
  - Stores the list of available computations the users can choose from to run.
- `computation_runs`
  - Stores the results of the computations a user runs over a dataset.

### Relationships

| Relationship             | Type         |
|--------------------------|--------------|
| users - datasets         | one to many  |
| users - favorites        | one to many  |
| users - requests         | one to many  |
| users - computation_runs | one to many  |
| datasets - variables     | one to many  |
| datasets - favorites     | many to many |
| requests - datasets      | one to one   |
| requests - computations_runs  | one to many  |
| computations - computation_runs | one to many  |

## Structure of the project

- client
  - The frontend application in [React](https://react.dev).
- server
  - The server API in [Nest JS](https://nestjs.com) with [Postgres DB](https://www.postgresql.org).


## System requirements

### client

- The client application requires:
  - Node.JS v.16.13.1+
  - React v.18.2+
  - Operating system:
    - Production: Linux (e.g. Ubuntu v.22.04 LTS)
    - Development: Linux, MacOS, Windows

### server

- The server application requires:
  - Node.JS v.16.13.1+
  - PostgreSQL v.15+
  - Operating system:
    - Production: Linux (e.g. Ubuntu v.22.04 LTS)
    - Development: Linux, MacOS, Windows
  - Python v.3.10+ installed (requirements.txt for needed libraries)
  - R v.4.2.3+ installed (r_requirements.txt for needed libraries)


## Server setup

With all system requirements installed and running on the server (and on the development machine if you want). Create a file `server/.env` based on `server/.env.example` with your server configuration for:

- Database secrets and server
  - DB_TYPE=postgres
  - DB_HOST=
  - DB_PORT=
  - DB_USERNAME=
  - DB_PASSWORD=
  - DB_NAME=
- JWT secret
  - JWT_SECRET=
- Sendgrid secrets (you can create a free SendGrid account)
  - VERIFIED_EMAIL_FROM=
  - SENDGRID_API_KEY=

### Database

Once the `.env` file is configured with all settings, you can run the server following the directions below. Make sure you configure the database access correctly. It will run the migrations on the database automatically on the first time, creating all tables, indexes, and relationships.

When you access the application for the first time, you can create your user via the fron-tend normally. But then go to the database directly and mark that user as `admin`, so you will have access to the application to create users, computations, and maintain the whole application.

## Deployment

To build the applications and deploy, run the following commands:

### client

```sh
npm --prefix client install
npm --prefix client run build
```

### server

```sh
npm --prefix server install
npm --prefix server run build
npm --prefix server run start:prod
```

## Code changes

If you desire to change the code you'll need to know how to develop for web (full stack). You need to know the requirements (e.g. React, Node.JS, Nest.JS) and TypeScript, as the language used on both client and server applications.

### client

The code for the client application is organized inside `./client/src` like this:

- api
  - All the request calls to the server API to get/post data from/to the server.
- assets
  - Empty for now. Needed if you want to add static files (e.g. images, CSS).
- components
  - All the reusable components used by the pages.
- contexts
  - The contexts (Context API) used throughout the application to manage global state.
- pages
  - Contains all the application's web pages

### server

The server code is organized inside `./server` like this:

- dataset_files
  - Folder that stores all the uploaded dataset files encrypted.
- dataset_files_temp
  - Temporary storage for dataset files that are uploaded.
- dataset_plot_images
  - Stores all the plot images resulting from the computations.
- dist
  - Where the built application is stored when running in production.
- run_computations
  - Stores the computations files (Python and R scripts) used by the application's computations.
- src
  - auth
    - Authentication API (decorators, dto, enums, guards, strategies, controllers, services, modules).
  - computations
    - Computations API (dto, entities, controller, service, module).
  - dashboard
    - Dashboard API (controller, service, module).
  - datasets
    - Datasets API (dto, entities, controller, service, module).
  - helpers
    - Helper functions used by the other components.
  - requests
    - Requests API (dto, entities, controller, service, module).
  - tasks
    - Scheduled tasks API (service, module).
  - users
    - Users API (dto, entities, controller, service, module).
  - utils
    - Util functions used by the other components.
  - vault
    - Legacy code when Hashicorp Vault was being considered to be used. Not used by this application version.

## Lines of code

I used [gcloc](https://github.com/JoaoDanielRufino/gcloc) to count the lines of code of this project. The result is below. It excludes third-party modules (node_modules).

```
--------------------------------------------------------------------
   Language  | Files | Lines | Blank lines | Comments | Code lines
-------------+-------+-------+-------------+----------+-------------
  Json       |    12 | 24919 |           0 |        0 |      24919
  TypeScript |   206 | 12772 |        1243 |      112 |      11417
  JavaScript |    72 |  5104 |          54 |       94 |       4956
  HTML       |     7 |   657 |          74 |        0 |        583
  CSS        |     4 |   233 |          13 |        9 |        211
  Markdown   |     1 |   258 |          65 |        0 |        193
  Python     |     1 |   124 |           9 |        0 |        115
  R          |     2 |   186 |          25 |       75 |         86
  XML        |     1 |    36 |           0 |        0 |         36
  Plain Text |     2 |    13 |           1 |        0 |         12
-------------+-------+-------+-------------+----------+-------------
    Total    |  308  | 44302 |    1484     |   290    |   42528
-------------+-------+-------+-------------+----------+-------------
```

## Team

University of Colorado - Colorado Springs (<https://uccs.edu>)

Computer Science Department (<https://eas.uccs.edu/cs>)

- Carlos Eugenio Torres (<carlos.torres@uccs.edu>) - Research Assistant - PhD student
- Dr. Shouhuai Xu (<sxu@uccs.edu>) - Project PI
- Dr. Yanyan Zhuang (<yzhuang@uccs.edu>) - Project Co PI
