import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const pIndex = args.indexOf('-p');

if (pIndex === -1) {
    console.error('Usage: ts-node bin/npm-dev-version.ts -p <package-dir>');
    process.exit(1);
}

const pkgDir = args[pIndex + 1];
const pkgPath = path.join(pkgDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const currentVersion: string = pkg.version;
const devMatch = currentVersion.match(/^(\d+\.\d+\.\d+)-dev\.(\d+)$/);
const stableMatch = currentVersion.match(/^(\d+\.\d+\.\d+)$/);

let newVersion: string;
if (devMatch) {
    const [, base, devNum] = devMatch;
    newVersion = `${base}-dev.${parseInt(devNum) + 1}`;
} else if (stableMatch) {
    const [, base] = stableMatch;
    newVersion = `${base}-dev.0`;
} else {
    console.error(`Cannot parse version: ${currentVersion}`);
    process.exit(1);
}

pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n');
console.log(`Bumped version: ${currentVersion} → ${newVersion}`);
