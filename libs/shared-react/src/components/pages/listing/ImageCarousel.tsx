import { useEffect, useState } from "react";
import { Box, BoxProps, CircularProgress } from "@mui/material";
import p1 from "../../../assets/images/mock/colorfull-x-s/mock1.png";
import p2 from "../../../assets/images/mock/colorfull-x-s/mock2.png";
import { TODO } from "@offisito/shared";
import { Img } from "../..";

declare module "*.css";

const defaultImages = [
  {
    label: "Photo1",
    alt: "Photo1",
    imgPath: p1,
  },
  {
    label: "Photo2",
    alt: "Photo2",
    imgPath: p2,
  },
];

interface ImageCarouselProps {
  imagesArray?: { label: string; alt: string; imgPath: string }[];
  imageHeight?:number;
  boxprops?: BoxProps;
  imgprops?: BoxProps;
}

export const ImageCarousel = ({
  imagesArray,
  imageHeight,
  boxprops,
  imgprops,
}: ImageCarouselProps) => {
  const [Swiper, setSwiper] = useState<TODO>(null);
  const [SwiperSlide, setSwiperSlide] = useState<TODO>(null);
  const images = imagesArray || defaultImages;

  useEffect(() => {
    async function loadSwiperComponents() {
      await import("swiper/swiper-bundle.css");
      const swiperModule = await import("swiper/react");
      setSwiper(swiperModule.Swiper);
      setSwiperSlide(swiperModule.SwiperSlide);
    }

    loadSwiperComponents().then();
  }, []);

  if (!Swiper || !SwiperSlide) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ maxWidth: "100%", flexGrow: 1 }} {...boxprops}>
      <Swiper
        pagination={{
          clickable: true,
          type: "bullets",
        }}
        spaceBetween={50}
        slidesPerView={1}
      >
        {images.map((image) => (
          <SwiperSlide key={image.label}>
            <Img
              sx={{
                height: imageHeight ?? 255,
                display: "block",
                maxWidth: "100%",
                overflow: "hidden",
                width: "100%",
              }}
              src={image.imgPath}
              alt={image.label}
              {...imgprops}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
