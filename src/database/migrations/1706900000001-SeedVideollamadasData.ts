import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para insertar los datos iniciales (seed) del módulo de videollamadas
 *
 * Datos insertados:
 * - Estados de sesión: activa, finalizada, cancelada
 * - Roles de sesión: medico, paciente, invitado, acompanante, especialista
 * - Tipos de mensaje: texto, imagen, archivo, audio, video
 */
export class SeedVideollamadasData1706900000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insertar estados de sesión
        await queryRunner.query(`
            INSERT INTO estados_sesion (nombre) VALUES 
            ('activa'),
            ('finalizada'),
            ('cancelada'),
            ('pausada')
        `);

        // Insertar roles de sesión
        await queryRunner.query(`
            INSERT INTO roles_sesion (nombre) VALUES 
            ('medico'),
            ('paciente'),
            ('invitado'),
            ('acompanante'),
            ('especialista')
        `);

        // Insertar tipos de mensaje
        await queryRunner.query(`
            INSERT INTO tipos_mensaje (nombre) VALUES 
            ('texto'),
            ('imagen'),
            ('archivo'),
            ('audio'),
            ('video'),
            ('sistema')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar datos de seed (en orden inverso por si hay dependencias)
        await queryRunner.query(`DELETE FROM tipos_mensaje`);
        await queryRunner.query(`DELETE FROM roles_sesion`);
        await queryRunner.query(`DELETE FROM estados_sesion`);
    }
}
