import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PeopleEntity } from './people.entity';
import { Repository } from 'typeorm';
import { CrearDto } from './dto/crear.dto';

@Injectable()
export class PeopleService {

    constructor(
        @InjectRepository(PeopleEntity)
        private peopleRepository: Repository<PeopleEntity>,
    ) {}

    async crearPaciente(paciente: CrearDto) : Promise<PeopleEntity> {
        const existe = await this.peopleRepository.findOne({ where: { email: paciente.email } });
        if(!existe) {
            throw new HttpException('El usuario no existe', HttpStatus.BAD_REQUEST);
        }
        existe.rol = paciente.rol;
        return this.peopleRepository.save(existe);
    }
    
    async crearMedico(medico: CrearDto) : Promise<PeopleEntity> {
        const existe = await this.peopleRepository.findOne({ where: { email: medico.email } });
        if(!existe) {
            throw new HttpException('El usuario no existe', HttpStatus.BAD_REQUEST);
        }
        existe.rol = medico.rol;
        return this.peopleRepository.save(existe);
    }

    async listarMedicos() : Promise<PeopleEntity[]> {
        return this.peopleRepository.find({ where: { rol: 'medico' } });
    }

    async listarPacientes() : Promise<PeopleEntity[]> {
        return this.peopleRepository.find({ where: { rol: 'paciente' } });
    }
}
