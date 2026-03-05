import 'dotenv/config';
import { WebClient } from '@slack/web-api';
import { loadRunnerConfig } from './config.js';
import { logger } from './logger.js';
import { SessionManager } from './session-manager.js';
import { SessionStore } from './session-store.js';
import { createSlackApp } from './slack-bot.js';

async function main(): Promise<void> {
  const config = loadRunnerConfig();
  logger.info({
    repo: config.repo.path,
    worktreeBase: config.repo.worktreeBaseDir,
    mcpServers: Object.keys(config.mcpServers),
  }, 'Runner config loaded');

  const store = new SessionStore();
  store.open(config.dbPath ?? 'data/runner.db');

  const slackClient = new WebClient(config.slack.botToken);
  const sessionManager = new SessionManager(config, slackClient, store);
  const app = createSlackApp(config, sessionManager);

  await app.start();
  logger.info('Workflow Runner is listening (Socket Mode)');

  const shutdown = async () => {
    logger.info('Shutting down...');
    await sessionManager.shutdownAll();
    store.close();
    await app.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

main().catch((err) => {
  logger.fatal({ err }, 'Fatal error');
  process.exit(1);
});
