# COLEGIO LEAR

```COLEGIO LEAR``` is a project focus on student service, from administrative operations to manage the student lifecycle, unit self-service site for students.

## Docker Compose

This project uses Docker Compose to manage development containers. The configuration is defined in the `compose.yaml` file.

### Available Services

The project includes three containerized services:

1. **colegio-lear-backend-cli** - Node.js container for the backend
   - Volume: `./backend:/app`
   - Port: `3000:3000`

2. **colegio-lear-admin-web-cli** - Node.js container for the admin panel
   - Volume: `./frontend/admin-web:/app`
   - Port: `80:80`

3. **colegio-lear-student-web-cli** - Node.js container for the student web
   - Volume: `./frontend/student-web:/app`
   - Port: `80:80`

### Main Commands

#### Start a service

To start one of the available services locally you will need to run a command like the following:

```bash
docker compose run -p 3000:3000 --rm colegio-lear-backend-cli
docker compose run -p 80:80 --rm colegio-admin-web-cli
docker compose run -p 80:80 --rm colegio-student-web-cli
```

> [!NOTE]
> - Mounted volumes allow you to edit code locally and see changes in real-time
> - Port `80` is exposed on many services. If you need to run multiple services simultaneously, you will need to modify the ports in `compose.yaml`
> - Use `--rm` with `docker compose run` to automatically clean up the container after execution
> - To stop without removing volumes, use `docker compose stop`. To remove them, use `docker compose down`
