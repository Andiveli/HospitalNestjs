import { Module } from '@nestjs/common';
import { PeopleEntity } from './people.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';
import { RolesEntity } from '../roles/roles.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([PeopleEntity]),
        TypeOrmModule.forFeature([RolesEntity]),
    ],
    exports: [TypeOrmModule],
    controllers: [PeopleController],
    providers: [PeopleService],
})
export class PeopleModule {}
