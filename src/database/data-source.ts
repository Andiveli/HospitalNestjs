import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración de DataSource para TypeORM CLI
 *
 * Esta configuración se usa para:
 * - Generar migraciones: npm run migration:generate -- src/database/migrations/NombreMigracion
 * - Ejecutar migraciones: npm run migration:run
 * - Revertir migraciones: npm run migration:revert
 * - Ver estado: npm run migration:show
 *
 * @example
 * # Generar una nueva migración
 * npm run migration:generate -- src/database/migrations/CreateVideollamadasTables
 *
 * # Ejecutar migraciones pendientes
 * npm run migration:run
 */
export const dataSourceOptions: DataSourceOptions = {
    type: (process.env.DB_TYPE as 'mysql' | 'postgres' | 'mariadb') || 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'hospital',
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/database/migrations/*.js'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
