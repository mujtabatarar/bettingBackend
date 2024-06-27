import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';

dotenv.config();

const caCertificate = process.env.SSL_CA_CERT?.replace(/\\n/g, '\n') ?? '';

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.POSTGRES_DB_HOST,
    port: Number(process.env.POSTGRES_DB_PORT),
    username: process.env.POSTGRES_DB_USER,
    password: process.env.POSTGRES_DB_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: ['dist/**/**.entity{.ts,.js}'],
    synchronize: true,
    migrationsRun: false,
    logging: true,
    migrations: [__dirname + '/migrations/*.ts'],
    ssl: {
        rejectUnauthorized: false,
        ca: caCertificate,
    },
    namingStrategy: new SnakeNamingStrategy(),
};
