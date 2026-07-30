import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://magicbody.studio';
  const routes = ['', '/treatments', '/shop', '/gallery', '/about', '/faq', '/contact', '/book'];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}
