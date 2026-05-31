/**
 * Generic blurDataURL for teaser images.
 * Generated from a 4x4 base64-encoded SVG matching the brand accent color (#571EFA).
 * Used with next/image `placeholder="blur"` for the blur-up effect on load.
 */
export const BLUR_TEASER =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4">
      <rect width="4" height="4" fill="#571EFA" opacity="0.15"/>
      <rect width="2" height="4" fill="#571EFA" opacity="0.1"/>
    </svg>`,
  ).toString("base64");
