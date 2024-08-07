import { getModel } from '@base-shared';
import { ApartmentPlan } from '../../types/schemas/plans/apartmentPlan';
import { AirDirection } from '@cubebox-shared';

export const apartmentPlan = () =>
  getModel<ApartmentPlan>('apartmentPlan', {
    urn: { type: String, required: true },
    size: { type: String, required: true },
    direction: {
      type: String,
      enum: Object.values(AirDirection),
      required: true,
    },
  });
