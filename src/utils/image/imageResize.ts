import sharp from "sharp";

export const resizeChannelImages = async (
  buffer: Buffer
): Promise<Record<string, Buffer>> => {
  const original = buffer;

  const thumbnail = await sharp(buffer)
    .resize(64, 64)
    .png()
    .toBuffer();

  const small = await sharp(buffer)
    .resize(128, 128)
    .png()
    .toBuffer();

  const medium = await sharp(buffer)
    .resize(256, 256)
    .png()
    .toBuffer();

  const large = await sharp(buffer)
    .resize(512, 512)
    .png()
    .toBuffer();

  return {
    original,
    thumbnail,
    small,
    medium,
    large,
  };
};
