declare module "*.css";
declare module "swiper/css/*";
declare module "swiper/css/pagination";
declare module "*.jpg";
declare module "*.png";

interface ImportMeta {
  env: {
    [key: string]: string;
  };
}
