# Workflow server — Node 20 runtime image. Binds WORKTREE_ROOT at startup;
# the MCP server validates paths and writes planning artifacts under that root.
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY schemas ./schemas
RUN npm run build

FROM node:20-bookworm-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY schemas ./schemas

# Required worktree / workspace root bind (alias of ServerConfig.workspaceDir).
ENV WORKTREE_ROOT=/worktrees
# Optional override; default in code is .engineering/artifacts/planning.
# ENV PLANNING_SLUG=.engineering/artifacts/planning

RUN mkdir -p /worktrees /app/workflows

# Align container UID/GID with the host user that creates worktrees under the
# RW bind mount so agent-created trees remain writable (see docker-compose.yml).
EXPOSE 3000

CMD ["node", "dist/index.js", "--transport=http", "--host=0.0.0.0"]
