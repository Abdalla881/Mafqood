import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MongooseValidationFilter } from './common/filters/mongoose-validation.filter';
import { AppModule } from './app.module';
import 'module-alias/register';
import morgan from 'morgan';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new MongooseValidationFilter());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://mafqood.vercel.app',
        'http://localhost:8080',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Application is running on port ${process.env.PORT ?? 3000}`);
}

bootstrap();
