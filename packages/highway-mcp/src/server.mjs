#!/usr/bin/env node
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createServer } from './create-server.mjs';
// stdout is reserved for MCP protocol messages.
serveStdio(createServer);
