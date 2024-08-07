import { findDocs } from '@base-backend';
import { apartmentPlan } from '@autodesk-backend';
import { AirDirection } from '@cubebox-shared';

export const findPlanByFloorIdSizeAndDirection = async (
  floorId: string,
  size: number,
  direction: AirDirection,
) => {
  const plan = await findDocs(
    apartmentPlan().find({ floorId, size, direction }),
  );
  if (!plan)
    return { statusCode: 404, body: 'No plan found for these parameters' };
  return { statusCode: 200, body: plan };
};
