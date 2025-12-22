import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicoDto } from './dto/medico.dto';
import { MedicoEntity } from './medicos.entity';

@Injectable()
export class MedicosService {
    constructor(
        @InjectRepository(MedicoEntity)
        private medicoRepository: Repository<MedicoEntity>,
    ) {}

    async addInfo(body: MedicoDto): Promise<void> {}
}
