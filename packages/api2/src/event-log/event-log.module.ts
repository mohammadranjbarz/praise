import { Module } from '@nestjs/common';
import { EventLogController } from './event-log.controller';
import { EventLog, EventLogSchema } from './entities/event-log.entity';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EventLogType,
  EventLogTypeSchema,
} from './entities/event-log-type.entity';
import { EventLogService } from './event-log.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventLog.name, schema: EventLogSchema },
      { name: EventLogType.name, schema: EventLogTypeSchema },
    ]),
  ],
  controllers: [EventLogController],
  providers: [EventLogService],
  exports: [
    EventLogService,
    MongooseModule.forFeature([
      { name: EventLog.name, schema: EventLogSchema },
      { name: EventLogType.name, schema: EventLogTypeSchema },
    ]),
  ],
})
export class EventLogModule {}