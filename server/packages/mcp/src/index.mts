import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as systexPunchIn from './tools/systexPunchIn.mjs';
import * as systexTcsGetUnsubmitted from './tools/systexTcsGetUnsubmitted.mjs';
import * as systexTcsSearchProjects from './tools/systexTcsSearchProjects.mjs';
import * as systexTcsGetWorkTypes from './tools/systexTcsGetWorkTypes.mjs';
import * as systexTcsSubmit from './tools/systexTcsSubmit.mjs';
import * as systexTcsGetProjectMenus from './tools/systexTcsGetProjectMenus.mjs';

import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

const registerTool = (module: any) => ({
  name: module.name,
  description: module.description,
  inputSchema: zodToJsonSchema(module.inputSchema),
  feature: module.feature
});

const tools = [
  registerTool(systexPunchIn),
  registerTool(systexTcsGetUnsubmitted),
  registerTool(systexTcsSearchProjects),
  registerTool(systexTcsGetWorkTypes),
  registerTool(systexTcsSubmit),
  registerTool(systexTcsGetProjectMenus)
];

async function main() {
  const server = new Server(
    {
      name: 'workerrr-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    },
  );

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const tool = tools.find(t => t.name === request.params.name);
      if (!tool) {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }
      return await tool.feature(request.params.arguments ?? {});
    } catch (e) {
      const message = `Error: ${e instanceof Error ? e.message : String(e)}`;
      return {
        content: [{ type: 'text', text: message }],
        isError: true
      };
    }
  });

  server.setRequestHandler(ListToolsRequestSchema, () => {
    return {
      tools: tools.map(({ name, description, inputSchema }) => ({
        name,
        description,
        inputSchema
      }))
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});