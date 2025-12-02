import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PacientesEntity } from './pacientes.entity';
import { PeopleEntity } from 'src/people/people.entity';
import { InfoDto } from './dto/info.dto';

@Injectable()
export class PacientesService {
    constructor(
        @InjectRepository(PacientesEntity)
        private pacientesRepository: Repository<PacientesEntity>,
        @InjectRepository(PeopleEntity)
        private peopleRepository: Repository<PeopleEntity>,
    ) {}

    async addInfo(info: InfoDto, email: string) {
        // const user = await this.peopleRepository.findOne({
        //     where: { email },
        // });
        // if (!user) {
        //     throw new NotFoundException('Usuario no encontrado');
        // }
        // const existe = await this.pacientesRepository.findOne({
        //     where: { person: { id: user.id } },
        // });
        // if (existe) {
        //     const update = this.pacientesRepository.merge(existe, info);
        //     return await this.pacientesRepository.save(update);
        // }
        // const paciente = this.pacientesRepository.create({
        //     ...info,
        //     person: user,
        // });
        //
        // return await this.pacientesRepository.save(paciente);
        console.log(`Agregando la info al paciente ${email}`);
    }

    async getInfo(id: number) {
        const paciente = await this.pacientesRepository.findOne({
            where: { person: { id } },
        });
        return paciente;
    }
}
