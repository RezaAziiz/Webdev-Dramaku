export type Rgb = { r: number; g: number; b: number };

export type Palette = {
  tint: string;
  accent: string;
  bg: string;
  contrastText?: string;
};

export type PaletteSource = {
  backdrop_path?: string | null;
  backdrop?: string | null;
  backdropImage?: string | null;
  images?: string | null;
  poster?: string | null;
  poster_path?: string | null;
  palette?: {
    tint?: string | null;
    dominant?: string | null;
    accent?: string | null;
  } | null;
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const readDefaultPalette = (): Palette => {
  if (typeof window === "undefined") {
    return { tint: "", accent: "", bg: "" };
  }

  const styles = window.getComputedStyle(document.documentElement);
  const readToken = (token: string) => styles.getPropertyValue(token).trim();

  return {
    tint: readToken("--tint"),
    accent: readToken("--accent"),
    bg: readToken("--bg-base"),
    contrastText: readToken("--text-primary"),
  };
};

export const rgbToHex = ({ r, g, b }: Rgb): string =>
  `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;

export const hexToRgb = (hex: string): Rgb => {
  const parsed = hex.replace("#", "");
  const safeHex =
    parsed.length === 3
      ? parsed.split("").map((char) => char + char).join("")
      : parsed;

  return {
    r: Number.parseInt(safeHex.slice(0, 2), 16),
    g: Number.parseInt(safeHex.slice(2, 4), 16),
    b: Number.parseInt(safeHex.slice(4, 6), 16),
  };
};

export const mixHex = (
  baseHex: string,
  mixHexValue: string,
  amount: number,
): string => {
  const first = hexToRgb(baseHex);
  const second = hexToRgb(mixHexValue);

  const blend = {
    r: first.r + (second.r - first.r) * amount,
    g: first.g + (second.g - first.g) * amount,
    b: first.b + (second.b - first.b) * amount,
  };

  return rgbToHex(blend);
};

export const relativeLuminance = (hex: string): number => {
  const channels = Object.values(hexToRgb(hex)).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

export const contrastRatio = (firstHex: string, secondHex: string): number => {
  const first = relativeLuminance(firstHex);
  const second = relativeLuminance(secondHex);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
};

export const darkenToLuminanceCap = (hex: string): string => {
  let darkened = hexToRgb(hex);

  while (relativeLuminance(rgbToHex(darkened)) > 0.025) {
    darkened = {
      r: darkened.r * 0.8,
      g: darkened.g * 0.8,
      b: darkened.b * 0.8,
    };
  }

  return rgbToHex(darkened);
};

export const ensureAccentContrast = (
  accent: string,
  background: string,
  lightText: string,
): string => {
  let adjusted = accent;

  for (let step = 0; step <= 10; step += 1) {
    if (contrastRatio(adjusted, background) >= 4.5) return adjusted;
    adjusted = mixHex(adjusted, lightText, 0.1);
  }

  return adjusted;
};

export const toRgba = (hex: string, alpha: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const asHex = (value: unknown): string | null =>
  typeof value === "string" && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
    ? value
    : null;

export const toHeroImageUrl = (image: unknown): string => {
  if (typeof image !== "string" || !image.trim()) return "";

  const imageUrl = image.trim();
  if (imageUrl.startsWith("/")) {
    return `https://image.tmdb.org/t/p/original${imageUrl}`;
  }

  return imageUrl.replace(
    /(image\.tmdb\.org\/t\/p\/)(?:w\d+|h\d+|original)(\/)/,
    "$1original$2",
  );
};

export const getImageUrl = (movie?: PaletteSource | null): string =>
  toHeroImageUrl(
    movie?.backdrop_path ||
      movie?.backdrop ||
      movie?.backdropImage ||
      movie?.images ||
      movie?.poster ||
      movie?.poster_path,
  );

export const computePaletteFromImage = (imageUrl: string): Promise<Palette> =>
  new Promise((resolve) => {
    if (!imageUrl || typeof window === "undefined") {
      resolve(readDefaultPalette());
      return;
    }

    const defaultPalette = readDefaultPalette();
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        resolve(defaultPalette);
        return;
      }

      const sampleSize = 48;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      let data: Uint8ClampedArray;
      try {
        context.drawImage(image, 0, 0, sampleSize, sampleSize);
        data = context.getImageData(0, 0, sampleSize, sampleSize).data;
      } catch {
        resolve(defaultPalette);
        return;
      }
      let totalRed = 0;
      let totalGreen = 0;
      let totalBlue = 0;
      let pixelCount = 0;

      for (let index = 0; index < data.length; index += 16) {
        const alpha = data[index + 3];
        if (alpha < 128) continue;

        totalRed += data[index];
        totalGreen += data[index + 1];
        totalBlue += data[index + 2];
        pixelCount += 1;
      }

      if (!pixelCount) {
        resolve(defaultPalette);
        return;
      }

      const average = {
        r: totalRed / pixelCount,
        g: totalGreen / pixelCount,
        b: totalBlue / pixelCount,
      };

      const tint = darkenToLuminanceCap(
        rgbToHex({
          r: average.r * 0.45,
          g: average.g * 0.45,
          b: average.b * 0.45,
        }),
      );

      const bg = mixHex(defaultPalette.bg, tint, 0.7);
      const accent = ensureAccentContrast(
        rgbToHex({
          r: clamp(average.r * 1.2, 0, 255),
          g: clamp(average.g * 1.2, 0, 255),
          b: clamp(average.b * 1.2, 0, 255),
        }),
        bg,
        defaultPalette.contrastText ?? "",
      );

      resolve({
        tint,
        accent,
        bg,
      });
    };

    image.onerror = () => resolve(defaultPalette);

    image.src = imageUrl;
  });

export const computeMoviePalette = async (
  movie?: PaletteSource | null,
): Promise<Palette> => {
  const sampled = await computePaletteFromImage(getImageUrl(movie));
  const defaultPalette = readDefaultPalette();
  const metadataTint = asHex(movie?.palette?.tint ?? movie?.palette?.dominant);
  const tint = metadataTint
    ? darkenToLuminanceCap(metadataTint)
    : sampled.tint;
  const bg = metadataTint
    ? mixHex(defaultPalette.bg, tint, 0.7)
    : sampled.bg;
  const metadataAccent = asHex(movie?.palette?.accent);

  return {
    tint,
    bg,
    accent: metadataAccent
      ? ensureAccentContrast(metadataAccent, bg, defaultPalette.contrastText ?? "")
      : sampled.accent,
  };
};
