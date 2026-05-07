import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST') || 'localhost',
        port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
        username: config.get<string>('DB_USERNAME') || 'postgres',
        password: config.get<string>('DB_PASSWORD') || 'postgres',
        database: config.get<string>('DB_NAME') || 'souvenote',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development',
        ssl: { rejectUnauthorized: false },
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
