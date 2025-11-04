import { Module } from '@nestjs/common';
import { PeopleEntity } from './people.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleController } from './people.controller';

@Module({
    imports: [TypeOrmModule.forFeature([PeopleEntity])],
    exports: [TypeOrmModule],
    controllers: [PeopleController]
})
export class PeopleModule {}
