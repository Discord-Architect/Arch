export default `
{
  "name": "$project_name",
  "version": "$project_version",
  "description": "$project_description",
  "main": "build/index.js",
  "scripts": {
    "dev": "tsc -w",
    "build": "tsc -b",
    "start": "nodemon build/index.js"
  },
  "keywords": [],
  "author": "$project_author",
  "license": "ISC",
  "dependencies": {
    "@discord-architect/core": "^1.3.6",
    "@discord-architect/env": "^1.0.1",
    "@discord-architect/hooks": "^1.0.0",
    "@types/node": "^14.14.31",
    "discord.js": "^12.5.1",
    "execa": "^5.0.0",
    "module-alias": "^2.2.2",
    "nodemon": "^2.0.7",
    "typescript": "^4.2.2"
  },
  "_moduleAliases": {
    "App/*": "./build/src/**/*"
  }
}
`