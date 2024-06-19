import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReviewModule } from './modules/review/review.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'config/typeOrmConfig';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { BetsModule } from './modules/bets/bets.module';
import appConfiguration from 'config/appConfig';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from 'config/mailer.config';
import appConfig from 'config/appConfig';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { AuthMiddleware } from 'helpers/auth.moddleware';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({
      load: [appConfiguration],
    }),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: appConfig().smtpHost,
          port: Number(appConfig().smtpPort),
          secure: appConfig().smtpSecure === 'true',
          auth: {
            user: appConfig().smtpUsername,
            pass: appConfig().smtpPassword,
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        template: {
          dir: 'src/templates/',
          adapter: new EjsAdapter(),
        },
      }),
    }),
    JwtModule.register({
      secret: appConfig().JwtSecret,
      signOptions: { expiresIn: '1h' },
    }),
    ReviewModule,
    UsersModule,
    BetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude('api/user/register', 'api/user/login', 'api/user/forget-password', 'api/user/reset-password') // Exclude login and signup routes
      .forRoutes('*'); // Apply middleware to all routes
  }
}
