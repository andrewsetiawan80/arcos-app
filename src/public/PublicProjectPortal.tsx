import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categorySlug: string | null;
  coverImageUrl: string | null;
  variants: { id: string; name: string; color: string }[];
  createdAt: string;
}

export default function PublicProjectPortal() {
  const { token } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api.getSharedProject(token).then(r => {
      if (r.error) setError('Project not found or link has expired.');
      else setProject(r.data as Project);
    });
  }, [token]);

  if (error) return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#232323] flex items-center justify-center">
      <div className="text-center px-6">
        <p className="text-[#6F6F6F] mb-6">{error}</p>
        <Link to="/" className="text-sm font-medium text-[#232323] hover:underline">Back to Home</Link>
      </div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#232323] flex items-center justify-center">
      <p className="text-[#6F6F6F]">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#232323]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-[#6F6F6F] mb-2">Project from ARCOS</p>
        <h1 className="text-3xl font-light tracking-tight mb-6">{project.name}</h1>
        {project.categorySlug && (
          <p className="text-sm text-[#6F6F6F] mb-8">{project.categorySlug.replace(/-/g, ' ')}</p>
        )}

        {project.coverImageUrl && (
          <div className="aspect-[16/9] overflow-hidden bg-[#E0E0E0] mb-10">
            <img src={project.coverImageUrl} alt={project.name} className="w-full h-full object-cover" />
          </div>
        )}

        {project.description && (
          <div className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#6F6F6F] mb-4">Description</h2>
            <p className="text-base font-light leading-relaxed text-[#4A4A4A] whitespace-pre-wrap">{project.description}</p>
          </div>
        )}

        {project.variants && project.variants.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#6F6F6F] mb-4">Variants</h2>
            <div className="flex flex-wrap gap-3">
              {project.variants.map(v => (
                <div key={v.id} className="px-4 py-2 border border-[#E0E0E0] text-sm">
                  {v.name}{v.color ? ` — ${v.color}` : ''}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#E0E0E0] text-center">
          <p className="text-xs text-[#AFAFAF]">ARCOS — Architectural Concrete Solutions</p>
          <p className="text-xs text-[#AFAFAF]">Surabaya, Indonesia</p>
          <Link to="/" className="inline-block mt-6 text-sm font-medium text-[#232323] hover:underline">Visit arcosworks.com</Link>
        </div>
      </div>
    </div>
  );
}
