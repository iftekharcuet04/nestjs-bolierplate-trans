# Local Installation Guide

This guide provides step-by-step instructions for setting up and running the app locally. Before proceeding, ensure that you have the frontend application and backend apps. 

## Prerequisites

Before starting the installation process, make sure you have the following prerequisites:

- Docker and Docker Compose installed on your system.
## Installation Steps

Follow these steps to set up the project locally:

## Installation Steps

Follow these steps to set up the project locally:

### Step 1

Open your project in your preferred development environment.

### Step 2

Navigate to the `ProjectFolder/docker-env/` directory.

### Step 3

1. Copy the `docker-compose.yml.example` file and rename it to `docker-compose.yml`.
2. Open the `docker-compose.yml` file and update the volume paths for your services. Replace `UPDATE_PATH` with the appropriate local path. Also, update the `environment` variable as required.

### Step 4

Run the following command to start the Docker containers:

```
sudo docker-compose up -d or sudo docker compose up -d
```

- Username: `root`
- Password: `root123`

Create a database schema named `db_name`.

### Step 5

To enter the Docker container, run the following command:

```
sudo docker exec -it container-name sh
```

Within the container, run the Prisma generate command:

```
pnpm prisma generate
```

### Step 6

To push changes in the Prisma schema to the database, use the following command:

```
npm run push:db
```

### Step 7

To check the logs, you can use the following command:

```
sudo docker logs -f container-name
```

Replace `container-name` with the name of the container you want to check.

### Additional Step

To access the Swagger API documentation, navigate to:

```
http://localhost:9393/api/nestjs-graphql-boilerplate
```

To access the Graphql API documentation, navigate to:

```
http://localhost:9393/api/nestjs-graphql-boilerplate/graphql
```
