import { ServiceException } from '@/shared/service-exception';
import { UtilsProvider } from '@/utils/utils.provider';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model, Types } from 'mongoose';
import { PeriodSetting } from './schemas/periodsettings.schema';
import { SetPeriodSettingDto } from './dto/set-periodsetting.dto';
import { UploadedFile } from 'express-fileupload';
import { PeriodsService } from '@/periods/periods.service';
import { PeriodStatusType } from '@/periods/enums/status-type.enum';
import { EventLogService } from '@/event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';

@Injectable()
export class PeriodSettingsService {
  constructor(
    @InjectModel(PeriodSetting.name)
    private periodSettingsModel: Model<PeriodSetting>,
    // private periodsService: PeriodsService,
    private utils: UtilsProvider,
    private eventLogService: EventLogService,
  ) {}

  /**
   * Convenience method to get the PeriodSettings Model
   * @returns
   */
  getModel(): Model<PeriodSetting> {
    return this.periodSettingsModel;
  }

  // async findAll(periodId: Types.ObjectId): Promise<PeriodSetting[]> {
  //   const period = await this.periodsService.findOneById(periodId);

  //   const settings = await this.periodSettingsModel
  //     .find({ period: period._id })
  //     .lean();
  //   return settings.map((setting) => new PeriodSetting(setting));
  // }

  // async findOneById(
  //   settingId: Types.ObjectId,
  //   periodId: Types.ObjectId,
  // ): Promise<PeriodSetting> {
  //   await this.periodsService.findOneById(periodId);

  //   const periodSetting = await this.periodSettingsModel
  //     .findOne({ id: settingId, period: periodId })
  //     .lean();

  //   if (!periodSetting) throw new ServiceException('PeriodSetting not found.');
  //   return new PeriodSetting(periodSetting);
  // }

  // async findOne(
  //   key: string,
  //   periodId: Types.ObjectId | undefined = undefined,
  // ): Promise<PeriodSetting | null> {
  //   return await this.periodSettingsModel.findOne({
  //     key,
  //     period: periodId,
  //   });
  // }

  // async setOne(
  //   settingId: Types.ObjectId,
  //   periodId: Types.ObjectId,
  //   req: Request,
  //   data: SetPeriodSettingDto,
  // ): Promise<PeriodSetting> {
  //   const period = await this.periodsService.findOneById(periodId);

  //   if (period.status !== PeriodStatusType.OPEN)
  //     throw new ServiceException(
  //       'Period settings can only be changed when period status is OPEN.',
  //     );

  //   const periodSetting = await this.periodSettingsModel.findOne({
  //     _id: settingId,
  //     period: periodId,
  //   });

  //   if (!periodSetting) throw new ServiceException('PeriodSettings not found.');

  //   const originalValue = periodSetting.value;

  //   if (periodSetting.type === 'Image') {
  //     const file = req.files;
  //     if (!file) {
  //       throw new ServiceException('Uploaded file is missing.');
  //     }

  //     const logo: UploadedFile = file['value'] as UploadedFile;
  //     if (!this.utils.isImage(logo)) {
  //       throw new ServiceException('Uploaded file is not an image.');
  //     }

  //     // Remove previous file
  //     try {
  //       periodSetting.value &&
  //         (await this.utils.removeFile(periodSetting.value));
  //     } catch (err) {
  //       // Ignore error
  //     }

  //     const savedFilename = await this.utils.saveFile(logo);
  //     periodSetting.value = savedFilename;
  //   } else {
  //     if (typeof data.value === 'undefined') {
  //       throw new ServiceException('Value is required field');
  //     }
  //     periodSetting.value = data.value;
  //   }

  //   await this.eventLogService.logEvent({
  //     typeKey: EventLogTypeKey.SETTING,
  //     description: `Updated global setting "${periodSetting.label}" from "${
  //       originalValue || ''
  //     }" to "${periodSetting.value || ''}"`,
  //   });

  //   await periodSetting.save();
  //   return this.findOneById(settingId, periodId);
  // }
}