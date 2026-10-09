import { UfoIcon } from "@/shared/assets/icons/ufo";
import { ImageResponse } from "next/og";

export const size = { width: 25, height: 25 };
export const contentType = "image/png";

export default function Icon(): ImageResponse {
  return new ImageResponse(<UfoIcon colorPrimary="#08fdd8" />, { ...size });
}
