import { Module, forwardRef } from '@nestjs/common';
import { PeriodSettingsService } from './periodsettings.service';
import { PeriodSettingsController } from './periodsettings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PeriodSetting,
  PeriodSettingsSchema,
} from './schemas/periodsettings.schema';
import { PeriodsModule } from '@/periods/periods.module';
import { UtilsProvider } from '@/utils/utils.provider';
import { ConstantsProvider } from '@/constants/constants.provider';
import { EventLogModule } from '@/event-log/event-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PeriodSetting.name, schema: PeriodSettingsSchema },
    ]),
    // forwardRef(() => PeriodsModule),
    EventLogModule,
  ],
  controllers: [PeriodSettingsController],
  providers: [PeriodSettingsService, UtilsProvider, ConstantsProvider],
  exports: [
    PeriodSettingsService,
    MongooseModule.forFeature([
      { name: PeriodSetting.name, schema: PeriodSettingsSchema },
    ]),
  ],
})
export class PeriodSettingsModule {}