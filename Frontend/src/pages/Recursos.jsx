import { createSignal, createMemo, For, Show } from 'solid-js';
import { formatDate } from '../lib/utils';
import ResourceModal from '../components/ResourceModal';

const RESOURCES = [
  { id:1, cat:'cv', type:'pdf', title:'Plantilla de CV Minimalista', desc:'Diseño limpio y profesional ideal para cargos en tecnología, marketing y administración.', thumb:'thumb-purple', icon:'📄', views:1420, date:'2024-04-10', tags:['CV','Plantilla','Word'] },
  { id:2, cat:'cv', type:'guide', title:'Cómo escribir un resumen profesional que llame la atención', desc:'Aprende a redactar las primeras 3 líneas de tu CV que determinan si el reclutador sigue leyendo o no.', thumb:'thumb-blue', icon:'✍️', views:980, date:'2024-03-28', tags:['CV','Redacción','Reclutadores'] },
  { id:3, cat:'cv', type:'article', title:'Los 7 errores más comunes en un CV en El Salvador', desc:'Análisis de los errores que hacen que tu currículum sea descartado en los primeros 30 segundos.', thumb:'thumb-red', icon:'⚠️', views:2100, date:'2024-04-02', tags:['CV','Errores','El Salvador'] },
  { id:4, cat:'cv', type:'pdf', title:'Plantilla de CV Creativo para Diseñadores', desc:'Perfecta para profesionales del diseño, publicidad y artes visuales.', thumb:'thumb-orange', icon:'🎨', views:760, date:'2024-03-15', tags:['CV','Diseño','Creativo'] },
  { id:5, cat:'cv', type:'article', title:'CV en inglés: guía para candidatos bilingües', desc:'Cómo adaptar tu currículum cuando aplicas a empresas internacionales.', thumb:'thumb-green', icon:'🌍', views:540, date:'2024-04-05', tags:['CV','Inglés','Bilingüe'] },
  { id:6, cat:'interview', type:'guide', title:'50 preguntas frecuentes de entrevista (con respuestas)', desc:'La guía definitiva con las preguntas más comunes en entrevistas laborales y cómo estructurar tus respuestas.', thumb:'thumb-blue', icon:'🎯', views:3400, date:'2024-04-12', tags:['Entrevista','STAR','Preparación'] },
  { id:7, cat:'interview', type:'video', title:'Cómo responder "¿Cuál es tu mayor debilidad?"', desc:'Tutorial en video con ejemplos reales y la psicología detrás de esta pregunta trampa.', thumb:'thumb-red', icon:'🎥', views:2800, date:'2024-04-08', tags:['Entrevista','Video','Debilidades'] },
  { id:8, cat:'interview', type:'article', title:'Lenguaje corporal en entrevistas: lo que no debes hacer', desc:'Señales no verbales que comunican inseguridad y cómo proyectar confianza.', thumb:'thumb-orange', icon:'🤝', views:1150, date:'2024-03-20', tags:['Entrevista','Lenguaje Corporal','Confianza'] },
  { id:9, cat:'interview', type:'article', title:'Mock interview: cómo practicar antes de la entrevista real', desc:'Estrategias y ejercicios para simular entrevistas.', thumb:'thumb-purple', icon:'🎭', views:620, date:'2024-04-01', tags:['Entrevista','Práctica','Mock'] },
  { id:10, cat:'skills', type:'guide', title:'Las 10 habilidades más demandadas en El Salvador 2024', desc:'Análisis del mercado laboral local.', thumb:'thumb-green', icon:'📊', views:1900, date:'2024-04-14', tags:['Habilidades','Mercado','2024'] },
  { id:11, cat:'skills', type:'article', title:'Cómo mejorar tus soft skills sin tomar ningún curso', desc:'Actividades del día a día que desarrollan comunicación, liderazgo y empatía.', thumb:'thumb-yellow', icon:'🌟', views:870, date:'2024-03-25', tags:['Soft Skills','Comunicación','Liderazgo'] },
  { id:12, cat:'skills', type:'video', title:'Excel avanzado: tablas dinámicas en 20 minutos', desc:'Tutorial práctico enfocado en las funciones que más piden las empresas.', thumb:'thumb-green', icon:'📈', views:2300, date:'2024-04-07', tags:['Excel','Habilidades Técnicas','Tutorial'] },
  { id:13, cat:'skills', type:'article', title:'Certificaciones gratuitas en línea que valen en el mercado laboral', desc:'Lista curada de certificaciones de Google, Meta, HubSpot y Coursera.', thumb:'thumb-blue', icon:'🏆', views:1560, date:'2024-03-30', tags:['Certificaciones','Gratis','Online'] },
  { id:14, cat:'skills', type:'video', title:'LinkedIn para candidatos: optimiza tu perfil en 30 minutos', desc:'Paso a paso para construir un perfil de LinkedIn que atraiga reclutadores.', thumb:'thumb-purple', icon:'💼', views:3100, date:'2024-04-11', tags:['LinkedIn','Perfil','Redes Profesionales'] },
  { id:15, cat:'career', type:'article', title:'Cómo negociar tu salario sin arruinar la oferta', desc:'Tácticas probadas para negociar con confianza.', thumb:'thumb-orange', icon:'💰', views:2600, date:'2024-04-13', tags:['Salario','Negociación','Carrera'] },
  { id:16, cat:'career', type:'guide', title:'Plan de carrera en 5 años: cómo trazarlo paso a paso', desc:'Metodología práctica para definir objetivos profesionales.', thumb:'thumb-blue', icon:'🗺️', views:740, date:'2024-03-22', tags:['Carrera','Planificación','Objetivos'] },
  { id:17, cat:'career', type:'article', title:'Trabajo remoto en El Salvador: guía completa 2024', desc:'Todo lo que necesitas saber sobre trabajo remoto.', thumb:'thumb-green', icon:'🏠', views:1830, date:'2024-04-06', tags:['Remoto','El Salvador','Freelance'] },
  { id:18, cat:'career', type:'article', title:'Cuándo es el momento de pedir un aumento', desc:'Señales claras de que es el momento correcto.', thumb:'thumb-yellow', icon:'📅', views:980, date:'2024-03-18', tags:['Salario','Aumento','Carrera'] },
  { id:19, cat:'career', type:'video', title:'De empleado a emprendedor: historias reales salvadoreñas', desc:'Entrevistas con profesionales que hicieron el salto.', thumb:'thumb-red', icon:'🚀', views:1420, date:'2024-04-03', tags:['Emprendimiento','Historias','Motivación'] },
  { id:20, cat:'news', type:'article', title:'Mercado laboral en El Salvador: tendencias Q2 2024', desc:'Análisis de los sectores con mayor crecimiento en contratación.', thumb:'thumb-blue', icon:'📰', views:1100, date:'2024-04-15', tags:['Tendencias','Mercado','2024'] },
  { id:21, cat:'news', type:'article', title:'Industrias tecnológicas en auge: FinTech y EdTech', desc:'El crecimiento de startups salvadoreñas.', thumb:'thumb-purple', icon:'💡', views:890, date:'2024-04-09', tags:['Tecnología','FinTech','Startups'] },
  { id:22, cat:'news', type:'article', title:'Cambios en la Ley Laboral 2024', desc:'Resumen de los cambios legislativos recientes.', thumb:'thumb-red', icon:'⚖️', views:1650, date:'2024-04-04', tags:['Ley Laboral','Derechos','2024'] },
  { id:23, cat:'news', type:'article', title:'Los sectores que más contratan en centroamérica', desc:'Reporte regional con datos de empleo.', thumb:'thumb-green', icon:'🌎', views:720, date:'2024-03-27', tags:['Centroamérica','Empleo','Regional'] },
  { id:24, cat:'news', type:'video', title:'Análisis de salarios 2024 por área y experiencia', desc:'Video-informe con los rangos salariales actualizados.', thumb:'thumb-orange', icon:'📊', views:2200, date:'2024-04-16', tags:['Salarios','Análisis','Video'] },
];

