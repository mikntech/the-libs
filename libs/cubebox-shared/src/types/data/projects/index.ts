import { Types, Document as MDocument } from 'mongoose';
import { Business, BusinessCmp } from '../business';

interface FullAddress {
  street: string;
  city: string;
  province: string;
  state: string;
  country: string;
  zip_code?: string;
}

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DISABLED = 'disabled',
  CLOSED = 'closed',
}

export interface Project<
  PopulatedWithFloors extends boolean = false,
  AndApartments extends boolean = false,
> extends MDocument {
  _id: Types.ObjectId;
  floors: PopulatedWithFloors extends true ? Floor<AndApartments>[] : undefined;
  business_id: Types.ObjectId;
  name: string;
  description: string;
  marketing_technical_specifications: string;
  address: FullAddress;
  num_of_floors: number;
  num_of_apartments: number;
  min_apartment_size: number;
  max_apartment_size: number;
  increment_sqm: number;
  default_price_per_sqm: number;
  up_floor_price: number;
  add_parking_price: number;
  need_to_mark_mmd: boolean;
  estimated_delivery_date: Date;
  searchPosition: number;
  status: ProjectStatus;
  location: {
    type: 'Point';
    coordinates: number[];
  };
  simulation_video?: string;
  plot_plan_photos?: string[];
  typical_floor_plan_files_contour?: string[];
  entrance_floor_plan_imaging?: string[];
  simulations_photos?: string[];
  environment_and_landscape_photos?: string[];
  additional_project_documents?: string[];
  preprepared_apartment_plans?: string[];
  lending_bank: {
    name: string;
    address?: string;
    contact_number?: string;
  };
  attorney_office: {
    name: string;
    address?: string;
    contact_number?: string;
  };
  architect_office: {
    name: string;
    address?: string;
    contact_number?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export enum AirDirection {
  SOUTH = 'south',
  NORTH = 'north',
  EAST = 'east',
  WEST = 'west',
}

export enum SalesStatus {
  AVAILABLE = 'available', // For sale
  SOLD = 'sold', // after sale and successful payment
  PENDING = 'pending', // pending for seller / admin action
  RESERVED = 'reserved', // Temporarily reserved for sale
  BLOCKED = 'blocked', // Not for sale
}

export interface Floor<PopulatedWithApartments extends boolean = false>
  extends MDocument {
  _id: Types.ObjectId;
  apartments: PopulatedWithApartments extends true ? Apartment[] : undefined;
  project_id: Types.ObjectId;
  floor_number: number;
  gross_area: number;
  neto_saleable_area: number;
  min_apartment_size: number;
  max_apartment_size: number;
  num_of_apartments: number;
  remaining_apartments: number;
  sold_sizes: {
    size: number;
    direction: AirDirection;
  }[];
  combinations_sizes: number[];
  possible_sizes: number[];
  possible_plans: Types.ObjectId[];
  possible_direction: {
    direction: AirDirection;
    total: number;
  }[];
  possible_sizes_budgets?: {
    size: number;
    budget: number;
  }[];
  total_sold_area: number;
  remaining_area: number;
  status: SalesStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Apartment extends MDocument {
  _id: Types.ObjectId;
  floor_id: Types.ObjectId;
  apartment_number: number;
  apartment_plan: Types.ObjectId;
  price: number;
  parking: number;
  sales_status: SalesStatus;
  next_side_adjustable: boolean;
  prev_side_adjustable: boolean;
  placement_order_on_floor: number;
  air_direction: AirDirection;
  createdAt: Date;
  updatedAt: Date;
}

export interface selectedProject extends Project<true, true> {
  business_info: BusinessCmp;
  convert_simulations_photos: SimulationsPhotos[];
  appropriate_floor: Floor<true>[];
  total_of_possible_directions: {
    total: number;
    directions: string[];
  };
  total_of_possible_sizes: {
    total: number;
    sizes: number[];
  };
}

export interface SimulationsPhotos {
  img: string;
  active?: string;
}

export interface FloorType {
  id: string;
  floor_number: number;
  thumb: StaticImageData;
  remaining_area: number;
  min_apartment_size: number;
  max_apartment_size: number;
  sizes_possible: number[];
  possible_direction: { direction: string; total: number }[];
  possible_sizes_budgets: { size: number; budget: number }[];
  num_apartments_for_sale: number;
  status: string;
  apartments: Apartment[];
}

export type StaticImageData = {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
};
