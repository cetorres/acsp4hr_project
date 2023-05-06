import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  providers: [ConfigService]
})
export class VaultModule {}
