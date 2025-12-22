import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesEntity } from 'src/roles/roles.entity';
import { Repository } from 'typeorm';
import { PeopleEntity } from './people.entity';

@Injectable()
export class PeopleService {
    constructor(
        @InjectRepository(PeopleEntity)
        private peopleRepository: Repository<PeopleEntity>,
        @InjectRepository(RolesEntity)
        private rolRepository: Repository<RolesEntity>,
    ) {}
    async listarUserRol(roleName: string): Promise<PeopleEntity[]> {
        return this.peopleRepository
            .createQueryBuilder('user')
            .innerJoin('user.roles', 'role')
            .where('role.nombre = :roleName', { roleName: roleName })
            .andWhere('user.verificado = :verificado', { verificado: true })
            .leftJoinAndSelect('user.roles', 'userRoles')
            .leftJoinAndSelect('user.genero', 'genero')
            .leftJoinAndSelect('user.estado', 'estado')
            .select([
                'user.id',
                'user.cedula',
                'user.primerNombre',
                'user.segundoNombre',
                'user.primerApellido',
                'user.segundoApellido',
                'user.email',
                'user.verificado',
                'user.fechaCreacion',
                'user.imageUrl',
                'genero.id',
                'genero.nombre',
                'estado.id',
                'estado.nombre',
                'userRoles.id',
                'userRoles.nombre',
                'userRoles.descripcion',
            ])
            .getMany();
    }

    async rolToPerson(email: string, rol: string): Promise<PeopleEntity> {
        const user = await this.peopleRepository.findOne({
            where: { email },
            relations: ['roles'],
        });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        const roles = await this.rolRepository.findOne({
            where: { nombre: rol },
        });
        if (!roles) throw new NotFoundException('Rol no encontrado');
        const hasRole = user.roles.some((r) => r.nombre === rol);
        if (hasRole)
            throw new ConflictException('El usuario ya tiene este rol');
        user.roles.push(roles);
        return this.peopleRepository.save(user);
    }
}
