const fs = require('fs');
const os = require('os');
const path = require('path');

const npmrc = path.resolve(process.cwd(), '.npmrc');

const registryUrl = String(process.env.REGISTRY_URL);
const scope = String(process.env.GITHUB_SCOPE).toLowerCase();

const authString = registryUrl.replace(/(^\w+:|^)/, '') + ':_authToken=${GITHUB_TOKEN}';
const registryString = `${scope}:registry=${registryUrl}`;

const contents = `${authString}${os.EOL}${registryString}${os.EOL}`;

fs.writeFileSync(npmrc, contents);