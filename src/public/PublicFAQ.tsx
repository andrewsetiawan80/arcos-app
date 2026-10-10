import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import PublicPageIntro, { PublicEnquiry, usePublicCopy } from './PublicPageIntro';
type Category = {
    id: string;
    name: string;
    nameId: string;
};
type Item = {
    id: number;
    categoryId: string;
    question: string;
    questionId: string;
    answer: string;
    answerId: string;
};
export default function PublicFAQ() {
    const c = usePublicCopy();
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [selected, setSelected] = useState('');
    const [status, setStatus] = useState('loading');
    const [retry, setRetry] = useState(0);
    useEffect(() => { let active = true; setStatus('loading'); Promise.all([api.getFAQCategories(), api.getFAQItems()]).then(([a, b]) => { if (a.error || b.error)
        throw new Error(); if (active) {
        setCategories(Array.isArray(a.data) ? a.data : []);
        setItems(Array.isArray(b.data) ? b.data : []);
        setStatus('ready');
    } }).catch(() => { if (active)
        setStatus('error'); }); return () => { active = false; }; }, [retry]);
    return <><PublicPageIntro label={c('Questions', 'Pertanyaan')} title={c('A little clarity.', 'Jawaban yang Anda butuhkan.')} description={c('Materials, specifications, installation and care. Find answers or speak with our team.', 'Material, spesifikasi, pemasangan, dan perawatan. Temukan jawaban atau hubungi tim kami.')}/><section className="editorial-wrap public-library"><div className="public-filters" aria-label={c('Question categories', 'Kategori pertanyaan')}><button aria-pressed={!selected} onClick={() => setSelected('')}>{c('All questions', 'Semua pertanyaan')}</button>{categories.map(cat => <button key={cat.id} aria-pressed={selected === cat.id} onClick={() => setSelected(cat.id)}>{c(cat.name, cat.nameId || cat.name)}</button>)}</div>{status === 'loading' ? <p role="status">{c('Loading answers…', 'Memuat jawaban…')}</p> : status === 'error' ? <div role="status"><p>{c('Answers are unavailable right now. Please try again or contact our team.', 'Jawaban belum tersedia. Silakan coba lagi atau hubungi tim kami.')}</p><button className="editorial-text-link" onClick={() => setRetry(x => x + 1)}>{c('Try again', 'Coba lagi')} ↗</button></div> : <div className="public-faq-list">{items.filter(i => !selected || i.categoryId === selected).map(i => <details key={i.id}><summary>{c(i.question, i.questionId || i.question)}</summary><p>{c(i.answer, i.answerId || i.answer)}</p></details>)}{!items.filter(i => !selected || i.categoryId === selected).length && <p>{c('No answers in this category yet. Our team can help with your question.', 'Belum ada jawaban dalam kategori ini. Tim kami siap membantu.')}</p>}</div>}</section><PublicEnquiry /></>;
}
