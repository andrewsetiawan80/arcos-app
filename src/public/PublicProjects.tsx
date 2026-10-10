import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import PublicPageIntro, { PublicEnquiry, usePublicCopy } from './PublicPageIntro';
import { useLanguage } from '../i18n/LanguageContext';
type Project = {
    id: string;
    title: string;
    titleId?: string;
    location?: string;
    category?: string;
    categoryId?: string;
    imageUrl: string;
    description?: string;
    descriptionId?: string;
    gallery?: {url:string;label:string;labelId:string}[];
};
const study: Project = { id: 'graha-famili', title: 'Graha Famili', location: 'Surabaya', category: 'Client-supplied project imagery', categoryId: 'Visual proyek dari klien', imageUrl: '/images/editorial/graha-living.webp' };
const somerset: Project = {
 id: 'somerset-house', title: 'Somerset House', location: 'Citraland, Surabaya',
 category: 'Client-supplied project imagery', categoryId: 'Visual proyek dari klien',
 imageUrl: '/images/editorial/somerset-workspace.webp',
 description: 'A study in texture and light across a workspace, bedroom, bathroom and staircase. Sculptural wall surfaces bring a distinct material character to each space.',
 descriptionId: 'Studi tekstur dan cahaya pada ruang kerja, kamar tidur, kamar mandi, dan tangga. Permukaan dinding skulptural menghadirkan karakter material pada setiap ruang.',
 gallery: [
  {url:'/images/editorial/somerset-bedroom.webp',label:'Bedroom',labelId:'Kamar tidur'},
  {url:'/images/editorial/somerset-bedroom-arrival.webp',label:'Bedroom / arrival',labelId:'Kamar tidur / pintu masuk'},
  {url:'/images/editorial/somerset-bedroom-detail.webp',label:'Wall detail',labelId:'Detail dinding'},
  {url:'/images/editorial/somerset-bathroom.webp',label:'Bathroom',labelId:'Kamar mandi'},
  {url:'/images/editorial/somerset-staircase.webp',label:'Staircase',labelId:'Tangga'}
 ]
};
const localProjects = [somerset, study];
export default function PublicProjects() {
    const c = usePublicCopy();
    const { language } = useLanguage();
    const { projectId } = useParams();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => { let active = true; api.getFeaturedProjects().then(r => { if (active && Array.isArray(r.data))
        setProjects(r.data.filter((p: Project) => p.title && p.imageUrl).map((p: Project) => ({ ...p, id: String(p.id) }))); }).catch(() => { }).finally(() => { if (active)
        setLoaded(true); }); return () => { active = false; }; }, []);
    const title = (p: Project) => language === 'id' ? (p.titleId || p.title) : p.title;
    const caption = (p: Project) => language === 'id' ? (p.categoryId || p.category) : p.category;
    if (projectId) {
        const project = [...localProjects, ...projects].find(p => p.id === projectId);
        if (!project)
            return <><PublicPageIntro label={c('Projects', 'Proyek')} title={loaded ? c('Project unavailable.', 'Proyek tidak tersedia.') : c('Loading project…', 'Memuat proyek…')} description={c('Explore the project gallery or speak with our team.', 'Jelajahi galeri proyek atau hubungi tim kami.')}/><div className="editorial-wrap public-story"><Link className="editorial-text-link" to="/projects">{c('Back to projects', 'Kembali ke proyek')} ↗</Link></div></>;
        return <><PublicPageIntro label={c('Projects', 'Proyek')} title={title(project)} description={[project.location, caption(project)].filter(Boolean).join(' / ')} image={project.imageUrl} caption={caption(project)}/><section className="editorial-wrap public-story"><p>{language === 'id' ? (project.descriptionId || project.description) : project.description}</p><Link className="editorial-text-link" to="/projects">{c('All projects', 'Semua proyek')} ↗</Link></section>{project.gallery && <section className="editorial-wrap public-project-gallery">{project.gallery.map(image => <figure key={image.url}><img src={image.url} alt={`${title(project)} / ${c(image.label,image.labelId)}`} loading="lazy"/><figcaption>{c(image.label,image.labelId)}</figcaption></figure>)}</section>}<PublicEnquiry /></>;
    }
    const visible = [...localProjects, ...projects.filter(p => !localProjects.some(local => local.id === p.id || p.title.toLowerCase().includes(local.id === 'somerset-house' ? 'somerset' : 'graha famili')))];
    return <><PublicPageIntro label={c('Projects', 'Proyek')} title={c('Spaces with character.', 'Ruang berkarakter.')} description={c('Material, proportion and light. Explore concrete in an architectural context.', 'Material, proporsi, dan cahaya. Jelajahi beton dalam konteks arsitektural.')}/><section className="editorial-wrap public-project-grid">{visible.map(p => <Link to={`/projects/${p.id}`} key={p.id}><figure><img src={p.imageUrl} alt={title(p)} loading="lazy"/><figcaption><h2>{title(p)} <span aria-hidden="true">↗</span></h2><p>{[p.location, caption(p)].filter(Boolean).join(' / ')}</p></figcaption></figure></Link>)}</section><PublicEnquiry /></>;
}
