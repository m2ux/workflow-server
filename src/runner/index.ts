import 'dotenv/config';
import { WebClient } from '@slack/web-api';
import { loadRunnerConfig } from './config.js';
import { SessionManager } from './session-manager.js';
import { createSlackApp } from './slack-bot.js';

async function main(): Promise<void> {
  const config = loadRunnerConfig();
  console.log('Runner config loaded', {
    repo: config.repo.path,
    worktreeBase: config.repo.worktreeBaseDir,
    mcpServers: Object.keys(config.mcpServers),
  });

  const slackClient = new WebClient(config.slack.botToken);
  const sessionManager = new SessionManager(config, slackClient);
  const app = createSlackApp(config, sessionManager);

  await app.start();
  console.log('Workflow Runner is listening (Socket Mode)');

  const shutdown = async () => {
    console.log('Shutting down...');
    await sessionManager.shutdownAll();
    await app.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
