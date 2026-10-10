import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '../i18n/LanguageContext';
import PublicLayout from './PublicLayout';
import PublicHome from './PublicHome';
vi.mock('../lib/api', () => ({ api: { getFeaturedProjects: vi.fn(async () => ({ data: [] })) } }));
vi.mock('../components/ScrollToTop', () => ({ default: () => null }));
beforeEach(() => localStorage.clear());
afterEach(cleanup);
function site() { return render(<MemoryRouter><LanguageProvider><Routes><Route element={<PublicLayout />}><Route index element={<PublicHome />}/><Route path="contact" element={<h1>Contact destination</h1>}/></Route></Routes></LanguageProvider></MemoryRouter>); }
describe('Public website', () => {
    it('opens Resources and closes it with Escape', () => { site(); const trigger=screen.getByRole('button',{name:/Resources/}); fireEvent.click(trigger); expect(trigger).toHaveAttribute('aria-expanded','true'); expect(document.getElementById('public-resources-menu')).toHaveTextContent('Material guide'); fireEvent.keyDown(window,{key:'Escape'}); expect(trigger).toHaveAttribute('aria-expanded','false'); expect(trigger).toHaveFocus(); });

    it('shows project highlights and directs visitors to the collection without API data', () => { site(); expect(screen.getByRole('link', {name:/Explore the collection/})).toHaveAttribute('href','/collection'); expect(screen.getByRole('link', {name:/Somerset House/})).toHaveAttribute('href','/projects/somerset-house'); expect(screen.getByRole('link', {name:/Choose your sample box/})).toHaveAttribute('href','/samples'); });
    it('keeps the enquiry connected to the public contact route', async () => { site(); fireEvent.click(screen.getByRole('link', { name: /Discuss your project/ })); expect(await screen.findByText('Contact destination')).toBeInTheDocument(); });
    it('opens and closes the mobile navigation with Escape and restores focus', () => { site(); const menu = screen.getByRole('button', { name: /Menu/ }); fireEvent.click(menu); expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument(); fireEvent.keyDown(window, { key: 'Escape' }); expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument(); expect(menu).toHaveFocus(); });
    it('renders Indonesian origin copy and labelled application imagery', () => { localStorage.setItem('arcos_language', 'id'); site(); expect(screen.getByRole('heading', { name: /Dibuat di Indonesia/ })).toBeInTheDocument(); expect(screen.getByText(/Visualisasi produk\./)).toBeInTheDocument(); });
});
