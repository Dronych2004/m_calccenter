/**
 * Уникальные meta-теги для каждой страницы через react-helmet-async.
 * Canonical URL генерируется автоматически из текущего пути (без trailing slash).
 */
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
  // Генерируем canonical из текущего пути без trailing slash
  const canonicalUrl = canonical || `${SITE_URL}${location.pathname.replace(/\/+$/, '') || '/'}`;

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
