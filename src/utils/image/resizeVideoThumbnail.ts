import sharp from "sharp";

export const resizeVideoThumbnail = async (buffer: Buffer) => {
  return {
    thumbnail: await sharp(buffer).resize(160, 90).png().toBuffer(),
    small: await sharp(buffer).resize(320, 180).png().toBuffer(),
    medium: await sharp(buffer).resize(640, 360).png().toBuffer(),
    large: await sharp(buffer).resize(1280, 720).png().toBuffer(),
  };
};