const TYPE_LABELS = { article:'Artículo', video:'Video', pdf:'Plantilla PDF', guide:'Guía' };
const TYPE_CLASSES = { article:'type-article', video:'type-video', pdf:'type-pdf', guide:'type-guide' };
const CAT_LABELS = { cv:'CV', interview:'Entrevista', skills:'Habilidades', career:'Carrera', news:'Noticias' };
const CAT_CLASSES = { cv:'cat-cv', interview:'cat-interview', skills:'cat-skills', career:'cat-career', news:'cat-news' };

const TABS = [
  { value: 'all', label: 'Todo', icon: 'bi-grid-fill' },
  { value: 'cv', label: 'Mejora tu CV', icon: 'bi-file-earmark-person' },
  { value: 'interview', label: 'Entrevistas', icon: 'bi-mic-fill' },
  { value: 'skills', label: 'Habilidades', icon: 'bi-lightning-fill' },
  { value: 'career', label: 'Carrera', icon: 'bi-graph-up-arrow' },
  { value: 'news', label: 'Noticias', icon: 'bi-newspaper' },
];

const TYPE_FILTERS = [
  { value: 'all', label: 'Todos los tipos', icon: 'bi-grid' },
  { value: 'article', label: 'Artículos', icon: 'bi-file-text' },
  { value: 'video', label: 'Videos', icon: 'bi-play-circle' },
  { value: 'pdf', label: 'PDFs / Plantillas', icon: 'bi-file-earmark-pdf' },
  { value: 'guide', label: 'Guías paso a paso', icon: 'bi-book' },
];

