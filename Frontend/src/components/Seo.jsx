import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE } from '../utils/contact';

// Sets the document title and head tags for the current page (client-side SPA).
// Social crawlers that don't run JS read the defaults in index.html instead.
const upsert = (selector, tag, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(tag);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
};

const trim = (text, max = 158) => {
  const clean = String(text || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
};

const Seo = ({ title, description, image, path, type = 'website', noindex = false, jsonLd }) => {
  const { pathname } = useLocation();
  const canonicalPath = path ?? pathname;
  const url = `${SITE.url}${canonicalPath === '/' ? '' : canonicalPath}`;
  const fullTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} – ${SITE.tagline}`;
  const desc = trim(description || SITE.description);
  const img = image || SITE.logo;
  const ld = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    document.title = fullTitle;
    upsert('meta[name="description"]', 'meta', { name: 'description', content: desc });
    upsert('meta[name="robots"]', 'meta', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    });
    upsert('link[rel="canonical"]', 'link', { rel: 'canonical', href: url });

    const og = {
      'og:title': fullTitle,
      'og:description': desc,
      'og:url': url,
      'og:image': img,
      'og:type': type,
      'og:site_name': SITE.name,
    };
    Object.entries(og).forEach(([k, v]) => upsert(`meta[property="${k}"]`, 'meta', { property: k, content: v }));

    const tw = {
      'twitter:card': 'summary_large_image',
      'twitter:title': fullTitle,
      'twitter:description': desc,
      'twitter:image': img,
    };
    Object.entries(tw).forEach(([k, v]) => upsert(`meta[name="${k}"]`, 'meta', { name: k, content: v }));
  }, [fullTitle, desc, url, img, type, noindex]);

  useEffect(() => {
    if (!ld) return undefined;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seo = 'page';
    script.text = ld;
    document.head.appendChild(script);
    return () => script.remove();
  }, [ld]);

  return null;
};

export default Seo;
