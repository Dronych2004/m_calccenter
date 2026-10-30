/**
 * Блок SEO-контента под калькулятором.
 * Содержит описание, формулы и FAQ — 300-500 слов для индексации поисковиками.
 */

interface FaqItem {
  q: string;
  a: string;
}

interface SeoContentProps {
  title: string;
  description: string;
  formula?: { title: string; text: string };
  faq: FaqItem[];
}

export default function SeoContent({ title, description, formula, faq }: SeoContentProps) {
  return (
    <div className="mt-12 max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Описание */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">{title}</h2>
        <div className="text-sm text-slate-500 leading-relaxed space-y-3">
          {description.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Формула */}
      {formula && (
        <section className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
          <h3 className="text-base font-semibold text-slate-700 mb-2">{formula.title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{formula.text}</p>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Часто задаваемые вопросы</h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors list-none">
                  {item.q}
                  <svg className="w-4 h-4 shrink-0 text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          {/* JSON-LD FAQPage */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faq.map(item => ({
                  '@type': 'Question',
                  name: item.q,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.a,
                  },
                })),
              }),
            }}
          />
        </section>
      )}
    </div>
  );
}
