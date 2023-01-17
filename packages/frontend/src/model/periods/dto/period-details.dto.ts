import { PeriodStatusType } from '../enums/period-status-type.enum';
import { PeriodDetailsGiverReceiverDto } from './period-details-giver-receiver.dto';
import { PeriodSettingDto } from '@/model/periodsettings/dto/period-settings.dto';
import { PeriodDetailsQuantifierDto } from './period-details-quantifier.dto';

export interface PeriodDetailsDto {
  _id: string;
  name: string;
  status: PeriodStatusType;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  quantifiers?: PeriodDetailsQuantifierDto[];
  givers?: PeriodDetailsGiverReceiverDto[];
  receivers?: PeriodDetailsGiverReceiverDto[];
  settings?: PeriodSettingDto[];
}