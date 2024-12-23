import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { I18nMiddleware } from 'nestjs-i18n';
import { CoreModule } from './_core/core.module';
import { CaslModule } from './casl/casl.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomerModule } from './modules/customer/customer.module';
import { PublicModule } from './modules/public/public.module';
import { RepositoriesModule } from './repositories/repositories.module';

@Module({
  imports: [CoreModule, AuthModule, CaslModule, AdminModule, CustomerModule, PublicModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(I18nMiddleware).forRoutes('*');
  }
}
