import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const fromIndex = args.indexOf('--from');
const toIndex = args.indexOf('--to');

if (fromIndex === -1 || toIndex === -1) {
    console.error('Usage: ts-node bin/prepublish.ts --from <source> --to <dest>');
    process.exit(1);
}

const fromDir = args[fromIndex + 1];
const toDir = args[toIndex + 1];

const pkgPath = path.join(fromDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkg.main = 'cjs/index.js';
pkg.module = 'esm/index.js';
pkg.types = 'types/index.d.ts';
pkg.exports = {
    '.': {
        import: './esm/index.js',
        require: './cjs/index.js',
        types: './types/index.d.ts',
    },
};
pkg.files = ['cjs', 'esm', 'types', 'README.md'];
delete pkg.scripts;
delete pkg.devDependencies;

fs.mkdirSync(toDir, { recursive: true });
fs.writeFileSync(path.join(toDir, 'package.json'), JSON.stringify(pkg, null, 4) + '\n');

const readmeSrc = path.join(fromDir, 'README.md');
if (fs.existsSync(readmeSrc)) {
    fs.copyFileSync(readmeSrc, path.join(toDir, 'README.md'));
}

console.log(`prepublish: wrote ${toDir}/package.json`);
