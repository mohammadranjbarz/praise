import { ServiceException } from '@/shared/service-exception';
import { UtilsProvider } from '@/utils/utils.provider';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model, Types } from 'mongoose';
import { PeriodSetting } from './schemas/periodsettings.schema';
import { SetPeriodSettingDto } from './dto/set-periodsetting.dto';
import { UploadedFile } from 'express-fileupload';
import { PeriodsService } from '@/periods/periods.service';
import { PeriodStatusType } from '@/periods/enums/status-type.enum';
import { EventLogService } from '@/event-log/event-log.service';
import { RequestContext } from 'nestjs-request-context';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { SettingsService } from '@/settings/settings.service';

@Injectable()
export class PeriodSettingsService {
  constructor(
    @InjectModel(PeriodSetting.name)
    private periodSettingsModel: Model<PeriodSetting>,
    private periodsService: PeriodsService,
    @Inject(forwardRef(() => SettingsService))
    private settingsService: SettingsService,
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

  async findAll(periodId: Types.ObjectId): Promise<PeriodSetting[]> {
    const period = await this.periodsService.findOneById(periodId);

    const settings = await this.periodSettingsModel
      .find({ period: period._id })
      .populate('period')
      .populate('setting')
      .lean();
    return settings.map((setting) => new PeriodSetting(setting));
  }

  async findOneById(
    settingId: Types.ObjectId,
    periodId: Types.ObjectId,
  ): Promise<PeriodSetting> {
    await this.periodsService.findOneById(periodId);

    const periodSetting = await this.periodSettingsModel
      .findOne({ setting: settingId, period: periodId })
      .populate('period')
      .populate('setting')
      .lean();

    if (!periodSetting) throw new ServiceException('PeriodSetting not found.');
    return new PeriodSetting(periodSetting);
  }

  async findOne(
    key: string,
    periodId: Types.ObjectId | undefined = undefined,
  ): Promise<PeriodSetting | null> {
    return await this.periodSettingsModel.findOne({
      key,
      period: periodId,
    });
  }

  async setOne(
    settingId: Types.ObjectId,
    periodId: Types.ObjectId,
    data: SetPeriodSettingDto,
    file?: {
      value: UploadedFile
    },
  ): Promise<PeriodSetting> {
    const period = await this.periodsService.findOneById(periodId);
    const setting = await this.settingsService.findOneById(settingId);

    if (!setting) throw new ServiceException('Setting not found.');

    if (period.status !== PeriodStatusType.OPEN)
      throw new ServiceException(
        'Period settings can only be changed when period status is OPEN.',
      );

    const periodSetting = await this.periodSettingsModel.findOne({
      setting: settingId,
      period: periodId,
    });
    if (!periodSetting) throw new ServiceException('PeriodSettings not found.');

    const originalValue = periodSetting.value;

    if (setting.type === 'Image') {
      const req: Request = RequestContext.currentContext.req;
      const file = req.files;
      if (!file) {
        throw new ServiceException('Uploaded file is missing.');
      }

      const logo: UploadedFile = file['value'] as UploadedFile;
      if (!this.utils.isImage(logo)) {
        throw new ServiceException('Uploaded file is not an image.');
      }

      // Remove previous file
      try {
        periodSetting.value &&
          (await this.utils.removeFile(periodSetting.value));
      } catch (err) {
        // Ignore error
      }

      const savedFilename = await this.utils.saveFile(logo);
      periodSetting.value = savedFilename;
    } else {
      if (typeof data.value === 'undefined') {
        throw new ServiceException('Value is required field');
      }
      periodSetting.value = data.value;
    }

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERIOD_SETTING,
      description: `Updated period "${period.name}" setting "${setting.label}" from "${
        originalValue  || ''
      }" to "${setting.value || ''}"`,
    });

    await periodSetting.save();
    return this.findOneById(settingId, periodId);
  }
}
