import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as systexPunchIn from './tools/systexPunchIn';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

const tools = [
  {
    name: systexPunchIn.name,
    description: systexPunchIn.description,
    inputSchema: zodToJsonSchema(systexPunchIn.inputSchema),
    feature: systexPunchIn.feature
  }
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
      return await tool.feature(request.params.input ?? {});
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