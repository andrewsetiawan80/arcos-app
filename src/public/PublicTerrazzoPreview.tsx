import { Link } from 'react-router-dom';
import { usePublicCopy } from './PublicPageIntro';

export default function PublicTerrazzoPreview() {
 const c = usePublicCopy();
 return <aside className="editorial-wrap terrazzo-preview" aria-label={c('GFRC terrazzo — coming soon', 'GFRC terrazzo — segera hadir')}>
  <div><p className="editorial-eyebrow">{c('Coming soon', 'Segera hadir')}</p><h2>GFRC terrazzo</h2><p>{c('A new expression of architectural concrete. Made in Indonesia.', 'Ekspresi baru beton arsitektural. Dibuat di Indonesia.')}</p></div>
  <Link className="editorial-text-link" to="/contact?product=GFRC%20terrazzo">{c('Enquire about terrazzo', 'Tanyakan tentang terrazzo')} ↗</Link>
 </aside>;
}
