import { DBDoc, getModel, Optional } from '@the-libs/mongo-backend';
import { SomeEnum } from '@the-libs/base-shared';

export interface DBIBase<EnforceENUM extends boolean, ENUM> extends DBDoc {
  value: EnforceENUM extends true ? ENUM : string;
  userEmail?: string;
  userNumber?: string;
  sessionId?: string;
  custom?: string;
}

export const analyticEvent = <
  ENUM,
  DBI extends DBIBase<boolean, ENUM> = DBIBase<false, ENUM>,
  CacheI = never,
>(
  AnalyticEventEnum?: SomeEnum<ENUM>,
  enforceValues = false,
  addOptions?: Optional<DBI, CacheI>,
) =>
  getModel<DBI, CacheI>(
    'analyticEvent',
    {
      value: {
        type: String,
        ...(enforceValues && AnalyticEventEnum
          ? {
              enum: Object.values(AnalyticEventEnum).filter(
                (v): v is string => typeof v === 'string',
              ),
            }
          : {}),
        required: true,
      },
      userEmail: {
        type: String,
      },
      userNumber: {
        type: String,
      },
      sessionId: {
        type: String,
      },
      custom: {
        type: String,
      },
    },
    { ...(addOptions ?? {}) },
  );
