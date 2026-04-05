import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const postgresConnectionConfig: PostgresConnectionOptions = {
    type: 'postgres',
    url: process.env.POSTGRES_URL,
};
