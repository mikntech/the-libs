import { SomeEnum } from '@the-libs/base-shared';
import { initApi } from '../../../';

export const startInternalAnalyticsMicroservice = <ENUM>(
  AnalyticEventEnum: SomeEnum<ENUM>,
) => initApi<ENUM>(AnalyticEventEnum);
