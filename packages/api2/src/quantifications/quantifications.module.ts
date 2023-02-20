import { SettingsModule } from '@/settings/settings.module';
import { MongooseModule } from '@nestjs/mongoose';
import { QuantificationsService } from './services/quantifications.service';
import {
  Quantification,
  QuantificationsSchema,
} from './schemas/quantifications.schema';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { UsersModule } from '@/users/users.module';
import { PraiseModule } from '@/praise/praise.module';
import { PeriodsModule } from '@/periods/periods.module';
import { Module, forwardRef } from '@nestjs/common';
import { QuantificationsController } from './quantitifcations.controller';
import { QuantificationsExportService } from './services/quantifications-export.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quantification.name, schema: QuantificationsSchema },
    ]),
    forwardRef(() => PraiseModule),
    forwardRef(() => SettingsModule),
    forwardRef(() => PeriodsModule),
    forwardRef(() => UsersModule),
    UserAccountsModule,
  ],
  controllers: [QuantificationsController],
  providers: [QuantificationsService, QuantificationsExportService],
  exports: [
    QuantificationsService,
    MongooseModule.forFeature([
      { name: Quantification.name, schema: QuantificationsSchema },
    ]),
  ],
})
export class QuantificationsModule {}
