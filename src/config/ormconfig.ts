import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import path from 'path';

const projectRoot = path.resolve(__dirname, '..', '..');
const isCompiled = __filename.endsWith('.js');
const sourceRoot = isCompiled ? path.join(projectRoot, 'dist') : path.join(projectRoot, 'src');

export const postgresConnectionConfig: PostgresConnectionOptions = {
    type: 'postgres',
    url: process.env.POSTGRES_URL,
    entities: [path.join(sourceRoot, '**/entity/*.{ts,js}')],
    synchronize: false,
    // logging: process.env.NODE_ENV !== 'production',
    logging: true,
    migrationsTableName: 'migrations',
};
