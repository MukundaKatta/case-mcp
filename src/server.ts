#!/usr/bin/env node
/**
 * case MCP server. One tool: `convert`.
 *
 * Convert a string between common identifier-case conventions: camel,
 * pascal, snake, screaming-snake (constant), kebab, train, dot, path,
 * title, lower, upper, sentence. Smart input splitting handles mixed
 * inputs like `"someXMLParser"` or `"my-Mixed_thing"`.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const VERSION = '0.1.0';

export type CaseStyle =
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'constant'
  | 'kebab'
  | 'train'
  | 'dot'
  | 'path'
  | 'title'
  | 'lower'
  | 'upper'
  | 'sentence';

export const STYLES: CaseStyle[] = [
  'camel',
  'pascal',
  'snake',
  'constant',
  'kebab',
  'train',
  'dot',
  'path',
  'title',
  'lower',
  'upper',
  'sentence',
];

/**
 * Split a mixed-case identifier into lowercased word parts.
 * Handles transitions: `someXMLParser` → ["some","xml","parser"],
 * `my-Mixed_thing` → ["my","mixed","thing"], `IPv4` → ["i","pv4"] (best-effort).
 */
export function splitWords(input: string): string[] {
  if (!input) return [];
  // Insert spaces at transitions: lower→Upper, Upper→Upper+lower, digit boundaries.
  // Unicode-aware (\p{...} with the u flag) so accented and non-Latin letters
  // such as `café` or `δοκιμή` are preserved rather than stripped.
  const s = input
    .replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, '$1 $2')
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2')
    .replace(/(\p{L})(\p{N})/gu, '$1 $2')
    .replace(/(\p{N})(\p{L})/gu, '$1 $2');
  // Replace any non-letter/non-number with space, lowercase, collapse.
  return s
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export function toCase(input: string, style: CaseStyle): string {
  const words = splitWords(input);
  if (words.length === 0) return '';
  switch (style) {
    case 'camel':
      return words[0] + words.slice(1).map(cap).join('');
    case 'pascal':
      return words.map(cap).join('');
    case 'snake':
      return words.join('_');
    case 'constant':
      return words.map((w) => w.toUpperCase()).join('_');
    case 'kebab':
      return words.join('-');
    case 'train':
      return words.map(cap).join('-');
    case 'dot':
      return words.join('.');
    case 'path':
      return words.join('/');
    case 'title':
      return words.map(cap).join(' ');
    case 'lower':
      return words.join(' ');
    case 'upper':
      return words.map((w) => w.toUpperCase()).join(' ');
    case 'sentence':
      return cap(words.join(' '));
  }
}

function cap(w: string): string {
  if (!w) return w;
  return w[0].toUpperCase() + w.slice(1);
}

const server = new Server({ name: 'case', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'convert',
    description:
      'Convert a string between case styles: camel, pascal, snake, constant, kebab, train, dot, path, title, lower, upper, sentence. Smart input splitting handles mixed-case input.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        style: {
          type: 'string',
          enum: STYLES,
          description: 'Target style.',
        },
      },
      required: ['text', 'style'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name !== 'convert') return errorResult('unknown tool: ' + name);
    const a = args as unknown as { text: string; style: CaseStyle };
    if (!STYLES.includes(a.style)) return errorResult(`unknown style: ${a.style}`);
    return jsonResult({ result: toCase(a.text, a.style) });
  } catch (err) {
    return errorResult('case tool failed: ' + (err as Error).message);
  }
});

function jsonResult(value: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`case MCP server v${VERSION} ready on stdio\n`);
}
