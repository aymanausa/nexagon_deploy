import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AlertGateway } from './alert.gateway';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'ews-secret-key'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AlertGateway],
  exports: [AlertGateway],
})
export class WebsocketModule {}
