import { Test, TestingModule } from '@nestjs/testing';
import {
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CitasService } from './citas.service';
import { CitaRepository } from './repositories/cita.repository';
import { MedicoEntity } from '../medicos/medicos.entity';
import { HorarioMedicoEntity } from '../horario/horario-medico.entity';
import { CITA_ESTADO } from './citas.entity';
import { CreateCitaDto } from './dto/create-cita.dto';
import { ConsultarDisponibilidadDto } from './dto/consultar-disponibilidad.dto';

describe('CitasService', () => {
    let service: CitasService;
    let citaRepository: jest.Mocked<CitaRepository>;
    let medicoRepository: jest.Mocked<Repository<MedicoEntity>>;
    let horarioRepository: jest.Mocked<Repository<HorarioMedicoEntity>>;

    const mockMedicoEntity = {
        usuarioId: 1,
        persona: {
            primerNombre: 'Juan',
            primerApellido: 'Pérez',
        },
        especialidades: [{ nombre: 'Cardiología' }],
        licenciaMedica: 'MED12345',
    } as any;

    const mockHorarioEntity = {
        id: 1,
        horaInicio: '08:00',
        horaFin: '12:00',
        dia: { id: 1 }, // Lunes
    } as any;

    const mockCitaEntity = {
        id: 1,
        estado: CITA_ESTADO.PENDIENTE,
        fechaHoraInicio: new Date('2024-01-15T10:00:00.000Z'),
        fechaHoraFin: new Date('2024-01-15T10:30:00.000Z'),
        motivoCita: 'Consulta de rutina',
        telefonica: false,
        createdAt: new Date('2024-01-10T08:00:00.000Z'),
        updatedAt: new Date('2024-01-10T08:00:00.000Z'),
        medico: mockMedicoEntity,
        paciente: {
            usuarioId: 2,
            person: {
                primerNombre: 'María',
                primerApellido: 'González',
            },
            fechaNacimiento: new Date('1985-05-15'),
            numeroCelular: '1234567890',
        },
    } as any;

    beforeEach(async () => {
        const mockCitaRepository = {
            create: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
            existsCitaSolapada: jest.fn(),
            findCitasPendientesByPaciente: jest.fn(),
            findCitasAtendidasByPaciente: jest.fn(),
            findCitasEnRango: jest.fn(),
        } as any;

        const mockMedicoRepository = {
            findOne: jest.fn(),
        } as any;

        const mockHorarioRepository = {
            find: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CitasService,
                {
                    provide: CitaRepository,
                    useValue: mockCitaRepository,
                },
                {
                    provide: Repository,
                    useValue: mockMedicoRepository,
                },
                {
                    provide: 'MedicoEntityRepository',
                    useValue: mockMedicoRepository,
                },
                {
                    provide: 'HorarioMedicoEntityRepository',
                    useValue: mockHorarioRepository,
                },
            ],
        }).compile();

        service = module.get<CitasService>(CitasService);
        citaRepository = module.get(CitaRepository);
        medicoRepository = module.get('MedicoEntityRepository');
        horarioRepository = module.get('HorarioMedicoEntityRepository');
    });

    describe('createCita', () => {
        it('should create a cita successfully', async () => {
            const createCitaDto: CreateCitaDto = {
                medicoId: 1,
                fechaHoraInicio: '2024-01-15T10:00:00.000Z',
                fechaHoraFin: '2024-01-15T10:30:00.000Z',
                motivoCita: 'Consulta de rutina',
                telefonica: false,
            };

            medicoRepository.findOne.mockResolvedValue(mockMedicoEntity);
            citaRepository.existsCitaSolapada.mockResolvedValue(false);
            citaRepository.create.mockResolvedValue(mockCitaEntity);

            const result = await service.createCita(createCitaDto, 2);

            expect(result).toBeDefined();
            expect(result.motivoCita).toBe(createCitaDto.motivoCita);
            expect(medicoRepository.findOne).toHaveBeenCalledWith({
                where: { usuarioId: 1 },
                relations: ['persona'],
            });
        });

        it('should throw NotFoundException if medico does not exist', async () => {
            const createCitaDto: CreateCitaDto = {
                medicoId: 999,
                fechaHoraInicio: '2024-01-15T10:00:00.000Z',
                fechaHoraFin: '2024-01-15T10:30:00.000Z',
                motivoCita: 'Consulta de rutina',
                telefonica: false,
            };

            medicoRepository.findOne.mockResolvedValue(null);

            await expect(service.createCita(createCitaDto, 2)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw ConflictException if cita is solapada', async () => {
            const createCitaDto: CreateCitaDto = {
                medicoId: 1,
                fechaHoraInicio: '2024-01-15T10:00:00.000Z',
                fechaHoraFin: '2024-01-15T10:30:00.000Z',
                motivoCita: 'Consulta de rutina',
                telefonica: false,
            };

            medicoRepository.findOne.mockResolvedValue(mockMedicoEntity);
            citaRepository.existsCitaSolapada.mockResolvedValue(true);

            await expect(service.createCita(createCitaDto, 2)).rejects.toThrow(
                ConflictException,
            );
        });

        it('should throw BadRequestException if fechaInicio is after fechaFin', async () => {
            const createCitaDto: CreateCitaDto = {
                medicoId: 1,
                fechaHoraInicio: '2024-01-15T11:00:00.000Z',
                fechaHoraFin: '2024-01-15T10:30:00.000Z',
                motivoCita: 'Consulta de rutina',
                telefonica: false,
            };

            medicoRepository.findOne.mockResolvedValue(mockMedicoEntity);

            await expect(service.createCita(createCitaDto, 2)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('consultarDisponibilidad', () => {
        it('should return disponibilidad for medico', async () => {
            const consultarDisponibilidadDto: ConsultarDisponibilidadDto = {
                medicoId: 1,
                fechaInicio: '2024-01-15',
                fechaFin: '2024-01-20',
            };

            medicoRepository.findOne.mockResolvedValue(mockMedicoEntity);
            horarioRepository.find.mockResolvedValue([mockHorarioEntity]);
            citaRepository.findCitasEnRango.mockResolvedValue([]);

            const result = await service.consultarDisponibilidad(
                consultarDisponibilidadDto,
            );

            expect(result).toBeDefined();
            expect(result.medicoId).toBe(1);
            expect(result.nombreMedico).toBe('Dr. Juan Pérez');
            expect(result.especialidad).toBe('Cardiología');
        });

        it('should throw NotFoundException if medico does not exist', async () => {
            const consultarDisponibilidadDto: ConsultarDisponibilidadDto = {
                medicoId: 999,
                fechaInicio: '2024-01-15',
                fechaFin: '2024-01-20',
            };

            medicoRepository.findOne.mockResolvedValue(null);

            await expect(
                service.consultarDisponibilidad(consultarDisponibilidadDto),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('getCitaById', () => {
        it('should return cita if belongs to paciente', async () => {
            citaRepository.findById.mockResolvedValue(mockCitaEntity);

            const result = await service.getCitaById(1, 2);

            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(citaRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if cita does not exist', async () => {
            citaRepository.findById.mockResolvedValue(null);

            await expect(service.getCitaById(999, 2)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw ForbiddenException if cita does not belong to paciente', async () => {
            const citaWithDifferentPaciente = {
                ...mockCitaEntity,
                paciente: { usuarioId: 999 },
            };
            citaRepository.findById.mockResolvedValue(
                citaWithDifferentPaciente,
            );

            await expect(service.getCitaById(1, 2)).rejects.toThrow(
                'No tienes acceso a esta cita',
            );
        });
    });
});
