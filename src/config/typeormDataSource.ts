import 'reflect-metadata';
import 'dotenv/config';
import path from 'path';
import { DataSource } from 'typeorm';
import { postgresConnectionConfig } from './ormconfig';

const projectRoot = path.resolve(__dirname, '..', '..');
const isCompiled = __filename.endsWith('.js');
const sourceRoot = isCompiled ? path.join(projectRoot, 'dist') : path.join(projectRoot, 'src');

const AppDataSource = new DataSource({
    ...postgresConnectionConfig,
    migrations: [path.join(sourceRoot, '**/migrations/*.{ts,js}')],
    migrationsRun: false,
    migrationsTransactionMode: 'each',
});

export default AppDataSource;
