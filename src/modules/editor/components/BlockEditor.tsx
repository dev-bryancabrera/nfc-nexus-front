import { useState, useEffect, useRef } from 'react';
import type { CardBlock } from '../../../types';
import { storageService } from '../../../services/storage.service';
import toast from 'react-hot-toast';

interface Props {
  block: CardBlock;
  onChange: (id: string, config: Record<string, unknown>) => void;
}

export default function BlockEditor({ block, onChange }: Props) {
  const set = (key: string, val: unknown) => onChange(block.id, { ...block.config, [key]: val });
  const cfg = block.config;

  switch (block.type) {

    /* ═══ SPOTIFY ══════════════════════════════════════════════════════════ */
    case 'spotify_track':
    case 'spotify_playlist':
    case 'spotify_album': {
      const kind = block.type === 'spotify_track' ? 'track' : block.type === 'spotify_playlist' ? 'playlist' : 'album';
      const embedUrl = cfg.embed_url as string || '';
      return (
        <div className="space-y-2">
          <label className="label">URL de Spotify ({kind})</label>
          <input className="input" placeholder={`https://open.spotify.com/${kind}/...`}
            value={cfg.spotify_url as string || ''}
            onChange={e => {
              const url = e.target.value;
              const match = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
              const id = match?.[2];
              onChange(block.id, { ...cfg, spotify_url: url, embed_url: id ? `https://open.spotify.com/embed/${kind}/${id}?utm_source=generator` : '' });
            }} />
          {embedUrl && <iframe src={embedUrl} width="100%" height={kind==='track'?80:352} allow="autoplay; clipboard-write; encrypted-media; fullscreen" className="rounded-xl border-0 mt-2" />}
          <p className="text-[10px] text-[var(--text-dim)]">Pega la URL de Spotify — embed automático</p>
        </div>
      );
    }

    /* ═══ MENU ═════════════════════════════════════════════════════════════ */
    case 'menu': {
      const categories = (cfg.categories as {name:string;items:{name:string;price:string;description?:string;emoji?:string}[]}[]) || [];
      return (
        <div className="space-y-3">
          <label className="label">Categorías del menú</label>
          {categories.map((cat, ci) => (
            <div key={ci} className="bg-bg border border-[var(--border)] rounded-xl p-3 space-y-2">
              <input className="input" placeholder="Nombre categoría" value={cat.name} onChange={e => { const u=[...categories]; u[ci]={...cat,name:e.target.value}; set('categories',u); }} />
              {cat.items.map((item,ii) => (
                <div key={ii} className="flex gap-2">
                  <input className="input w-8 text-center px-1" placeholder="🍕" value={item.emoji||''} onChange={e=>{ const u=[...categories]; u[ci].items[ii].emoji=e.target.value; set('categories',u); }} />
                  <input className="input flex-1" placeholder="Nombre plato" value={item.name} onChange={e=>{ const u=[...categories]; u[ci].items[ii].name=e.target.value; set('categories',u); }} />
                  <input className="input w-24" placeholder="$0.00" value={item.price} onChange={e=>{ const u=[...categories]; u[ci].items[ii].price=e.target.value; set('categories',u); }} />
                  <button className="text-danger text-xs px-2" onClick={()=>{ const u=[...categories]; u[ci].items.splice(ii,1); set('categories',u); }}>✕</button>
                </div>
              ))}
              <button className="btn btn-ghost text-xs" onClick={()=>{ const u=[...categories]; u[ci].items.push({name:'',price:'',emoji:'🍽️'}); set('categories',u); }}>+ Plato</button>
            </div>
          ))}
          <button className="btn btn-secondary text-xs w-full justify-center" onClick={()=>set('categories',[...categories,{name:'Nueva categoría',items:[]}])}>+ Categoría</button>
        </div>
      );
    }

    /* ═══ PROMOTION / COUPON / ORDER ════════════════════════════════════════ */
    case 'promotion':
      return (
        <div className="space-y-2">
          <div><label className="label">Título</label><input className="input" value={cfg.title as string||''} onChange={e=>set('title',e.target.value)} placeholder="2x1 en bebidas" /></div>
          <div><label className="label">Descripción</label><textarea className="input resize-none h-16" value={cfg.description as string||''} onChange={e=>set('description',e.target.value)} /></div>
          <div><label className="label">Descuento</label><input className="input" value={cfg.discount as string||''} onChange={e=>set('discount',e.target.value)} placeholder="20%" /></div>
          <div><label className="label">Válido hasta</label><input className="input" type="date" value={cfg.valid_until as string||''} onChange={e=>set('valid_until',e.target.value)} /></div>
        </div>
      );
    case 'coupon':
      return (
        <div className="space-y-2">
          <div><label className="label">Código</label><input className="input font-mono uppercase" value={cfg.code as string||''} onChange={e=>set('code',e.target.value.toUpperCase())} placeholder="NEXUS20" /></div>
          <div><label className="label">Descuento</label><input className="input" value={cfg.discount as string||''} onChange={e=>set('discount',e.target.value)} placeholder="20% off" /></div>
          <div><label className="label">Descripción</label><input className="input" value={cfg.description as string||''} onChange={e=>set('description',e.target.value)} /></div>
          <div><label className="label">Válido hasta</label><input className="input" type="date" value={cfg.valid_until as string||''} onChange={e=>set('valid_until',e.target.value)} /></div>
        </div>
      );
    case 'order_link':
      return (
        <div className="space-y-2">
          <div><label className="label">Label del botón</label><input className="input" value={cfg.label as string||'Pedir ahora'} onChange={e=>set('label',e.target.value)} /></div>
          <div><label className="label">URL</label><input className="input" value={cfg.url as string||''} onChange={e=>set('url',e.target.value)} placeholder="https://..." /></div>
        </div>
      );

    /* ═══ MEDICAL ═══════════════════════════════════════════════════════════ */
    case 'blood_type':
      return (
        <div className="space-y-2">
          <div><label className="label">Tipo de sangre</label>
            <select className="input" value={cfg.blood_type as string||''} onChange={e=>set('blood_type',e.target.value)}>
              <option value="">Seleccionar...</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t=><option key={t}>{t}</option>)}
            </select></div>
          <div><label className="label">Notas</label><input className="input" value={cfg.notes as string||''} onChange={e=>set('notes',e.target.value)} /></div>
        </div>
      );
    case 'allergies': {
      const allergies=(cfg.allergies as string[])||[];
      return (
        <div className="space-y-2">
          <label className="label">Alergias (una por línea)</label>
          <textarea className="input resize-none h-20 font-mono text-xs" value={allergies.join('\n')} onChange={e=>set('allergies',e.target.value.split('\n').filter(Boolean))} placeholder={"Penicilina\nMariscos\nNueces"} />
          <div><label className="label">Severidad</label>
            <select className="input" value={cfg.severity as string||'moderate'} onChange={e=>set('severity',e.target.value)}>
              <option value="mild">Leve</option><option value="moderate">Moderada</option><option value="severe">Severa</option><option value="anaphylaxis">Anafilaxia ⚠️</option>
            </select></div>
          <div><label className="label">Notas</label><input className="input" value={cfg.notes as string||''} onChange={e=>set('notes',e.target.value)} /></div>
        </div>
      );
    }
    case 'emergency_contact':
      return (
        <div className="space-y-2">
          {[['name','Nombre completo'],['relationship','Relación (Esposo/a, Padre...)'],['phone','Teléfono principal'],['phone_alt','Teléfono alternativo']].map(([k,l])=>(
            <div key={k}><label className="label">{l}</label><input className="input" value={cfg[k] as string||''} onChange={e=>set(k,e.target.value)} /></div>
          ))}
        </div>
      );
    case 'medical_conditions': {
      const conds=(cfg.conditions as string[])||[];
      return (
        <div className="space-y-2">
          <label className="label">Condiciones (una por línea)</label>
          <textarea className="input resize-none h-20 font-mono text-xs" value={conds.join('\n')} onChange={e=>set('conditions',e.target.value.split('\n').filter(Boolean))} placeholder={"Diabetes tipo 2\nHipertensión"} />
          <div><label className="label">Notas médicas</label><textarea className="input resize-none h-16" value={cfg.notes as string||''} onChange={e=>set('notes',e.target.value)} /></div>
        </div>
      );
    }
    case 'medications': {
      const meds=(cfg.medications as {name:string;dose:string;frequency:string}[])||[];
      return (
        <div className="space-y-2">
          <label className="label">Medicamentos</label>
          {meds.map((m,i)=>(
            <div key={i} className="bg-bg border border-[var(--border)] rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Nombre" value={m.name} onChange={e=>{const u=[...meds];u[i].name=e.target.value;set('medications',u);}} />
                <button className="text-danger text-xs px-2" onClick={()=>set('medications',meds.filter((_,j)=>j!==i))}>✕</button>
              </div>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Dosis (ej: 10mg)" value={m.dose} onChange={e=>{const u=[...meds];u[i].dose=e.target.value;set('medications',u);}} />
                <input className="input flex-1" placeholder="Frecuencia" value={m.frequency} onChange={e=>{const u=[...meds];u[i].frequency=e.target.value;set('medications',u);}} />
              </div>
            </div>
          ))}
          <button className="btn btn-secondary text-xs w-full justify-center" onClick={()=>set('medications',[...meds,{name:'',dose:'',frequency:''}])}>+ Medicamento</button>
        </div>
      );
    }

    /* ═══ ACADEMIC ══════════════════════════════════════════════════════════ */
    case 'certificate':
      return (
        <div className="space-y-2">
          {[['title','Título'],['issuer','Emisor'],['date','Fecha'],['credential_url','URL de credencial']].map(([k,l])=>(
            <div key={k}><label className="label">{l}</label><input className="input" type={k==='date'?'date':'text'} value={cfg[k] as string||''} onChange={e=>set(k,e.target.value)} /></div>
          ))}
        </div>
      );
    case 'course':
      return (
        <div className="space-y-2">
          {[['title','Nombre del curso'],['platform','Plataforma (Udemy, Coursera...)'],['url','URL del curso']].map(([k,l])=>(
            <div key={k}><label className="label">{l}</label><input className="input" value={cfg[k] as string||''} onChange={e=>set(k,e.target.value)} /></div>
          ))}
        </div>
      );
    case 'achievement':
      return (
        <div className="space-y-2">
          <div><label className="label">Logro</label><input className="input" value={cfg.title as string||''} onChange={e=>set('title',e.target.value)} placeholder="Top 10% en hackathon" /></div>
          <div><label className="label">Descripción</label><textarea className="input resize-none h-16" value={cfg.description as string||''} onChange={e=>set('description',e.target.value)} /></div>
          <div><label className="label">Icono (emoji)</label><input className="input w-20" value={cfg.icon as string||'🏆'} onChange={e=>set('icon',e.target.value)} /></div>
        </div>
      );
    case 'project': {
      const tech=(cfg.tech_stack as string[])||[];
      return (
        <div className="space-y-2">
          {[['title','Nombre'],['description','Descripción'],['url','URL demo'],['repo_url','Repositorio']].map(([k,l])=>(
            <div key={k}><label className="label">{l}</label>
              {k==='description'?<textarea className="input resize-none h-16" value={cfg[k] as string||''} onChange={e=>set(k,e.target.value)} />
                :<input className="input" value={cfg[k] as string||''} onChange={e=>set(k,e.target.value)} />}</div>
          ))}
          <div><label className="label">Stack (separado por coma)</label>
            <input className="input" value={tech.join(', ')} onChange={e=>set('tech_stack',e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="React, Node.js, PostgreSQL" /></div>
        </div>
      );
    }
    case 'skill_set': {
      const skills=(cfg.skills as {name:string;level:number}[])||[];
      return (
        <div className="space-y-2">
          <div><label className="label">Categoría</label><input className="input" value={cfg.category as string||''} onChange={e=>set('category',e.target.value)} placeholder="Frontend, Backend..." /></div>
          <label className="label">Habilidades</label>
          {skills.map((s,i)=>(
            <div key={i} className="flex items-center gap-2">
              <input className="input flex-1" placeholder="React" value={s.name} onChange={e=>{const u=[...skills];u[i].name=e.target.value;set('skills',u);}} />
              <select className="input w-28" value={s.level} onChange={e=>{const u=[...skills];u[i].level=Number(e.target.value);set('skills',u);}}>
                {[1,2,3,4,5].map(n=><option key={n} value={n}>{'★'.repeat(n)}</option>)}
              </select>
              <button className="text-danger text-xs px-2" onClick={()=>set('skills',skills.filter((_,j)=>j!==i))}>✕</button>
            </div>
          ))}
          <button className="btn btn-secondary text-xs w-full justify-center" onClick={()=>set('skills',[...skills,{name:'',level:3}])}>+ Habilidad</button>
        </div>
      );
    }

    /* ═══ GAMING 🎮 ══════════════════════════════════════════════════════════ */
    case 'gaming_profile':
      return (
        <div className="space-y-2">
          <div><label className="label">Plataforma principal</label>
            <select className="input" value={cfg.platform as string||'pc'} onChange={e=>set('platform',e.target.value)}>
              <option value="pc">PC / Steam</option><option value="psn">PlayStation (PSN)</option>
              <option value="xbox">Xbox / Gamertag</option><option value="nintendo">Nintendo</option><option value="mobile">Mobile</option>
            </select></div>
          <div><label className="label">Username / Gamertag</label><input className="input font-mono" value={cfg.username as string||''} onChange={e=>set('username',e.target.value)} placeholder="ProGamer#1234" /></div>
          <div><label className="label">Juego principal</label><input className="input" value={cfg.main_game as string||''} onChange={e=>set('main_game',e.target.value)} placeholder="Valorant, League of Legends..." /></div>
          <div><label className="label">Rango actual</label><input className="input" value={cfg.rank as string||''} onChange={e=>set('rank',e.target.value)} placeholder="Diamond II, Master..." /></div>
          <div><label className="label">Rol / Posición</label><input className="input" value={cfg.role as string||''} onChange={e=>set('role',e.target.value)} placeholder="Support, Mid lane, AWP..." /></div>
          <div><label className="label">Estado online</label>
            <select className="input" value={cfg.status as string||'online'} onChange={e=>set('status',e.target.value)}>
              <option value="online">🟢 En línea</option><option value="ingame">🎮 En partida</option><option value="away">🟡 Ausente</option><option value="offline">⚫ Offline</option>
            </select></div>
        </div>
      );
    case 'gaming_stats': {
      const stats=(cfg.stats as {label:string;value:string;icon?:string}[])||[];
      return (
        <div className="space-y-2">
          <label className="label">Estadísticas</label>
          {stats.map((s,i)=>(
            <div key={i} className="flex gap-2 items-center">
              <input className="input w-10 text-center px-1" placeholder="🎯" value={s.icon||''} onChange={e=>{const u=[...stats];u[i].icon=e.target.value;set('stats',u);}} />
              <input className="input flex-1" placeholder="K/D Ratio" value={s.label} onChange={e=>{const u=[...stats];u[i].label=e.target.value;set('stats',u);}} />
              <input className="input w-24" placeholder="2.5" value={s.value} onChange={e=>{const u=[...stats];u[i].value=e.target.value;set('stats',u);}} />
              <button className="text-danger text-xs px-2" onClick={()=>set('stats',stats.filter((_,j)=>j!==i))}>✕</button>
            </div>
          ))}
          <button className="btn btn-secondary text-xs w-full justify-center" onClick={()=>set('stats',[...stats,{label:'',value:'',icon:'📊'}])}>+ Estadística</button>
        </div>
      );
    }
    case 'stream_link':
      return (
        <div className="space-y-2">
          <div><label className="label">Plataforma</label>
            <select className="input" value={cfg.platform as string||'twitch'} onChange={e=>set('platform',e.target.value)}>
              <option value="twitch">Twitch</option><option value="youtube">YouTube Live</option><option value="kick">Kick</option><option value="tiktok">TikTok Live</option>
            </select></div>
          <div><label className="label">Username / canal</label><input className="input" value={cfg.username as string||''} onChange={e=>set('username',e.target.value)} placeholder="tucanal" /></div>
          <div><label className="label">¿Stream activo ahora?</label>
            <select className="input" value={String(cfg.is_live)||'false'} onChange={e=>set('is_live',e.target.value==='true')}>
              <option value="false">⚫ Offline</option><option value="true">🔴 En vivo ahora</option>
            </select></div>
          <div><label className="label">Título del stream</label><input className="input" value={cfg.stream_title as string||''} onChange={e=>set('stream_title',e.target.value)} placeholder="¡Ranked hasta Challenger!" /></div>
        </div>
      );
    case 'tournament':
      return (
        <div className="space-y-2">
          <div><label className="label">Torneo</label><input className="input" value={cfg.name as string||''} onChange={e=>set('name',e.target.value)} placeholder="IEM Katowice 2025" /></div>
          <div><label className="label">Juego</label><input className="input" value={cfg.game as string||''} onChange={e=>set('game',e.target.value)} /></div>
          <div><label className="label">Mi resultado</label><input className="input" value={cfg.result as string||''} onChange={e=>set('result',e.target.value)} placeholder="Top 4, Semifinalista..." /></div>
          <div><label className="label">Fecha</label><input className="input" type="date" value={cfg.date as string||''} onChange={e=>set('date',e.target.value)} /></div>
          <div><label className="label">URL / VOD</label><input className="input" value={cfg.url as string||''} onChange={e=>set('url',e.target.value)} placeholder="https://..." /></div>
        </div>
      );

    /* ═══ FITNESS 💪 ═════════════════════════════════════════════════════════ */
    case 'workout_plan': {
      const days=(cfg.days as {day:string;exercises:string[]}[])||[];
      return (
        <div className="space-y-2">
          <div><label className="label">Nombre del plan</label><input className="input" value={cfg.plan_name as string||''} onChange={e=>set('plan_name',e.target.value)} placeholder="Plan Hypertrofia 5x5" /></div>
          <label className="label">Días de entrenamiento</label>
          {days.map((d,i)=>(
            <div key={i} className="bg-bg border border-[var(--border)] rounded-xl p-3">
              <div className="flex gap-2 mb-2">
                <input className="input flex-1" placeholder="Lunes - Pecho y Tríceps" value={d.day} onChange={e=>{const u=[...days];u[i].day=e.target.value;set('days',u);}} />
                <button className="text-danger text-xs px-2" onClick={()=>set('days',days.filter((_,j)=>j!==i))}>✕</button>
              </div>
              <textarea className="input resize-none h-16 font-mono text-xs" placeholder={"Press banca 4x8\nAperturas 3x12"} value={d.exercises.join('\n')} onChange={e=>{const u=[...days];u[i].exercises=e.target.value.split('\n');set('days',u);}} />
            </div>
          ))}
          <button className="btn btn-secondary text-xs w-full justify-center" onClick={()=>set('days',[...days,{day:'',exercises:[]}])}>+ Día</button>
        </div>
      );
    }
    case 'transformation':
      return (
        <div className="space-y-2">
          <div><label className="label">Título</label><input className="input" value={cfg.title as string||''} onChange={e=>set('title',e.target.value)} placeholder="Mi transformación en 6 meses" /></div>
          <div><label className="label">Peso inicial</label><input className="input" value={cfg.start_weight as string||''} onChange={e=>set('start_weight',e.target.value)} placeholder="90kg" /></div>
          <div><label className="label">Peso final</label><input className="input" value={cfg.end_weight as string||''} onChange={e=>set('end_weight',e.target.value)} placeholder="75kg" /></div>
          <div><label className="label">Duración</label><input className="input" value={cfg.duration as string||''} onChange={e=>set('duration',e.target.value)} placeholder="6 meses" /></div>
          <div><label className="label">Descripción</label><textarea className="input resize-none h-16" value={cfg.description as string||''} onChange={e=>set('description',e.target.value)} /></div>
        </div>
      );
    case 'booking_link':
      return (
        <div className="space-y-2">
          <div><label className="label">Servicio</label><input className="input" value={cfg.service as string||''} onChange={e=>set('service',e.target.value)} placeholder="Sesión de coaching 1:1" /></div>
          <div><label className="label">Precio</label><input className="input" value={cfg.price as string||''} onChange={e=>set('price',e.target.value)} placeholder="$50/hora" /></div>
          <div><label className="label">URL de reserva</label><input className="input" value={cfg.url as string||''} onChange={e=>set('url',e.target.value)} placeholder="https://calendly.com/..." /></div>
          <div><label className="label">Plataforma</label>
            <select className="input" value={cfg.platform as string||'calendly'} onChange={e=>set('platform',e.target.value)}>
              <option value="calendly">Calendly</option><option value="cal">Cal.com</option><option value="acuity">Acuity</option><option value="custom">Enlace directo</option>
            </select></div>
        </div>
      );
    case 'macro_tracker': {
      return (
        <div className="space-y-2">
          <div><label className="label">Calorías objetivo/día</label><input className="input" type="number" value={cfg.calories as number||2000} onChange={e=>set('calories',Number(e.target.value))} /></div>
          <div className="grid grid-cols-3 gap-2">
            {[['protein','Proteínas (g)','140'],['carbs','Carbos (g)','200'],['fats','Grasas (g)','60']].map(([k,l,p])=>(
              <div key={k}><label className="label">{l}</label><input className="input" type="number" value={cfg[k] as number||0} onChange={e=>set(k,Number(e.target.value))} placeholder={p} /></div>
            ))}
          </div>
          <div><label className="label">Nota (ej: fase de definición)</label><input className="input" value={cfg.note as string||''} onChange={e=>set('note',e.target.value)} /></div>
        </div>
      );
    }

    /* ═══ CREATOR 🎭 ═════════════════════════════════════════════════════════ */
    case 'social_stats': {
      const platforms=(cfg.platforms as {name:string;followers:string;icon:string}[])||[];
      return (
        <div className="space-y-2">
          <label className="label">Plataformas</label>
          {platforms.map((p,i)=>(
            <div key={i} className="flex gap-2 items-center">
              <input className="input w-10 text-center px-1" placeholder="📷" value={p.icon} onChange={e=>{const u=[...platforms];u[i].icon=e.target.value;set('platforms',u);}} />
              <input className="input flex-1" placeholder="Instagram" value={p.name} onChange={e=>{const u=[...platforms];u[i].name=e.target.value;set('platforms',u);}} />
              <input className="input w-28" placeholder="125K" value={p.followers} onChange={e=>{const u=[...platforms];u[i].followers=e.target.value;set('platforms',u);}} />
              <button className="text-danger text-xs px-2" onClick={()=>set('platforms',platforms.filter((_,j)=>j!==i))}>✕</button>
            </div>
          ))}
          <button className="btn btn-secondary text-xs w-full justify-center" onClick={()=>set('platforms',[...platforms,{name:'',followers:'',icon:'📱'}])}>+ Red social</button>
        </div>
      );
    }
    case 'latest_content': {
      const items=(cfg.items as {title:string;url:string;thumbnail?:string;type:string}[])||[];
      return (
        <div className="space-y-2">
          <div><label className="label">Tipo de contenido</label>
            <select className="input" value={cfg.content_type as string||'video'} onChange={e=>set('content_type',e.target.value)}>
              <option value="video">Videos YouTube</option><option value="reel">Reels / TikToks</option><option value="post">Posts / Fotos</option><option value="podcast">Podcast</option>
            </select></div>
          <label className="label">Últimos contenidos</label>
          {items.map((item,i)=>(
            <div key={i} className="bg-bg border border-[var(--border)] rounded-xl p-3 space-y-2">
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Título del video" value={item.title} onChange={e=>{const u=[...items];u[i].title=e.target.value;set('items',u);}} />
                <button className="text-danger text-xs px-2" onClick={()=>set('items',items.filter((_,j)=>j!==i))}>✕</button>
              </div>
              <input className="input" placeholder="URL del contenido" value={item.url} onChange={e=>{const u=[...items];u[i].url=e.target.value;set('items',u);}} />
            </div>
          ))}
          <button className="btn btn-secondary text-xs w-full justify-center" onClick={()=>set('items',[...items,{title:'',url:'',type:'video'}])}>+ Contenido</button>
        </div>
      );
    }
    case 'merch_link':
      return (
        <div className="space-y-2">
          <div><label className="label">Nombre de la tienda</label><input className="input" value={cfg.store_name as string||'Mi tienda'} onChange={e=>set('store_name',e.target.value)} /></div>
          <div><label className="label">URL de la tienda</label><input className="input" value={cfg.url as string||''} onChange={e=>set('url',e.target.value)} placeholder="https://..." /></div>
          <div><label className="label">Plataforma</label>
            <select className="input" value={cfg.platform as string||'shopify'} onChange={e=>set('platform',e.target.value)}>
              <option value="shopify">Shopify</option><option value="teespring">Spring</option><option value="printful">Printful</option><option value="etsy">Etsy</option><option value="custom">Personalizado</option>
            </select></div>
          <div><label className="label">Descuento activo</label><input className="input" value={cfg.discount_code as string||''} onChange={e=>set('discount_code',e.target.value)} placeholder="FANS10" /></div>
        </div>
      );
    case 'collab_cta':
      return (
        <div className="space-y-2">
          <div><label className="label">Título</label><input className="input" value={cfg.title as string||'¿Colaboramos?'} onChange={e=>set('title',e.target.value)} /></div>
          <div><label className="label">Descripción</label><textarea className="input resize-none h-16" value={cfg.description as string||''} onChange={e=>set('description',e.target.value)} placeholder="Estoy abierto a colaboraciones de marca, UGC, eventos..." /></div>
          <div><label className="label">Email de contacto</label><input className="input" type="email" value={cfg.email as string||''} onChange={e=>set('email',e.target.value)} placeholder="collab@tuemail.com" /></div>
          <div><label className="label">Label del botón</label><input className="input" value={cfg.btn_label as string||'Contactar para collabs'} onChange={e=>set('btn_label',e.target.value)} /></div>
        </div>
      );

    /* ═══ ACCESS / EVENTS 🔐 ═════════════════════════════════════════════════ */
    case 'qr_ticket':
      return (
        <div className="space-y-2">
          <div><label className="label">Nombre del evento</label><input className="input" value={cfg.event_name as string||''} onChange={e=>set('event_name',e.target.value)} /></div>
          <div><label className="label">Código de ticket</label><input className="input font-mono tracking-widest" value={cfg.ticket_code as string||''} onChange={e=>set('ticket_code',e.target.value.toUpperCase())} placeholder="TKT-2025-001" /></div>
          <div><label className="label">Tipo de entrada</label><input className="input" value={cfg.ticket_type as string||'General'} onChange={e=>set('ticket_type',e.target.value)} placeholder="VIP, General, Staff..." /></div>
          <div><label className="label">Fecha del evento</label><input className="input" type="datetime-local" value={cfg.event_date as string||''} onChange={e=>set('event_date',e.target.value)} /></div>
          <div><label className="label">Lugar</label><input className="input" value={cfg.venue as string||''} onChange={e=>set('venue',e.target.value)} /></div>
        </div>
      );
    case 'countdown':
      return (
        <div className="space-y-2">
          <div><label className="label">Título</label><input className="input" value={cfg.title as string||'El evento comienza en...'} onChange={e=>set('title',e.target.value)} /></div>
          <div><label className="label">Fecha objetivo</label><input className="input" type="datetime-local" value={cfg.target_date as string||''} onChange={e=>set('target_date',e.target.value)} /></div>
          <div><label className="label">Texto al terminar</label><input className="input" value={cfg.end_message as string||'¡El evento ha comenzado!'} onChange={e=>set('end_message',e.target.value)} /></div>
        </div>
      );
    case 'attendee_list': {
      const attendees=(cfg.attendees as string[])||[];
      return (
        <div className="space-y-2">
          <div><label className="label">Título</label><input className="input" value={cfg.title as string||'Asistentes confirmados'} onChange={e=>set('title',e.target.value)} /></div>
          <label className="label">Asistentes (uno por línea)</label>
          <textarea className="input resize-none h-24 font-mono text-xs" value={attendees.join('\n')} onChange={e=>set('attendees',e.target.value.split('\n').filter(Boolean))} placeholder={"María García\nJuan Pérez"} />
          <div className="text-[10px] font-mono text-[var(--text-dim)]">{attendees.length} confirmados</div>
        </div>
      );
    }
    case 'check_in':
      return (
        <div className="space-y-2">
          <div><label className="label">Evento</label><input className="input" value={cfg.event as string||''} onChange={e=>set('event',e.target.value)} /></div>
          <div><label className="label">Código de acceso</label><input className="input font-mono" value={cfg.access_code as string||''} onChange={e=>set('access_code',e.target.value.toUpperCase())} placeholder="ACC-2025" /></div>
          <div><label className="label">Estado</label>
            <select className="input" value={cfg.status as string||'pending'} onChange={e=>set('status',e.target.value)}>
              <option value="pending">⏳ Pendiente</option><option value="confirmed">✅ Confirmado</option><option value="denied">❌ Denegado</option>
            </select></div>
        </div>
      );

    /* ═══ REAL-TIME 🟢 ════════════════════════════════════════════════════════ */
    case 'live_status':
      return (
        <div className="space-y-2">
          <div><label className="label">Estado actual</label>
            <select className="input" value={cfg.status as string||'available'} onChange={e=>set('status',e.target.value)}>
              <option value="available">🟢 Disponible</option><option value="busy">🔴 Ocupado</option><option value="away">🟡 Ausente</option><option value="dnd">⛔ No molestar</option><option value="custom">✏️ Personalizado</option>
            </select></div>
          <div><label className="label">Mensaje de estado</label><input className="input" value={cfg.message as string||''} onChange={e=>set('message',e.target.value)} placeholder="Disponible para nuevos proyectos" /></div>
          <div><label className="label">Hasta cuándo (opcional)</label><input className="input" type="datetime-local" value={cfg.until as string||''} onChange={e=>set('until',e.target.value)} /></div>
          <p className="text-[10px] text-accent2 font-mono">🟢 Este bloque se actualiza en tiempo real al editar tu card</p>
        </div>
      );
    case 'availability_calendar':
      return (
        <div className="space-y-2">
          <div><label className="label">Timezone</label><input className="input" value={cfg.timezone as string||'America/Bogota'} onChange={e=>set('timezone',e.target.value)} /></div>
          <label className="label">Días disponibles</label>
          <div className="grid grid-cols-7 gap-1">
            {['L','M','X','J','V','S','D'].map((d,i)=>{
              const days=(cfg.available_days as number[])||[0,1,2,3,4];
              const active=days.includes(i);
              return <button key={d} onClick={()=>set('available_days',active?days.filter(x=>x!==i):[...days,i].sort())}
                className={`h-9 rounded-lg text-xs font-bold border transition-all ${active?'bg-accent border-accent text-white':'bg-bg border-[var(--border)] text-[var(--text-dim)]'}`}>{d}</button>;
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label">Desde</label><input className="input" type="time" value={cfg.from as string||'09:00'} onChange={e=>set('from',e.target.value)} /></div>
            <div><label className="label">Hasta</label><input className="input" type="time" value={cfg.to as string||'18:00'} onChange={e=>set('to',e.target.value)} /></div>
          </div>
          <div><label className="label">Link de reserva</label><input className="input" value={cfg.booking_url as string||''} onChange={e=>set('booking_url',e.target.value)} placeholder="https://calendly.com/..." /></div>
        </div>
      );

    /* ═══ GENERAL ════════════════════════════════════════════════════════════ */
    case 'social_links':
      return (
        <div className="space-y-2">
          {['instagram','linkedin','twitter','youtube','tiktok','github','twitch','discord','snapchat','pinterest'].map(p=>(
            <div key={p}><label className="label">{p}</label>
              <input className="input" value={cfg[p] as string||''} onChange={e=>set(p,e.target.value)} placeholder={`https://${p}.com/...`} /></div>
          ))}
        </div>
      );
    case 'cta':
      return (
        <div className="space-y-2">
          <div><label className="label">Label</label><input className="input" value={cfg.label as string||''} onChange={e=>set('label',e.target.value)} /></div>
          <div><label className="label">URL</label><input className="input" value={cfg.url as string||''} onChange={e=>set('url',e.target.value)} /></div>
          <div><label className="label">Icono (emoji)</label><input className="input w-16" value={cfg.icon as string||'💬'} onChange={e=>set('icon',e.target.value)} /></div>
        </div>
      );
    case 'hours': {
      const hours=(cfg.hours as {day:string;time:string}[])||[];
      return (
        <div className="space-y-2">
          {hours.map((h,i)=>(
            <div key={i} className="flex gap-2">
              <input className="input flex-1" value={h.day} onChange={e=>{const u=[...hours];u[i].day=e.target.value;set('hours',u);}} placeholder="Lun–Vie" />
              <input className="input flex-1" value={h.time} onChange={e=>{const u=[...hours];u[i].time=e.target.value;set('hours',u);}} placeholder="9:00–18:00" />
              <button className="text-danger text-xs px-2" onClick={()=>set('hours',hours.filter((_,j)=>j!==i))}>✕</button>
            </div>
          ))}
          <button className="btn btn-secondary text-xs w-full justify-center" onClick={()=>set('hours',[...hours,{day:'',time:''}])}>+ Horario</button>
        </div>
      );
    }
    case 'map':
      return <div><label className="label">Dirección</label><input className="input" value={cfg.address as string||''} onChange={e=>set('address',e.target.value)} placeholder="Calle 123, Ciudad" /></div>;
    case 'text':
      return <div><label className="label">Contenido</label><textarea className="input resize-none h-24" value={cfg.content as string||''} onChange={e=>set('content',e.target.value)} /></div>;
    case 'reviews':
      return (
        <div className="space-y-2">
          <div><label className="label">Reseña</label><textarea className="input resize-none h-20" value={cfg.text as string||''} onChange={e=>set('text',e.target.value)} placeholder='"Excelente servicio..."' /></div>
          <div><label className="label">Autor</label><input className="input" value={cfg.author as string||''} onChange={e=>set('author',e.target.value)} /></div>
        </div>
      );

    /* ═══ GALLERY 🖼️ ════════════════════════════════════════════════════════ */
    case 'gallery': {
      const photos = (cfg.photos as { url: string; caption?: string; _uploading?: boolean }[]) || [];
      return (
        <div className="space-y-3">
          <div>
            <label className="label">Título de la galería</label>
            <input className="input" value={cfg.title as string || 'Mi Galería'} onChange={e => set('title', e.target.value)} />
          </div>
          <label className="label">Fotos (URL pública de cada imagen)</label>
          {photos.map((p, i) => (
            <div key={i} className="bg-bg border border-[var(--border)] rounded-xl p-3 space-y-2">
              <div className="flex gap-2 items-center">
                <input className="input flex-1" placeholder="https://i.imgur.com/..." value={p.url} onChange={e => { const u = [...photos]; u[i].url = e.target.value; set('photos', u); }} />
                <label className="btn btn-secondary cursor-pointer whitespace-nowrap px-3 text-xs flex items-center h-[42px]">
                  {p._uploading ? '⏳' : '📂'}
                  <input type="file" accept="image/*" className="hidden" disabled={p._uploading as boolean} onChange={async e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const u = [...photos]; u[i] = { ...u[i], _uploading: true }; set('photos', u);
                    try { const url = await storageService.uploadImage(file); u[i].url = url; }
                    catch (err: any) { toast.error(err.message); }
                    finally { delete u[i]._uploading; set('photos', u); }
                  }} />
                </label>
                <button className="text-danger text-xs px-2" onClick={() => set('photos', photos.filter((_, j) => j !== i))}>✕</button>
              </div>
              <input className="input" placeholder="Descripción (opcional)" value={p.caption || ''} onChange={e => { const u = [...photos]; u[i].caption = e.target.value; set('photos', u); }} />
              {p.url && <img src={p.url} alt="" className="w-full h-24 object-cover rounded-lg border border-[var(--border)]" onError={e => (e.currentTarget.style.display = 'none')} />}
            </div>
          ))}
          <button className="btn btn-secondary text-xs w-full justify-center" onClick={() => set('photos', [...photos, { url: '', caption: '' }])}>+ Añadir foto</button>
          <p className="text-[10px] text-[var(--text-dim)]">Sube tus fotos a Imgur, Cloudinary o similar y pega la URL directa.</p>
        </div>
      );
    }

    /* ═══ PROJECT / PORTFOLIO 🚀 ══════════════════════════════════════════ */
    case 'project': {
      const items = (cfg.items as { title: string; subtitle?: string; url: string; image_url?: string; description?: string; _uploading?: boolean }[]) || [];
      return (
        <div className="space-y-3">
          <label className="label">Proyectos del Portafolio</label>
          {items.map((item, i) => (
            <div key={i} className="bg-bg border border-[var(--border)] rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-accent">Proyecto {i + 1}</span>
                <button className="text-danger text-xs px-2" onClick={() => set('items', items.filter((_, j) => j !== i))}>✕</button>
              </div>
              <div><input className="input" placeholder="Título del proyecto" value={item.title || ''} onChange={e => { const u = [...items]; u[i].title = e.target.value; set('items', u); }} /></div>
              <div><input className="input" placeholder="Subtítulo o Rol (ej. Frontend Developer)" value={item.subtitle || ''} onChange={e => { const u = [...items]; u[i].subtitle = e.target.value; set('items', u); }} /></div>
              <div><input className="input" placeholder="Enlace del proyecto (https://...)" value={item.url || ''} onChange={e => { const u = [...items]; u[i].url = e.target.value; set('items', u); }} /></div>
              <div>
                <label className="label mt-1 text-[10px]">Imagen de portada (URL externa o Subir)</label>
                <div className="flex gap-2">
                  <input className="input flex-1" placeholder="https://..." value={item.image_url || ''} onChange={e => { const u = [...items]; u[i].image_url = e.target.value; set('items', u); }} />
                  <label className="btn btn-secondary cursor-pointer whitespace-nowrap px-3 text-xs flex items-center h-[42px]">
                    {item._uploading ? '⏳' : '📂'}
                    <input type="file" accept="image/*" className="hidden" disabled={item._uploading as boolean} onChange={async e => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const u = [...items]; u[i] = { ...u[i], _uploading: true }; set('items', u);
                      try { const url = await storageService.uploadImage(file); u[i].image_url = url; }
                      catch (err: any) { toast.error(err.message); }
                      finally { delete u[i]._uploading; set('items', u); }
                    }} />
                  </label>
                </div>
              </div>
              {item.image_url && <img src={item.image_url} alt="" className="w-full h-20 object-cover rounded-lg mt-1" onError={e => e.currentTarget.style.display = 'none'} />}
            </div>
          ))}
          <button className="btn btn-secondary text-xs w-full justify-center" onClick={() => set('items', [...items, { title: '', url: '' }])}>+ Añadir proyecto</button>
        </div>
      );
    }

    /* ═══ VIDEO ▶️ ════════════════════════════════════════════════════════════ */
    case 'video': {
      const rawUrl = cfg.url as string || '';
      const getEmbedUrl = (url: string) => {
        const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
        const vm = url.match(/vimeo\.com\/(\d+)/);
        if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
        return '';
      };
      const embedUrl = getEmbedUrl(rawUrl);
      return (
        <div className="space-y-2">
          <div>
            <label className="label">Título</label>
            <input className="input" value={cfg.title as string || ''} onChange={e => set('title', e.target.value)} placeholder="Mi video destacado" />
          </div>
          <div>
            <label className="label">URL del video</label>
            <input className="input" value={rawUrl} onChange={e => set('url', e.target.value)} placeholder="https://youtube.com/watch?v=... o vimeo.com/..." />
          </div>
          {embedUrl && (
            <iframe src={embedUrl} width="100%" height="180" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen className="rounded-xl border-0 mt-2" />
          )}
          {rawUrl && !embedUrl && (
            <p className="text-[10px] text-warn font-mono">⚠ Pega una URL de YouTube o Vimeo para previsualizar.</p>
          )}
          <div>
            <label className="label">Descripción (opcional)</label>
            <textarea className="input resize-none h-14" value={cfg.description as string || ''} onChange={e => set('description', e.target.value)} />
          </div>
        </div>
      );
    }

    /* ═══ PDF 📄 ═════════════════════════════════════════════════════════════ */
    case 'pdf': {
      return (
        <div className="space-y-2">
          <div>
            <label className="label">Título del documento</label>
            <input className="input" value={cfg.title as string || ''} onChange={e => set('title', e.target.value)} placeholder="Presentación, Catálogo, CV..." />
          </div>
          <div>
            <label className="label">URL del PDF (Externa o Subir)</label>
            <div className="flex gap-2">
              <input className="input flex-1" value={cfg.url as string || ''} onChange={e => set('url', e.target.value)} placeholder="https://..." />
              <label className="btn btn-secondary cursor-pointer whitespace-nowrap px-3 text-xs flex items-center h-[42px]">
                {cfg._uploading ? '⏳' : '📂'}
                <input type="file" accept="application/pdf" className="hidden" disabled={cfg._uploading as boolean} onChange={async e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  set('_uploading', true);
                  try { const url = await storageService.uploadImage(file); set('url', url); }
                  catch (err: any) { toast.error(err.message); }
                  finally { set('_uploading', false); }
                }} />
              </label>
            </div>
          </div>
          <div>
            <label className="label">Label del botón</label>
            <input className="input" value={cfg.btn_label as string || 'Ver PDF'} onChange={e => set('btn_label', e.target.value)} />
          </div>
          <div>
            <label className="label">¿Permitir descarga?</label>
            <select className="input" value={String(cfg.allow_download ?? true)} onChange={e => set('allow_download', e.target.value === 'true')}>
              <option value="true">✅ Sí, permitir descarga</option>
              <option value="false">🔒 Solo visualización</option>
            </select>
          </div>
          <p className="text-[10px] text-[var(--text-dim)]">Sube tu PDF directamente o pega un enlace externo válido.</p>
        </div>
      );
    }

    /* ═══ FAQ ❓ ══════════════════════════════════════════════════════════════ */
    case 'faq': {
      const faqs = (cfg.faqs as { question: string; answer: string }[]) || [];
      return (
        <div className="space-y-3">
          <div>
            <label className="label">Título de la sección</label>
            <input className="input" value={cfg.title as string || 'Preguntas frecuentes'} onChange={e => set('title', e.target.value)} />
          </div>
          <label className="label">Preguntas y respuestas</label>
          {faqs.map((f, i) => (
            <div key={i} className="bg-bg border border-[var(--border)] rounded-xl p-3 space-y-2">
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="¿Pregunta frecuente?" value={f.question} onChange={e => { const u = [...faqs]; u[i].question = e.target.value; set('faqs', u); }} />
                <button className="text-danger text-xs px-2" onClick={() => set('faqs', faqs.filter((_, j) => j !== i))}>✕</button>
              </div>
              <textarea className="input resize-none h-16" placeholder="Respuesta..." value={f.answer} onChange={e => { const u = [...faqs]; u[i].answer = e.target.value; set('faqs', u); }} />
            </div>
          ))}
          <button className="btn btn-secondary text-xs w-full justify-center" onClick={() => set('faqs', [...faqs, { question: '', answer: '' }])}>+ Añadir pregunta</button>
        </div>
      );
    }

    /* ═══ STATS 📊 ═══════════════════════════════════════════════════════════ */
    case 'stats': {
      const items = (cfg.items as { label: string; value: string; icon?: string }[]) || [];
      return (
        <div className="space-y-2">
          <div>
            <label className="label">Título de la sección</label>
            <input className="input" value={cfg.title as string || 'Mis estadísticas'} onChange={e => set('title', e.target.value)} />
          </div>
          <label className="label">Estadísticas</label>
          {items.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="input w-10 text-center px-1" placeholder="📊" value={s.icon || ''} onChange={e => { const u = [...items]; u[i].icon = e.target.value; set('items', u); }} />
              <input className="input flex-1" placeholder="Clientes atendidos" value={s.label} onChange={e => { const u = [...items]; u[i].label = e.target.value; set('items', u); }} />
              <input className="input w-24" placeholder="1,200+" value={s.value} onChange={e => { const u = [...items]; u[i].value = e.target.value; set('items', u); }} />
              <button className="text-danger text-xs px-2" onClick={() => set('items', items.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <button className="btn btn-secondary text-xs w-full justify-center" onClick={() => set('items', [...items, { label: '', value: '', icon: '📊' }])}>+ Estadística</button>
        </div>
      );
    }

    /* ═══ WIFI QR 📶 ═════════════════════════════════════════════════════════ */
    case 'wifi_qr': {
      const ssid = cfg.ssid as string || '';
      const password = cfg.password as string || '';
      const security = cfg.security as string || 'WPA';
      const hidden = cfg.hidden as boolean || false;
      const [showPass, setShowPass] = useState(false);
      const canvasRef = useRef<HTMLCanvasElement>(null);

      const wifiString = security === 'nopass'
        ? `WIFI:T:nopass;S:${ssid};;`
        : `WIFI:T:${security};S:${ssid};P:${password};${hidden ? 'H:true;' : ''}`;

      useEffect(() => {
        if (!canvasRef.current || !ssid) return;
        import('qrcode').then(QRCode => {
          QRCode.toCanvas(canvasRef.current!, wifiString, {
            width: 160, margin: 2,
            color: { dark: '#6366f1', light: '#050508' }
          }).catch(() => {});
        });
      }, [ssid, password, security, hidden]);

      return (
        <div className="space-y-3">
          <div>
            <label className="label">Nombre de la red (SSID)</label>
            <input className="input" value={ssid} onChange={e => set('ssid', e.target.value)} placeholder="MiRedWiFi" />
          </div>
          <div>
            <label className="label">Tipo de seguridad</label>
            <select className="input" value={security} onChange={e => set('security', e.target.value)}>
              <option value="WPA">WPA / WPA2 (recomendado)</option>
              <option value="WEP">WEP (antiguo)</option>
              <option value="nopass">Sin contraseña (abierta)</option>
            </select>
          </div>
          {security !== 'nopass' && (
            <div>
              <label className="label">Contraseña</label>
              <div className="flex gap-2">
                <input className="input flex-1" type={showPass ? 'text' : 'password'} value={password} onChange={e => set('password', e.target.value)} placeholder="Mi contraseña segura" />
                <button type="button" onClick={() => setShowPass(p => !p)} className="text-xs bg-bg border border-[var(--border)] rounded-lg px-3 text-[var(--text-dim)] hover:border-accent/40 transition-all">{showPass ? '🙈' : '👁'}</button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className={`toggle-track ${hidden ? 'on' : ''}`} onClick={() => set('hidden', !hidden)}>
              <div className="toggle-thumb" />
            </div>
            <label className="text-xs text-[var(--text-dim)]">Red oculta (hidden SSID)</label>
          </div>
          {ssid && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-[10px] font-mono text-[var(--text-dim)] self-start">Vista previa del QR</p>
              <div className="bg-[#050508] border border-[var(--border)] rounded-xl p-3 flex items-center justify-center">
                <canvas ref={canvasRef} />
              </div>
              <p className="text-[10px] text-[var(--text-dim)] text-center">Los visitantes escanean este QR y se conectan automáticamente</p>
            </div>
          )}
        </div>
      );
    }

    default:
      return <div className="text-sm text-[var(--text-dim)] p-3 bg-bg rounded-lg font-mono">sin config para: {block.type}</div>;
  }
}
