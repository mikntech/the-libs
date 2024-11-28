/*
import type { Model } from 'mongoose';

const modelMap = new Map<string, { model: Model<any>; isWatched: boolean }>();

export const registerModel = (name: string, model: Model<any>) => {
  if (modelMap.has(name)) {
    console.warn(
      `Model for ${name} is already registered. Skipping re-registration.`,
    );
    return modelMap.get(name)?.model; // Return the registered model
  }
  modelMap.set(name, { model, isWatched: false });
  return model;
};

export const markModelAsWatched = (name: string) => {
  if (modelMap.has(name)) {
    modelMap.get(name)!.isWatched = true;
  }
};

export const isModelWatched = (name: string): boolean => {
  return modelMap.get(name)?.isWatched || false;
};

export const getModelFromMap = (name: string): Model<any> | undefined => {
  return modelMap.get(name)?.model;
};
*/

console.log('Optinal');
