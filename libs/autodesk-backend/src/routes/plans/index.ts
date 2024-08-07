import { highOrderHandler } from '@base-backend';
import { Router } from 'express';
import { AirDirection } from '@cubebox-shared';
import { AuthenticatedRequest } from '@auth-backend';
import { TODO } from '@base-shared';
import { findPlanByFloorIdSizeAndDirection } from '../../controllers/plans';

export const plansRouter = Router();

plansRouter.get(
  '/:floorId',
  highOrderHandler((async (req: AuthenticatedRequest) => {
    const { size, direction } = req.body as {
      size: number;
      direction: AirDirection;
    };
    return findPlanByFloorIdSizeAndDirection(
      req.params['floorId'],
      size,
      direction,
    );
  }) as TODO),
);
