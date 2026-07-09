---
name: up
description: Stop all running containers and bring all services back up cleanly. Use when the user says /up or asks to restart all services/containers.
---

# Up — Restart All Services

Stop running Docker Compose projects and bring up services for the current project.

## Non-negotiable first response

When this skill is triggered, your first action must be a plain-text reply to the user before running Docker, `dip`, shell commands, or service checks.

The first response should include:

- That you are going to stop currently running containers.
- That you are going to start this project's services.
- Any risk, such as interrupting work in other local projects.

Keep it short. The purpose is to let the user stop you before containers are stopped.

If the request is clear, send the plan and proceed.

## Steps

### 1. Announce the plan

Reply first. Do not run Docker commands before this response.

### 2. Stop all running containers

```bash
docker ps --format '{{.ID}}' \
  | xargs --no-run-if-empty docker inspect --format '{{ index .Config.Labels "com.docker.compose.project.working_dir"}}' \
  | uniq \
  | xargs --no-run-if-empty -I % sh -c 'cd %; dip down;'
```

If no containers are running, continue.

### 3. Bring up services

```bash
dip up
```

### 4. Verify services

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

### 5. Final response

Summarize:

- Services that are running.
- Status.
- Exposed ports.
- Any services that exited.

## Failure handling

- If `dip up` fails, show the error and stop.
- If services exit immediately, show exited containers:

```bash
docker ps -a --filter "status=exited" --format 'table {{.Names}}\t{{.Status}}'
```

Then suggest checking logs with `dip docker logs <service>`.
