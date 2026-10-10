import type { Product } from '../types';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import usePublicData from './usePublicData';
import PublicPageIntro, { usePublicCopy } from './PublicPageIntro';
type PublicProduct = Product & {
    category?: string;
    description?: string;
    seoDescription?: string;
    priceFromIDR?: number;
};
export default function PublicProductDetail() {
    const { slug } = useParams();
    const c = usePublicCopy();
    const state = usePublicData();
    const product = state.products?.find(p => p.public && p.slug === slug) as PublicProduct | undefined;
    const [selected, setSelected] = useState<{
        slug: string;
        url: string;
    } | null>(null);
    if (!product)
        return <><PublicPageIntro label={c('Collection', 'Koleksi')} title={c('Product unavailable.', 'Produk tidak tersedia.')} description={c('This piece may not be published. Explore the collection or contact us for help.', 'Produk ini mungkin belum dipublikasikan. Jelajahi koleksi atau hubungi kami.')}/><div className="editorial-wrap public-story"><Link className="editorial-text-link" to="/collection">{c('Back to collection', 'Kembali ke koleksi')} ↗</Link></div></>;
    const gallery = [product.coverImageUrl, ...(product.galleryImages || [])].filter(Boolean) as string[];
    const hero = selected && selected.slug === slug ? selected.url : gallery[0];
    return <div className="public-product-detail"><div className="editorial-wrap public-breadcrumb"><Link to="/collection">{c('Collection', 'Koleksi')}</Link><span>/</span><span>{product.title}</span></div><section className="editorial-wrap public-product-grid"><div><figure className="public-product-hero">{hero ? <img src={hero} alt={product.title}/> : <p>{c('Image coming soon', 'Gambar segera tersedia')}</p>}</figure>{gallery.length > 1 && <div className="public-product-thumbnails">{gallery.map((url, i) => <button key={`${url}-${i}`} aria-label={`${c('View image', 'Lihat gambar')} ${i + 1}`} aria-pressed={hero === url} onClick={() => setSelected({ slug: slug || '', url })}><img src={url} alt=""/></button>)}</div>}</div><div><p className="editorial-eyebrow">{product.category || product.categorySlug || 'ARCOS'}</p><h1>{product.title}</h1><p className="public-product-description">{product.blurb || product.seoDescription || product.description}</p>{typeof product.priceFromIDR === 'number' && <p>{c('From', 'Mulai dari')} IDR {product.priceFromIDR.toLocaleString('id-ID')}</p>}<dl className="public-spec-list">{product.size && <><dt>{c('Size', 'Ukuran')}</dt><dd>{typeof product.size === 'string' ? product.size : Object.entries(product.size).map(([k, v]) => `${k}: ${v}`).join(' / ')}</dd></>}{product.category && <><dt>{c('Material', 'Material')}</dt><dd>{product.category}</dd></>}</dl>{!!product.variants?.length && <div className="public-variant-list"><h2>{c('Available variants', 'Varian tersedia')}</h2>{product.variants.map(v => <span key={v.id}>{v.name}{v.color ? ` / ${v.color}` : ''}</span>)}</div>}<Link className="editorial-button" to={`/contact?product=${encodeURIComponent(product.title)}`}>{c('Enquire / request a sample', 'Tanyakan / minta sampel')} ↗</Link><p className="public-form-note">{c('Discuss finish, dimensions and availability with our team.', 'Diskusikan finishing, dimensi, dan ketersediaan bersama tim kami.')}</p></div></section></div>;
}
