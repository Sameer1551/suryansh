import { useState } from 'react';
import { Plus, ExternalLink, Play, Trash2, Camera, Clapperboard } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/ui/Common';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, Select, Input } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { type PortfolioCategory, type PortfolioProject } from '@/types';

const categories: ('All' | PortfolioCategory)[] = [
  'All',
  'Commercials / Advertisements',
  'Feature Films',
  'Short Films',
  'Music Videos',
  'Documentary',
  'Experimental Work',
  'BTS / Stills',
  'Showreels',
];

export function PortfolioView() {
  const { portfolio, dispatch } = useData();
  const [activeCategory, setActiveCategory] = useState<'All' | PortfolioCategory>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioProject | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const currentYear = new Date().getFullYear().toString();
  const [form, setForm] = useState({
    title: '',
    category: 'Commercials / Advertisements' as PortfolioCategory,
    year: currentYear,
    role: 'Director of Photography',
    director: '',
    productionHouse: '',
    cinematographer: 'Suryansh',
    projectLink: '',
    imdbLink: '',
    btsLink: '',
    stills: '',
    showreelSegment: '',
    websiteStatus: 'Published',
    socialMediaStatus: 'Published',
  });

  const filtered = activeCategory === 'All'
    ? portfolio
    : portfolio.filter((p) => p.category === activeCategory);

  const handleAddSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title.trim()) return;

    const newProject: PortfolioProject = {
      id: `PF-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      year: form.year.trim() || currentYear,
      role: form.role.trim() || 'Director of Photography',
      director: form.director.trim(),
      productionHouse: form.productionHouse.trim(),
      cinematographer: form.cinematographer.trim() || 'Suryansh',
      projectLink: form.projectLink.trim(),
      imdbLink: form.imdbLink.trim(),
      btsLink: form.btsLink.trim(),
      stills: form.stills.trim(),
      showreelSegment: form.showreelSegment.trim(),
      websiteStatus: form.websiteStatus,
      socialMediaStatus: form.socialMediaStatus,
    };

    dispatch({ type: 'ADD_PORTFOLIO', payload: newProject });
    setAddOpen(false);
    setForm({
      title: '',
      category: 'Commercials / Advertisements',
      year: currentYear,
      role: 'Director of Photography',
      director: '',
      productionHouse: '',
      cinematographer: 'Suryansh',
      projectLink: '',
      imdbLink: '',
      btsLink: '',
      stills: '',
      showreelSegment: '',
      websiteStatus: 'Published',
      socialMediaStatus: 'Published',
    });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      dispatch({ type: 'DELETE_PORTFOLIO', payload: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const confirmClearAll = () => {
    dispatch({ type: 'CLEAR_PORTFOLIO' });
    setClearAllOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Portfolio"
        subtitle={`${portfolio.length} project${portfolio.length === 1 ? '' : 's'}`}
        action={
          <div className="flex items-center gap-2">
            {portfolio.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Trash2 size={13} />}
                onClick={() => setClearAllOpen(true)}
              >
                Clear All
              </Button>
            )}
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
              Add Project
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-bg-card text-text-primary border border-border'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={<Clapperboard size={36} className="text-amber-500/70" />}
            title="No projects here yet"
            description="Your portfolio is ready for your real cinematography works. Click 'Add Project' to add feature films, commercials, music videos, documentaries, or showreels."
            action={
              <Button variant="primary" icon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
                Add Project
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((project) => (
            <Card key={project.id} hoverable className="overflow-hidden group flex flex-col justify-between">
              {/* Thumbnail */}
              <div>
                <div className="relative aspect-video bg-bg-secondary overflow-hidden">
                  {project.stills ? (
                    <img
                      src={project.stills}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-1.5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-b border-border-subtle">
                      <Camera size={26} className="text-amber-500/60" />
                      <span className="text-3xs text-text-muted tracking-wider uppercase font-medium">{project.category}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-2 left-2">
                    <Badge tone="default" variant="solid">{project.category}</Badge>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <Badge tone={project.websiteStatus === 'Published' ? 'success' : 'warning'} variant="solid">
                      {project.websiteStatus}
                    </Badge>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    title="Delete project"
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-slate-700/60 text-text-muted hover:text-rose-400 hover:border-rose-500/50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-heading font-semibold text-text-primary leading-snug">{project.title}</h3>
                    <span className="text-2xs text-text-muted shrink-0">{project.year}</span>
                  </div>
                  <div className="text-2xs text-text-secondary mt-1 space-y-0.5">
                    <div>{project.role}</div>
                    {(project.director || project.productionHouse) && (
                      <div>
                        {project.director ? `Dir: ${project.director}` : ''}
                        {project.director && project.productionHouse ? ' · ' : ''}
                        {project.productionHouse || ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                  {project.showreelSegment ? (
                    <span className="text-2xs text-text-muted truncate">Showreel: {project.showreelSegment}</span>
                  ) : (
                    <span className="text-2xs text-text-muted truncate">{project.cinematographer || 'DOP'}</span>
                  )}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {project.imdbLink && (
                      <a href={project.imdbLink} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent transition-colors" title="IMDb">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {project.projectLink && (
                      <a href={project.projectLink} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent transition-colors" title="Watch Video">
                        <Play size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Real Portfolio Project"
        subtitle="Add your film, commercial, music video, or showreel"
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddSubmit}>Save Project</Button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Row 1: Title, Category, Year */}
            <Input
              label="Project Title *"
              placeholder="e.g. Desert Odyssey"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as PortfolioCategory })}
            >
              {categories.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Input
              label="Year"
              placeholder="e.g. 2026"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            />

            {/* Row 2: Role, Director, Production House */}
            <Input
              label="Your Role"
              placeholder="e.g. Director of Photography"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
            <Input
              label="Director"
              placeholder="Director name"
              value={form.director}
              onChange={(e) => setForm({ ...form, director: e.target.value })}
            />
            <Input
              label="Production House / Client"
              placeholder="Production company or brand"
              value={form.productionHouse}
              onChange={(e) => setForm({ ...form, productionHouse: e.target.value })}
            />

            {/* Row 3: Project Link, IMDb, Stills URL */}
            <Input
              label="Video / Reel Link (Vimeo / YouTube / Drive)"
              placeholder="https://vimeo.com/..."
              value={form.projectLink}
              onChange={(e) => setForm({ ...form, projectLink: e.target.value })}
            />
            <Input
              label="IMDb Link"
              placeholder="https://imdb.com/title/..."
              value={form.imdbLink}
              onChange={(e) => setForm({ ...form, imdbLink: e.target.value })}
            />
            <Input
              label="Stills / Poster Image URL"
              placeholder="Image link for thumbnail"
              value={form.stills}
              onChange={(e) => setForm({ ...form, stills: e.target.value })}
            />

            {/* Row 4: Website Status, Social Status, Showreel Segment */}
            <Select
              label="Website Status"
              value={form.websiteStatus}
              onChange={(e) => setForm({ ...form, websiteStatus: e.target.value })}
            >
              <option value="Published">Published</option>
              <option value="Drafted">Drafted</option>
              <option value="Not Published">Not Published</option>
            </Select>
            <Select
              label="Social Media Status"
              value={form.socialMediaStatus}
              onChange={(e) => setForm({ ...form, socialMediaStatus: e.target.value })}
            >
              <option value="Published">Published</option>
              <option value="Drafted">Drafted</option>
              <option value="Not Published">Not Published</option>
            </Select>
            <Input
              label="Showreel Segment (Timestamps)"
              placeholder="e.g. 00:00–00:45"
              value={form.showreelSegment}
              onChange={(e) => setForm({ ...form, showreelSegment: e.target.value })}
            />

            {/* Additional Details Toggle */}
            <div className="col-span-full pt-2 border-t border-border-subtle/60 flex items-center justify-between">
              <span className="text-xs font-heading font-medium text-text-muted uppercase tracking-wider">Additional Information</span>
              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
              >
                {showMore ? '▲ Hide Details' : '▼ Show More (Cinematographer, BTS Link)'}
              </button>
            </div>

            {showMore && (
              <>
                <Input
                  label="Cinematographer Name"
                  placeholder="e.g. Suryansh"
                  value={form.cinematographer}
                  onChange={(e) => setForm({ ...form, cinematographer: e.target.value })}
                />
                <div className="col-span-full sm:col-span-2">
                  <Input
                    label="Behind-The-Scenes (BTS) Link"
                    placeholder="Drive or video link"
                    value={form.btsLink}
                    onChange={(e) => setForm({ ...form, btsLink: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Single Project Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Portfolio Project"
        size="sm"
      >
        <div className="p-5 space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to remove <strong className="text-text-primary">{deleteTarget?.title}</strong> from your portfolio?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={confirmDelete}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>

      {/* Clear All Confirmation Modal */}
      <Modal
        open={clearAllOpen}
        onClose={() => setClearAllOpen(false)}
        title="Clear Entire Portfolio"
        size="sm"
      >
        <div className="p-5 space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to clear all projects from your portfolio? This will leave your portfolio completely clean.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setClearAllOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={confirmClearAll}
            >
              Clear All Projects
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