export default function Recursos() {
  const [activeTab, setActiveTab] = createSignal('all');
  const [activeType, setActiveType] = createSignal('all');
  const [searchQ, setSearchQ] = createSignal('');
  const [sortBy, setSortBy] = createSignal('recent');
  const [selectedResource, setSelectedResource] = createSignal(null);
  const [showModal, setShowModal] = createSignal(false);

  const openResource = (r) => {
    setSelectedResource(r);
    setShowModal(true);
  };

  const closeResource = () => {
    setShowModal(false);
    setTimeout(() => setSelectedResource(null), 200);
  };

  const filtered = createMemo(() => {
    let list = RESOURCES.filter(r => {
      if (activeTab() !== 'all' && r.cat !== activeTab()) return false;
      if (activeType() !== 'all' && r.type !== activeType()) return false;
      if (searchQ()) {
        const q = searchQ().toLowerCase();
        return r.title.toLowerCase().includes(q) ||
               r.desc.toLowerCase().includes(q) ||
               r.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });

    if (sortBy() === 'popular') list = [...list].sort((a, b) => b.views - a.views);
    else if (sortBy() === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else list = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));

    return list;
  });

  const counts = createMemo(() => ({
    all: RESOURCES.length,
    article: RESOURCES.filter(r => r.type === 'article').length,
    video: RESOURCES.filter(r => r.type === 'video').length,
    pdf: RESOURCES.filter(r => r.type === 'pdf').length,
    guide: RESOURCES.filter(r => r.type === 'guide').length,
  }));

  return (
    <>
      <div class="res-hero">
        <div class="container-xl position-relative">
          <div class="row">
            <div class="col-lg-7">
              <div class="hero-badge mb-3" style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)' }}>
                <i class="bi bi-stars me-1"></i>Centro de Recursos Profesionales
              </div>
              <h1 class="tb-hero-title" style={{ marginBottom: '14px' }}>
                Todo lo que necesitas para<br /><em>crecer profesionalmente</em>
              </h1>
              <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '16px', maxWidth: '520px', marginBottom: '28px' }}>
                Guías, artículos, plantillas y tutoriales diseñados para impulsar tu carrera en El Salvador.
              </p>
              <div class="res-search-wrapper">
                <input
                  type="text"
                  placeholder="Buscar recursos…"
                  class="res-search-input"
                  value={searchQ()}
                  onInput={(e) => setSearchQ(e.target.value)}
                />
                <button class="res-search-btn">
                  <i class="bi bi-search me-1"></i>Buscar
                </button>
              </div>
              <div class="res-stats-grid">
                {[{ val: '24+', lbl: 'Artículos' }, { val: '12', lbl: 'Plantillas PDF' }, { val: '8', lbl: 'Video Guías' }, { val: '100%', lbl: 'Gratis' }].map(s => (
                  <div style={{ textAlign: 'center' }}>
                    <div class="metric-value" style={{ color: '#fff' }}>{s.val}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.55)', marginTop: '2px' }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="res-tab-bar">
        <div class="container-xl">
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
            <For each={TABS}>
              {(tab) => (
                <button
                  class={`res-tab-btn${activeTab() === tab.value ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab.value)}
                >
                  <i class={`bi ${tab.icon}`}></i>{tab.label}
                </button>
              )}
            </For>
          </div>
        </div>
      </div>

      <div class="container-xl" style={{ padding: '32px 0 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px', alignItems: 'start' }}>
          <aside class="d-none d-lg-block">
            <div class="res-sidebar-card">
              <div class="res-sidebar-title">
                <i class="bi bi-funnel"></i>Filtrar por tipo
              </div>
              <For each={TYPE_FILTERS}>
                {(ft) => (
                  <button
                    class={`res-filter-btn${activeType() === ft.value ? ' active' : ''}`}
                    onClick={() => setActiveType(ft.value)}
                  >
                    <i class={`bi ${ft.icon}`}></i>{ft.label}
                    <span class="res-filter-badge">{counts()[ft.value]}</span>
                  </button>
                )}
              </For>
            </div>

            <div class="res-subscribe-box">
              <h5 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '8px' }}>📬 Recursos al correo</h5>
              <p style={{ fontSize: '13px', color: 'var(--text-m)', marginBottom: '16px' }}>Recibe cada semana las últimas guías.</p>
              <div style={{ display: 'flex', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <input type="email" placeholder="tu@correo.com" style={{ flex: 1, border: 'none', padding: '11px 14px', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-body)', background: 'var(--bg)' }} />
                <button style={{ background: 'var(--primary)', border: 'none', padding: '11px 18px', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Suscribir</button>
              </div>
            </div>
          </aside>

          <main>
            <div class="res-cta-banner">
              <div class="res-cta-icon">
                <i class="bi bi-file-earmark-arrow-down"></i>
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '4px' }}>Plantillas de CV gratuitas</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-m)', margin: 0 }}>Descarga nuestras plantillas profesionales en PDF y Word.</p>
              </div>
              <button class="btn tb-btn-primary ms-auto flex-shrink-0" onClick={() => setActiveTab('cv')}>
                <i class="bi bi-download me-1"></i>Ver plantillas
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-m)', margin: 0 }}>Mostrando <strong>{filtered().length}</strong> recursos</p>
              <select
                style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '7px 12px', fontSize: '13px', color: 'var(--text)', background: 'var(--surface)', fontFamily: 'var(--font-body)' }}
                value={sortBy()}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Más recientes</option>
                <option value="popular">Más populares</option>
                <option value="az">A – Z</option>
              </select>
            </div>

            <Show
              when={filtered().length > 0}
              fallback={
                <div class="res-empty-state">
                  <i class="bi bi-search" style={{ fontSize: '3rem', opacity: '.3', display: 'block', marginBottom: '12px' }}></i>
                  <p>No se encontraron recursos con ese criterio.</p>
                  <button class="btn tb-btn-primary mt-2" onClick={() => { setActiveTab('all'); setActiveType('all'); setSearchQ(''); }}>Ver todos los recursos</button>
                </div>
              }
            >
              <div class="res-card-grid">
                <For each={filtered()}>
                  {(r) => (
                    <div class="res-card" onClick={() => openResource(r)}>
                      <div class="res-thumb" style={{ background: r.thumb === 'thumb-purple' ? 'linear-gradient(135deg,#f3e8ff,#e9d5ff)' : r.thumb === 'thumb-blue' ? 'linear-gradient(135deg,#dbeafe,#bfdbfe)' : r.thumb === 'thumb-orange' ? 'linear-gradient(135deg,#ffedd5,#fed7aa)' : r.thumb === 'thumb-green' ? 'linear-gradient(135deg,#dcfce7,#bbf7d0)' : r.thumb === 'thumb-yellow' ? 'linear-gradient(135deg,#fef9c3,#fef08a)' : 'linear-gradient(135deg,#fee2e2,#fecaca)' }}>
                        {r.icon}
                      </div>
                      <div class="res-body">
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', borderRadius: '6px', padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '10px', background: CAT_CLASSES[r.cat]?.includes('cat-cv') ? 'rgba(26,58,92,.08)' : CAT_CLASSES[r.cat]?.includes('cat-interview') ? 'rgba(59,130,246,.08)' : CAT_CLASSES[r.cat]?.includes('cat-skills') ? 'rgba(217,119,6,.08)' : CAT_CLASSES[r.cat]?.includes('cat-career') ? 'rgba(26,58,92,.08)' : 'rgba(22,163,74,.08)', color: CAT_CLASSES[r.cat]?.includes('cat-cv') ? 'var(--primary)' : CAT_CLASSES[r.cat]?.includes('cat-interview') ? '#2563eb' : CAT_CLASSES[r.cat]?.includes('cat-skills') ? 'var(--warning)' : CAT_CLASSES[r.cat]?.includes('cat-career') ? 'var(--primary)' : 'var(--success)' }}>
                            {CAT_LABELS[r.cat]}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, marginLeft: '4px', background: r.type === 'article' ? 'rgba(59,130,246,.08)' : r.type === 'video' ? 'rgba(239,68,68,.08)' : r.type === 'pdf' ? 'rgba(22,163,74,.08)' : 'rgba(168,85,247,.08)', color: r.type === 'article' ? '#2563eb' : r.type === 'video' ? '#dc2626' : r.type === 'pdf' ? 'var(--success)' : '#7c3aed' }}>
                            {TYPE_LABELS[r.type]}
                          </span>
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', color: 'var(--primary)', marginBottom: '8px', lineHeight: 1.3 }}>{r.title}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-m)', lineHeight: 1.6, flex: 1 }}>{r.desc}</p>
                      </div>
                      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-l)' }}>
                          <i class="bi bi-eye"></i>{r.views.toLocaleString()} vistas
                          <span style={{ fontSize: '11px' }}>·</span>
                          <i class="bi bi-calendar3"></i>{formatDate(r.date)}
                        </div>
                        <button class="res-card-action" onClick={(e) => { e.stopPropagation(); openResource(r); }}>
                          {r.type === 'video' ? <><i class="bi bi-play-fill"></i>Ver video</> : r.type === 'pdf' ? <><i class="bi bi-download"></i>Descargar</> : <><i class="bi bi-book-fill"></i>Leer</>}
                        </button>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </main>
        </div>
      </div>

      <ResourceModal show={showModal()} resource={selectedResource()} close={closeResource} />
    </>
  );
}
