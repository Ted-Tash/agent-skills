---
name: up
description: Stop all running containers and bring all services back up cleanly. Use when the user says /up or asks to restart all services/containers.
---

# Up — Restart All Services

Stop running Docker Compose projects and bring up services for the current project, then return promptly with a status summary.

## Non-negotiable first response

When this skill is triggered, your first action must be a plain-text reply to the user before running Docker, `dip`, shell commands, or service checks.

The first response should include:

- That you are going to stop currently running containers.
- That you are going to start this project's services in detached/background mode when possible.
- That you will run a bounded status check and return instead of tailing logs forever.
- Any risk, such as interrupting work in other local projects.

Keep it short. The purpose is to let the user stop you before containers are stopped.

If the request is clear, send the plan and proceed.

## Important rule: do not hang

Do not run an unbounded foreground `dip up` that can attach to logs and wait forever.

Prefer a detached/background start. After starting services, run bounded checks and return a concise summary.

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

### 3. Bring up services without attaching forever

Use the first detached command that works for the project.

Try:

```bash
dip up -d
```

If that is not supported, try the project's Docker Compose wrapper or direct compose command:

```bash
dip compose up -d
```

or:

```bash
docker compose up -d
```

Do not leave a foreground `dip up` running indefinitely. If you must use a command that may attach, wrap it with a short timeout and then verify containers:

```bash
timeout 60s dip up
```

If `timeout` exits because the app is already running, do not assume failure. Continue to verification and decide from container status.

### 4. Verify services with bounded checks

Check running containers:

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

Check exited containers:

```bash
docker ps -a --filter "status=exited" --format 'table {{.Names}}\t{{.Status}}'
```

If the app has a known local HTTP port, run a bounded HTTP check. Prefer the port exposed by `docker ps`; otherwise use common defaults like `3000`.

Example:

```bash
timeout 10s bash -lc 'until curl -fsS http://localhost:3000 >/dev/null; do sleep 1; done'
```

If the HTTP check fails but containers are still starting, report that services are up/starting rather than spinning forever.

### 5. Final response

Return promptly. Summarize:

- Services that are running.
- Status.
- Exposed ports.
- Whether any HTTP check passed.
- Any services that exited.
- How to inspect logs if needed.

## Failure handling

- If detached startup fails, show the error and try the next detached startup option if appropriate.
- If all startup options fail, stop and report the command output.
- If services exit immediately, show exited containers and suggest checking logs:

```bash
dip docker logs <service>
```

- If services are running but the HTTP check fails, do not keep waiting forever. Tell the user the containers are running and include the ports/status so they can check the browser.
