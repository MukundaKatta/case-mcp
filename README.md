# case-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/case-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/case-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

MCP server: convert a string between case styles. Smart splitting handles
mixed-case identifiers like `someXMLParser` and `my-Mixed_thing`.

## Tool

### `convert`

```json
{ "text": "someXMLParser", "style": "snake" }
```

→ `{ "result": "some_xml_parser" }`

Supported styles: `camel`, `pascal`, `snake`, `constant`, `kebab`, `train`,
`dot`, `path`, `title`, `lower`, `upper`, `sentence`.

| Style       | Example output         |
|-------------|------------------------|
| camel       | `helloWorld`           |
| pascal      | `HelloWorld`           |
| snake       | `hello_world`          |
| constant    | `HELLO_WORLD`          |
| kebab       | `hello-world`          |
| train       | `Hello-World`          |
| dot         | `hello.world`          |
| path        | `hello/world`          |
| title       | `Hello World`          |
| sentence    | `Hello world`          |

## Configure

```json
{ "mcpServers": { "case": { "command": "npx", "args": ["-y", "@mukundakatta/case-mcp"] } } }
```

## License

MIT.
