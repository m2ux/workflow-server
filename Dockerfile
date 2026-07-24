# Workflow server — Node 20 runtime image.
FROM node:20-bookworm-slim@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY schemas ./schemas
RUN npm run build

FROM node:20-bookworm-slim@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY schemas ./schemas

# Defaults match scripts/start.sh + docker-compose.yml (install layout).
# Prefer start.sh/compose for binds; these ENV values keep bare `docker run` sane.
ENV WORKFLOW_SERVER_INSTALL_DIR=/var/lib/workflow-server
ENV WORKTREE_ROOT=/var/lib/workflow-server/workspace
ENV WORKFLOW_WORKSPACE=/var/lib/workflow-server/workspace
ENV WORKFLOW_SERVER_ENGINEERING_DIR=/var/lib/workflow-server/engineering
# HMAC key — must not depend on HOME (non-root --user often has HOME=/)
ENV WORKFLOW_SERVER_KEY_DIR=/var/lib/workflow-server/state
ENV HOME=/var/lib/workflow-server/state
# Leave PLANNING_SLUG unset: config chooses artifacts/planning (eng split / --repo)
# vs .engineering/artifacts/planning (legacy single-root).

RUN mkdir -p \
  /var/lib/workflow-server/workspace \
  /var/lib/workflow-server/engineering \
  /var/lib/workflow-server/state \
  /app/workflows

EXPOSE 3000

CMD ["node", "dist/index.js", "--transport=http", "--host=0.0.0.0"]
