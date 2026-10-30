/**
 * Уникальные meta-теги для каждой страницы через react-helmet-async.
 * Canonical URL — без trailing slash (корень — "/"), как в sitemap.xml
 * и в редиректах сервера (.htaccess / nginx.conf).
 *
 * После обновления <head> диспатчит custom-render-trigger для prerenderer —
 * это гарантирует что HTML захватывается с правильными мета-тегами.
 */
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://calccenter.ru';

interface SeoHeadProps {
  title: string;
  description: string;
  canonical?: string;
}

export default function SeoHead({ title, description, canonical }: SeoHeadProps) {
  const location = useLocation();
  // Canonical — всегда без trailing slash (корень — "/").
  // Нормализуем и явный prop, и путь из URL, защищаясь от случайного слэша в коде.
  const raw = canonical || location.pathname;
  const canonicalUrl =
    raw === '/' || raw === SITE_URL || raw === `${SITE_URL}/`
      ? `${SITE_URL}/`
      : raw.replace(/\/+$/, '');

  // Сообщаем prerenderer что <head> обновлён и HTML можно захватывать.
  // Даём 50мс на_commit Helmet'а в DOM (react-helmet-async батчит обновления в useEffect).
  useEffect(() => {
    const timer = setTimeout(() => {
      document.dispatchEvent(new Event('custom-render-trigger'));
    }, 50);
    return () => clearTimeout(timer);
  }, [title, canonicalUrl]);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
    </Helmet>
  );
}
