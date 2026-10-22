// Image delivery helpers.
// Thumbnails are stored at 1920x1080 (16:9). Cards always show a 16:9 frame, and Cloudinary crops/resizes
// to it on the fly, so even older, differently-shaped uploads fit the cards. Browsers pick the smallest
// candidate that is sharp enough for their screen, up to full 1080p.
const CLOUDINARY = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?!f_auto)(.+)$/;

export const CARD_WIDTH = 1920;
export const CARD_HEIGHT = 1080;
const SRCSET_WIDTHS = [640, 960, 1280, 1920];

const transform = (url, width, height) =>
  url.replace(CLOUDINARY, `$1f_auto,q_auto,c_fill,g_auto,w_${width},h_${height}/$2`);

// Props for an <img> inside a 16:9 card. Non-Cloudinary URLs are returned unchanged.
export const cardImage = (url, sizes = '(min-width: 1024px) 400px, 85vw') => {
  if (!url || !CLOUDINARY.test(url)) return { src: url };
  return {
    src: transform(url, CARD_WIDTH, CARD_HEIGHT),
    srcSet: SRCSET_WIDTHS.map((w) => `${transform(url, w, Math.round((w * 9) / 16))} ${w}w`).join(', '),
    sizes,
  };
};

// Full-width banner image (no forced crop), capped at 1080p width.
export const heroImage = (url) =>
  url && CLOUDINARY.test(url) ? url.replace(CLOUDINARY, '$1f_auto,q_auto,w_1920/$2') : url;
