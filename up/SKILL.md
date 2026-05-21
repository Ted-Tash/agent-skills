---
name: up
description: Stop all running containers and bring all services back up cleanly. Use when the user says /up or asks to restart all services/containers.
---

# Up — Restart All Services

Stop every running container across all projects, then bring up all services for the current project.

## Trigger

User says "/up", "up", or asks to restart/start all containers/services.

## Steps

### 1. Stop all running containers

```bash
docker ps --format '{{.ID}}' \
  | xargs --no-run-if-empty docker inspect --format '{{ index .Config.Labels "com.docker.compose.project.working_dir"}}' \
  | uniq \
  | xargs --no-run-if-empty -I % sh -c 'cd %; dip down;'
```

If no containers are running, that's fine — move on.

### 2. Bring up all services

```bash
dip up
```

### 3. Verify services are running

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

### 4. Done

Print a summary of what's running — service names, status, and any exposed ports. Keep it short.

## Failure handling

- **dip up fails** → show the error output. Common causes: port conflicts (something else is bound to a port), missing images (need `dip provision` or `docker compose build`).
- **Services exit immediately** → run `docker ps -a --filter "status=exited" --format 'table {{.Names}}\t{{.Status}}'` to show which ones died, then suggest checking logs with `dip docker logs <service>`.
