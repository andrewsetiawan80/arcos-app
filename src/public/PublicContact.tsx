import { useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import PublicPageIntro, { usePublicCopy } from './PublicPageIntro';
export default function PublicContact() {
    const c = usePublicCopy();
    const [params] = useSearchParams();
    const [form, setForm] = useState({ fullName: '', email: '', phone: '', company: '', message: params.get('product') ? `Product / sample enquiry: ${params.get('product')}` : '' });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    async function submit(e: FormEvent) { e.preventDefault(); if (status === 'sending')
        return; setStatus('sending'); try {
        const res = await api.submitContactForm(form);
        if (res.error)
            throw new Error(res.error);
        setStatus('sent');
        setForm({ fullName: '', email: '', phone: '', company: '', message: '' });
    }
    catch {
        setStatus('error');
    } }
    return <div><PublicPageIntro label={c('Contact', 'Kontak')} title={c('Every space begins with a conversation.', 'Setiap ruang dimulai dari percakapan.')} description={c('Tell us what you are imagining. We can help with material selection, samples and bespoke project requirements.', 'Ceritakan gagasan Anda. Kami membantu pemilihan material, sampel, dan kebutuhan khusus proyek.')}/><section className="editorial-wrap public-contact-grid"><aside><p className="editorial-eyebrow">ARCOS / INDONESIA</p><h2>{c("Let's make something considered.", 'Mari berkarya dengan penuh perhatian.')}</h2><a className="editorial-text-link" href="mailto:info@arcosworks.com">info@arcosworks.com ↗</a><p>Surabaya, Indonesia</p><p>{c('For a useful first conversation, include your project location, approximate area and the material or finish you have in mind.', 'Untuk percakapan awal, sertakan lokasi proyek, perkiraan luas, dan material atau finishing yang Anda inginkan.')}</p></aside><form onSubmit={submit} className="public-contact-form"><h2>{c('Your project', 'Proyek Anda')}</h2><div className="public-form-fields">{([['fullName', c('Full name', 'Nama lengkap'), 'name', 'text'], ['email', c('Email address', 'Alamat email'), 'email', 'email'], ['phone', c('Phone (optional)', 'Telepon (opsional)'), 'tel', 'tel'], ['company', c('Company / studio (optional)', 'Perusahaan / studio (opsional)'), 'organization', 'text']] as const).map(([key, label, autoComplete, type]) => <div key={key}><label htmlFor={key}>{label}</label><input id={key} name={key} type={type} autoComplete={autoComplete} required={key === 'fullName' || key === 'email'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}/></div>)}</div><label htmlFor="message">{c('Tell us about your project', 'Ceritakan proyek Anda')}</label><textarea id="message" name="message" rows={6} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}/><p className="public-form-note">{c('We will use these details to respond to your enquiry.', 'Kami menggunakan informasi ini untuk menanggapi pertanyaan Anda.')}</p><div aria-live="polite" role="status">{status === 'sent' && <p>{c('Thank you. Your enquiry has been sent.', 'Terima kasih. Pesan Anda telah terkirim.')}</p>}{status === 'error' && <p>{c('Your message could not be sent. Please try again or email us directly. Your entries have been kept.', 'Pesan belum dapat dikirim. Silakan coba lagi atau kirim email langsung. Isian Anda tetap tersimpan.')}</p>}</div><button className="editorial-button" disabled={status === 'sending'}>{status === 'sending' ? c('Sending…', 'Mengirim…') : c('Send enquiry', 'Kirim pertanyaan')} ↗</button></form></section></div>;
}
