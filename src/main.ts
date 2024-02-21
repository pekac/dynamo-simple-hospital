import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
/* dynamo */
import { applyMigrations } from './dynamo/migration-controller';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(3000);
  applyMigrations();
}
bootstrap();
