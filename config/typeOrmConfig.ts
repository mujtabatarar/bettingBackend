// import { TypeOrmModuleOptions } from "@nestjs/typeorm";
// // import { SnakeNamingStrategy } from "./snake-naming.strategy";
// import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// require('dotenv').config();

// export const typeOrmConfig: TypeOrmModuleOptions = {
//     type: 'mysql',
//     host: process.env.MYSQL_DB_HOST,
//     port: Number(process.env.MYSQL_DB_PORT),
//     username: process.env.MYSQL_DB_USER,
//     password: process.env.MYSQL_DB_PASSWORD,
//     database: process.env.MYSQL_DB,
//     entities: ['dist/**/**.entity{.ts,.js}'],
//     synchronize: true,
//     migrationsRun: false,
//     logging: true,
//     migrations: [__dirname + '/migrations/*.ts'],
//     namingStrategy: new SnakeNamingStrategy(),

// };

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';

dotenv.config();

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
        rejectUnauthorized: false
    },
    extra: {
        options: `project=${process.env.ENDPOINT_ID}`,
    },
    // namingStrategy: new SnakeNamingStrategy(),
};