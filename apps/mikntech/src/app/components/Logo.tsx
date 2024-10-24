import Image from "next/image";
import { PaletteMode } from "@mui/material/styles";

const Icon = ({ mode }: { mode: PaletteMode }) =>
  mode === "dark" ? (
    <Image
      width={100}
      height={30}
      src="/night.png"
      alt="Picture of the author"
    />
  ) : (
    <Image width={100} height={30} src="/day.png" alt="Picture of the author" />
  );

export default Icon;
