import { NestFactory, Reflector } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { setupSwagger } from './swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const reflector = app.get(Reflector);
  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: true,
    }),
  )

  app.enableCors({
    origin: ['http://localhost:5173', 'https://hr0z8kcl-5173.asse.devtunnels.ms'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })


  app.useGlobalInterceptors(new ResponseInterceptor(reflector)) // chuẩn hóa response

  setupSwagger(app); // swagger
  const port = process.env.PORT ?? 3000
  await app.listen(port)

  console.log(`🚀 Server running on http://localhost:${port}`)
}

bootstrap()
