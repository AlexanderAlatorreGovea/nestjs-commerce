import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'user/user.entity';
import { IdeaController } from './idea.controller';
import { IdeaEntity } from './idea.entity';
import { IdeaResolver } from './idea.resolver';
import { IdeaService } from './idea.service';

@Module({
  imports: [TypeOrmModule.forFeature([IdeaEntity, UserEntity])],
  controllers: [IdeaController],
  providers: [IdeaService, IdeaResolver],
})
export class IdeaModule {}
