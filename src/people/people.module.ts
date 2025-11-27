import { Module } from '@nestjs/common';
import { PeopleEntity } from './people.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';

@Module({
    imports: [TypeOrmModule.forFeature([PeopleEntity])],
    exports: [TypeOrmModule],
    controllers: [PeopleController],
    providers: [PeopleService],
})
export class PeopleModule {}
