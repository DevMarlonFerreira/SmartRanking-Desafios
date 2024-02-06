import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices'
// import { Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config'

// const logger = new Logger('Main')
// const configService = new ConfigService()

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.AMQPS],    
      noAck: false,
      queue: 'desafios'
    },
  });

  await app.listen();
}
bootstrap();
