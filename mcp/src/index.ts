import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as systexPunchIn from './tools/systexPunchIn';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';



async function main() {
  const server = new Server({
    name: "workerrr-mcp-server",
    version: "1.0.0"
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      switch (request.params.name) {
        case systexPunchIn.name:
          return systexPunchIn.feature();
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (e) {
      const message = `Error: ${e instanceof Error ? e.message : String(e)}`;
      return {
        content: [{ type: 'text', text: message }],
        isError: true
      };
    }
  })

  server.setRequestHandler(ListToolsRequestSchema, () => {
    return {
      tools: [
        {
          name: systexPunchIn.name,
          description: systexPunchIn.description,
          inputSchema: systexPunchIn.inputSchema
        }
      ]
    }
  })

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});