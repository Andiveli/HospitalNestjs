import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from 'typeorm';

/**
 * Migración para crear las tablas del módulo de videollamadas
 *
 * Tablas creadas:
 * - estados_sesion: Estados posibles de una sesión (activa, finalizada, cancelada)
 * - roles_sesion: Roles de participantes (medico, paciente, invitado, acompanante)
 * - tipos_mensaje: Tipos de mensaje en chat (texto, imagen, archivo, audio)
 * - sesiones_consulta: Sesiones de videollamada vinculadas a citas
 * - participantes_sesion: Participantes en cada sesión
 * - mensajes_chat: Mensajes del chat durante la videollamada
 * - invitaciones_videollamada: Invitaciones para acceso de invitados
 */
export class CreateVideollamadasTables1706900000000
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Tabla de estados de sesión
        await queryRunner.createTable(
            new Table({
                name: 'estados_sesion',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'nombre',
                        type: 'varchar',
                        length: '150',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        // 2. Tabla de roles de sesión
        await queryRunner.createTable(
            new Table({
                name: 'roles_sesion',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'nombre',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        // 3. Tabla de tipos de mensaje
        await queryRunner.createTable(
            new Table({
                name: 'tipos_mensaje',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'nombre',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        // 4. Tabla de sesiones de consulta (videollamadas)
        await queryRunner.createTable(
            new Table({
                name: 'sesiones_consulta',
                columns: [
                    {
                        name: 'cita_id',
                        type: 'int',
                        isPrimary: true,
                    },
                    {
                        name: 'nombre',
                        type: 'varchar',
                        length: '150',
                        isNullable: false,
                    },
                    {
                        name: 'fecha_hora_inicio',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'fecha_hora_fin',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'grabacion_url',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'estado_id',
                        type: 'int',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        // 5. Tabla de participantes de sesión
        await queryRunner.createTable(
            new Table({
                name: 'participantes_sesion',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'nombre',
                        type: 'varchar',
                        length: '150',
                        isNullable: true,
                    },
                    {
                        name: 'token_acceso',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'fecha_hora_union',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'fecha_hora_salida',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'mic_activo',
                        type: 'boolean',
                        default: true,
                        isNullable: true,
                    },
                    {
                        name: 'camara_activa',
                        type: 'boolean',
                        default: true,
                        isNullable: true,
                    },
                    {
                        name: 'compartiendo_pantalla',
                        type: 'boolean',
                        default: false,
                        isNullable: true,
                    },
                    {
                        name: 'rol_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'usuario_id',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'sesion_id',
                        type: 'int',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        // 6. Tabla de mensajes del chat
        await queryRunner.createTable(
            new Table({
                name: 'mensajes_chat',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'contenido_texto',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'contenido_url',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'fecha_hora_envio',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'eliminado',
                        type: 'boolean',
                        default: false,
                        isNullable: false,
                    },
                    {
                        name: 'tipo_mensaje_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'sesion_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'participante_id',
                        type: 'int',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        // 7. Tabla de invitaciones a videollamada
        await queryRunner.createTable(
            new Table({
                name: 'invitaciones_videollamada',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'codigo_acceso',
                        type: 'varchar',
                        length: '32',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'nombre_invitado',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'rol_invitado',
                        type: 'varchar',
                        length: '50',
                        default: "'invitado'",
                        isNullable: false,
                    },
                    {
                        name: 'fecha_hora_creacion',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'fecha_hora_expiracion',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'fecha_hora_uso',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'activo',
                        type: 'boolean',
                        default: true,
                        isNullable: false,
                    },
                    {
                        name: 'usado',
                        type: 'boolean',
                        default: false,
                        isNullable: false,
                    },
                    {
                        name: 'cita_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'invitado_por_id',
                        type: 'int',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        // Foreign Keys para sesiones_consulta
        await queryRunner.createForeignKey(
            'sesiones_consulta',
            new TableForeignKey({
                columnNames: ['cita_id'],
                referencedTableName: 'citas',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                name: 'FK_sesiones_consulta_cita',
            }),
        );

        await queryRunner.createForeignKey(
            'sesiones_consulta',
            new TableForeignKey({
                columnNames: ['estado_id'],
                referencedTableName: 'estados_sesion',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT',
                name: 'FK_sesiones_consulta_estado',
            }),
        );

        // Foreign Keys para participantes_sesion
        await queryRunner.createForeignKey(
            'participantes_sesion',
            new TableForeignKey({
                columnNames: ['rol_id'],
                referencedTableName: 'roles_sesion',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT',
                name: 'FK_participantes_sesion_rol',
            }),
        );

        await queryRunner.createForeignKey(
            'participantes_sesion',
            new TableForeignKey({
                columnNames: ['usuario_id'],
                referencedTableName: 'people',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
                name: 'FK_participantes_sesion_usuario',
            }),
        );

        await queryRunner.createForeignKey(
            'participantes_sesion',
            new TableForeignKey({
                columnNames: ['sesion_id'],
                referencedTableName: 'sesiones_consulta',
                referencedColumnNames: ['cita_id'],
                onDelete: 'CASCADE',
                name: 'FK_participantes_sesion_sesion',
            }),
        );

        // Foreign Keys para mensajes_chat
        await queryRunner.createForeignKey(
            'mensajes_chat',
            new TableForeignKey({
                columnNames: ['tipo_mensaje_id'],
                referencedTableName: 'tipos_mensaje',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT',
                name: 'FK_mensajes_chat_tipo',
            }),
        );

        await queryRunner.createForeignKey(
            'mensajes_chat',
            new TableForeignKey({
                columnNames: ['sesion_id'],
                referencedTableName: 'sesiones_consulta',
                referencedColumnNames: ['cita_id'],
                onDelete: 'CASCADE',
                name: 'FK_mensajes_chat_sesion',
            }),
        );

        await queryRunner.createForeignKey(
            'mensajes_chat',
            new TableForeignKey({
                columnNames: ['participante_id'],
                referencedTableName: 'participantes_sesion',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
                name: 'FK_mensajes_chat_participante',
            }),
        );

        // Foreign Keys para invitaciones_videollamada
        await queryRunner.createForeignKey(
            'invitaciones_videollamada',
            new TableForeignKey({
                columnNames: ['cita_id'],
                referencedTableName: 'citas',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                name: 'FK_invitaciones_videollamada_cita',
            }),
        );

        await queryRunner.createForeignKey(
            'invitaciones_videollamada',
            new TableForeignKey({
                columnNames: ['invitado_por_id'],
                referencedTableName: 'people',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                name: 'FK_invitaciones_videollamada_invitado_por',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar foreign keys en orden inverso
        await queryRunner.dropForeignKey(
            'invitaciones_videollamada',
            'FK_invitaciones_videollamada_invitado_por',
        );
        await queryRunner.dropForeignKey(
            'invitaciones_videollamada',
            'FK_invitaciones_videollamada_cita',
        );
        await queryRunner.dropForeignKey(
            'mensajes_chat',
            'FK_mensajes_chat_participante',
        );
        await queryRunner.dropForeignKey(
            'mensajes_chat',
            'FK_mensajes_chat_sesion',
        );
        await queryRunner.dropForeignKey(
            'mensajes_chat',
            'FK_mensajes_chat_tipo',
        );
        await queryRunner.dropForeignKey(
            'participantes_sesion',
            'FK_participantes_sesion_sesion',
        );
        await queryRunner.dropForeignKey(
            'participantes_sesion',
            'FK_participantes_sesion_usuario',
        );
        await queryRunner.dropForeignKey(
            'participantes_sesion',
            'FK_participantes_sesion_rol',
        );
        await queryRunner.dropForeignKey(
            'sesiones_consulta',
            'FK_sesiones_consulta_estado',
        );
        await queryRunner.dropForeignKey(
            'sesiones_consulta',
            'FK_sesiones_consulta_cita',
        );

        // Eliminar tablas en orden inverso (dependencias primero)
        await queryRunner.dropTable('invitaciones_videollamada', true);
        await queryRunner.dropTable('mensajes_chat', true);
        await queryRunner.dropTable('participantes_sesion', true);
        await queryRunner.dropTable('sesiones_consulta', true);
        await queryRunner.dropTable('tipos_mensaje', true);
        await queryRunner.dropTable('roles_sesion', true);
        await queryRunner.dropTable('estados_sesion', true);
    }
}
