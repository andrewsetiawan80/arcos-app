import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import PublicPageIntro, { PublicEnquiry, usePublicCopy } from './PublicPageIntro';
type Category = {
    id: string;
    name: string;
    nameId: string;
};
type Picture = {
    id: number;
    categoryId: string;
    imageUrl: string;
    fullImageUrl?: string;
    title: string;
    titleId: string;
};
export default function PublicInspiration() {
    const c = usePublicCopy();
    const [categories, setCategories] = useState<Category[]>([]);
    const [pictures, setPictures] = useState<Picture[]>([]);
    const [filter, setFilter] = useState('');
    const [selected, setSelected] = useState<Picture | null>(null);
    const [status, setStatus] = useState('loading');
    const [retry, setRetry] = useState(0);
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => { let active = true; setStatus('loading'); Promise.all([api.getInspirationCategories(), api.getInspirationImages()]).then(([a, b]) => { if (a.error || b.error)
        throw new Error(); if (active) {
        setCategories(Array.isArray(a.data) ? a.data : []);
        setPictures(Array.isArray(b.data) ? b.data : []);
        setStatus('ready');
    } }).catch(() => { if (active)
        setStatus('error'); }); return () => { active = false; }; }, [retry]);
    useEffect(() => { if (selected)
        dialog.current?.showModal();
    else
        dialog.current?.close(); }, [selected]);
    const url = (s: string) => s.startsWith('http') || s.startsWith('/') ? s : `/${s}`;
    const images = pictures.filter(p => !filter || p.categoryId === filter);
    return <><PublicPageIntro label={c('Inspiration', 'Inspirasi')} title={c('A different way to see concrete.', 'Sudut pandang baru tentang beton.')} description={c('Explore texture, rhythm and architectural applications. Gather ideas for your next space.', 'Jelajahi tekstur, ritme, dan aplikasi arsitektural. Temukan ide untuk ruang Anda.')}/><section className="editorial-wrap public-library"><div className="public-filters"><button aria-pressed={!filter} onClick={() => setFilter('')}>{c('All inspiration', 'Semua inspirasi')}</button>{categories.map(cat => <button key={cat.id} aria-pressed={filter === cat.id} onClick={() => setFilter(cat.id)}>{c(cat.name, cat.nameId || cat.name)}</button>)}</div>{status === 'loading' ? <p role="status">{c('Loading inspiration…', 'Memuat inspirasi…')}</p> : status === 'error' ? <div role="status"><p>{c('The gallery is unavailable right now. Please try again.', 'Galeri belum tersedia. Silakan coba lagi.')}</p><button className="editorial-text-link" onClick={() => setRetry(x => x + 1)}>{c('Try again', 'Coba lagi')} ↗</button></div> : <div className="public-inspiration-grid">{images.map(p => <button key={p.id} onClick={() => setSelected(p)} aria-label={`${c('View', 'Lihat')} ${c(p.title, p.titleId || p.title)}`}><img src={url(p.imageUrl)} alt={c(p.title, p.titleId || p.title)} loading="lazy"/><span>{c(p.title, p.titleId || p.title)}</span></button>)}{!images.length && <p>{c('No images in this category yet.', 'Belum ada gambar dalam kategori ini.')}</p>}</div>}</section><PublicEnquiry /><dialog ref={dialog} className="public-gallery-dialog" onClose={() => setSelected(null)} onClick={e => { if (e.target === dialog.current)
        setSelected(null); }} aria-label={selected ? c(selected.title, selected.titleId || selected.title) : c('Image preview', 'Pratinjau gambar')}><button className="public-dialog-close" onClick={() => setSelected(null)}>{c('Close', 'Tutup')} ×</button>{selected && <figure><img src={url(selected.fullImageUrl || selected.imageUrl)} alt={c(selected.title, selected.titleId || selected.title)}/><figcaption>{c(selected.title, selected.titleId || selected.title)}</figcaption></figure>}</dialog></>;
}
