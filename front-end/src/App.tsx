import { useState, useRef, useEffect } from "react"
import './App.css'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface ChatModalProps {
    primaryColor: string
    companyName: string
    apiEndpoint?: string
    onClose: () => void
}

function ChatModal({ primaryColor, companyName, apiEndpoint, onClose }: ChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: `Bonjour ! Je suis l'assistant virtuel de ${companyName}. Comment puis-je vous aider aujourd'hui ?` }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async () => {
        const text = input.trim()
        if (!text || loading) return
        const userMsg: Message = { role: 'user', content: text }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)
        try {
            const endpoint = apiEndpoint || 'https://api.anthropic.com/v1/messages'
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    system: `Tu es l'assistant virtuel de ${companyName}, une boulangerie artisanale. Reponds de facon concise et chaleureuse sur les produits, horaires et commandes.`,
                    messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
                })
            })
            const data = await res.json()
            const reply = data.content?.[0]?.text || "Desole, je n'ai pas pu repondre."
            setMessages(prev => [...prev, { role: 'assistant', content: reply }])
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "Une erreur s'est produite." }])
        }
        setLoading(false)
    }

    return (
        <div className="chat-overlay" onClick={onClose}>
            <div className="chat-modal" onClick={e => e.stopPropagation()} style={{ '--cp': primaryColor } as React.CSSProperties}>
                <div className="chat-modal-head" style={{ background: primaryColor }}>
                    <div className="chat-avatar">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="14" rx="3" stroke="white" strokeWidth="2"/>
                            <circle cx="8.5" cy="10" r="1.5" fill="white"/>
                            <circle cx="15.5" cy="10" r="1.5" fill="white"/>
                            <path d="M8 18l2 3h4l2-3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="chat-head-info">
                        <div className="chat-head-name">UniChatter Assistant</div>
                        <div className="chat-head-status"><span className="status-dot"/> En ligne</div>
                    </div>
                    <button className="chat-x" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
                <div className="chat-body">
                    {messages.map((msg, i) => (
                        <div key={i} className={`bubble ${msg.role}`}>{msg.content}</div>
                    ))}
                    {loading && (
                        <div className="bubble assistant loading">
                            <span/><span/><span/>
                        </div>
                    )}
                    <div ref={bottomRef}/>
                </div>
                <div className="chat-foot">
                    <input
                        className="chat-inp"
                        placeholder="Posez votre question..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        autoFocus
                    />
                    <button className="chat-send" onClick={sendMessage} style={{ background: primaryColor }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── VITRINE BOULANGERIE ───────────────────────────────────────────────────────
function VitrinePage() {
    const [chatOpen, setChatOpen] = useState(false)

    return (
        <div className="vitrine-wrap">
            {/* NAV */}
            <nav className="b-nav">
                <div className="b-nav-logo">
                    <span className="b-logo-main">MaisonLevain</span>
                    <span className="b-logo-dot">.</span>
                </div>
                <div className="b-nav-links">
                    <a href="#hero">Accueil</a>
                    <a href="#pains">Nos Pains</a>
                    <a href="#patisseries">Patisseries</a>
                    <a href="#contact">Contact</a>
                </div>
            </nav>

            {/* HERO avec vraie photo via unsplash */}
            <section id="hero" className="b-hero">
                <img
                    className="b-hero-img"
                    src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80"
                    alt="Pain artisanal"
                />
                <div className="b-hero-overlay"/>
                <div className="b-hero-content">
                    <h1 className="b-hero-title">L'Art du Pain Authentique</h1>
                    <p className="b-hero-sub">Decouvrez nos creations artisanales, faconnees avec passion et tradition chaque matin pour votre plus grand plaisir.</p>
                    <button className="b-cta" onClick={() => setChatOpen(true)}>Decouvrir le Menu</button>
                </div>
            </section>

            {/* PAINS */}
            <section id="pains" className="b-section b-section-light">
                <div className="b-section-inner">
                    <p className="b-section-label">NOS PAINS</p>
                    <h2 className="b-section-title">Fabriques chaque matin avec amour</h2>
                    <div className="b-grid-3">
                        {[
                            { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', nom: 'Pain au Levain', prix: '4,50 €', desc: 'Fermentation lente 24h, croute doree, mie alveiolee.' },
                            { img: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80', nom: 'Baguette Tradition', prix: '1,20 €', desc: 'Farine Label Rouge, cuite sur sole de pierre.' },
                            { img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', nom: 'Croissant Pur Beurre', prix: '1,80 €', desc: 'Feuilletage maison, beurre AOP, 72h de preparation.' },
                            { img: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=400&q=80', nom: 'Pain de Seigle', prix: '5,20 €', desc: '50% seigle, ideal avec fromages ou terrines.' },
                            { img: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80', nom: 'Brioche', prix: '7,50 €', desc: 'Tressee a la main, parfumee a la fleur d\'oranger.' },
                            { img: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&q=80', nom: 'Focaccia Romarin', prix: '4,00 €', desc: 'Huile d\'olive extra vierge, romarin frais.' },
                        ].map((p, i) => (
                            <div key={i} className="b-card">
                                <img className="b-card-img" src={p.img} alt={p.nom}/>
                                <div className="b-card-body">
                                    <div className="b-card-top">
                                        <span className="b-card-nom">{p.nom}</span>
                                        <span className="b-card-prix">{p.prix}</span>
                                    </div>
                                    <p className="b-card-desc">{p.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HISTOIRE */}
            <section id="patisseries" className="b-section b-section-dark">
                <div className="b-section-inner b-two-col">
                    <div className="b-col-text">
                        <p className="b-section-label-light">NOTRE HISTOIRE</p>
                        <h2 className="b-section-title-light">Une boulangerie de quartier depuis 1987</h2>
                        <p className="b-body-text">La Maison Levain, c'est trois generations de boulangers passionnes. Nous utilisons uniquement des farines biologiques locales et des levains naturels cultives depuis plus de 30 ans.</p>
                        <p className="b-body-text" style={{marginTop:'14px'}}>Notre fournil ouvre ses portes a 4h du matin pour que vous puissiez retrouver, chaque jour, des pains tout juste sortis du four.</p>
                        <div className="b-horaires">
                            {[['Lundi — Vendredi','7h00 — 19h30'],['Samedi','7h00 — 13h00'],['Dimanche','7h30 — 12h30']].map(([j,h],i)=>(
                                <div key={i} className="b-horaire-row"><span className="b-horaire-j">{j}</span><span className="b-horaire-h">{h}</span></div>
                            ))}
                        </div>
                    </div>
                    <img className="b-col-img" src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80" alt="Boulangerie"/>
                </div>
            </section>

            {/* CONTACT */}
            <section id="contact" className="b-section b-section-light">
                <div className="b-section-inner">
                    <p className="b-section-label">CONTACT</p>
                    <h2 className="b-section-title">Venez nous rendre visite</h2>
                    <div className="b-contact-grid">
                        <div className="b-contact-info">
                            <div className="b-contact-item"><span className="b-contact-label">Adresse</span><span>12 rue du Four, 75006 Paris</span></div>
                            <div className="b-contact-item"><span className="b-contact-label">Telephone</span><span>01 42 34 56 78</span></div>
                            <div className="b-contact-item"><span className="b-contact-label">Email</span><span>contact@maisonlevain.fr</span></div>
                        </div>
                        <div className="b-contact-chat">
                            <p className="b-contact-chat-text">Une question sur nos produits, une commande speciale ou une allergie alimentaire ? Notre assistant IA est disponible 24h/24.</p>
                            <button className="b-cta" onClick={() => setChatOpen(true)}>Parler a notre assistant</button>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="b-footer">
                <div className="b-footer-logo"><span className="b-logo-main" style={{color:'#c8956c'}}>MaisonLevain</span><span style={{color:'#c8956c'}}>.</span></div>
                <p className="b-footer-copy">Propulse par <strong style={{color:'rgba(255,255,255,0.6)'}}>UniChatter</strong> — 2025 Maison Levain. Tous droits reserves.</p>
            </footer>

            {/* FAB */}
            <button className="b-fab" onClick={() => setChatOpen(true)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            {chatOpen && <ChatModal primaryColor="#7c3a1e" companyName="Maison Levain" onClose={() => setChatOpen(false)}/>}
        </div>
    )
}

// ── LANDING UNICHATTER ────────────────────────────────────────────────────────
function LandingPage({ onGoToVitrine, onGoToPaiement }: { onGoToVitrine: () => void; onGoToPaiement: () => void }) {
    return (
        <div className="lp">
            <div className="lp-hero">
                <div className="lp-hero-glow"/>
                <div className="lp-hero-inner">
                    <div className="lp-logo">
                        <svg width="48" height="42" viewBox="0 0 40 34" fill="none">
                            <path d="M8 8 Q20 2 32 8" stroke="#E63946" strokeWidth="3" strokeLinecap="round" fill="none"/>
                            <path d="M4 17 Q20 10 36 17" stroke="#E63946" strokeWidth="3" strokeLinecap="round" fill="none"/>
                            <path d="M8 26 Q20 20 32 26" stroke="#E63946" strokeWidth="3" strokeLinecap="round" fill="none"/>
                        </svg>
                        <span className="lp-logo-text">UniChatter</span>
                    </div>
                    <div className="lp-badge">Plateforme IA conversationnelle</div>
                    <h1 className="lp-title">Votre entreprise parle.<br/><span className="lp-title-accent">L'IA repond.</span></h1>
                    <p className="lp-subtitle">UniChatter deploie un assistant intelligent sur votre site web en quelques minutes. Vos clients obtiennent des reponses precises, instantanees, 24h/24 — entraine sur vos propres donnees.</p>
                    <div className="lp-ctas">
                        <button className="lp-btn-primary" onClick={onGoToVitrine}>Voir la demo</button>
                        <button className="lp-btn-ghost" onClick={onGoToPaiement}>Voir les tarifs</button>
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className="lp-stats">
                <div className="lp-stat"><span className="lp-stat-n">+2 400</span><span className="lp-stat-l">entreprises clientes</span></div>
                <div className="lp-stat-sep"/>
                <div className="lp-stat"><span className="lp-stat-n">98%</span><span className="lp-stat-l">taux de satisfaction</span></div>
                <div className="lp-stat-sep"/>
                <div className="lp-stat"><span className="lp-stat-n">5 min</span><span className="lp-stat-l">pour integrer</span></div>
                <div className="lp-stat-sep"/>
                <div className="lp-stat"><span className="lp-stat-n">50+</span><span className="lp-stat-l">langues</span></div>
            </div>

            {/* COMMENT CA MARCHE */}
            <div className="lp-how">
                <p className="lp-section-label">COMMENT CA MARCHE</p>
                <h2 className="lp-section-title">Operationnel en 3 etapes</h2>
                <div className="lp-steps">
                    {[
                        { n:'01', t:'Creez votre assistant', d:'Configurez le nom, les couleurs et le comportement de votre IA en quelques clics depuis le tableau de bord.' },
                        { n:'02', t:'Chargez vos donnees', d:'Importez vos documents, FAQ et fiches produits. L\'IA s\'entraine automatiquement sur votre contenu.' },
                        { n:'03', t:'Integrez et publiez', d:'Copiez deux lignes de code sur votre site. Votre assistant est immediatement actif pour vos visiteurs.' },
                    ].map((s,i)=>(
                        <div key={i} className="lp-step">
                            <div className="lp-step-n">{s.n}</div>
                            <h3 className="lp-step-t">{s.t}</h3>
                            <p className="lp-step-d">{s.d}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* FEATURES */}
            <div className="lp-features">
                <p className="lp-section-label">FONCTIONNALITES</p>
                <h2 className="lp-section-title">Tout ce dont vous avez besoin</h2>
                <div className="lp-feat-grid">
                    {[
                        { t:'Integration instantanee', d:'Widget pret en 2 lignes de code. Compatible avec tous les CMS et frameworks modernes.' },
                        { t:'IA sur mesure', d:'Entrainee sur vos propres documents, la reponse est toujours pertinente et dans le ton de votre marque.' },
                        { t:'Multilingue natif', d:'Detection automatique de la langue du visiteur. Repond dans plus de 50 langues sans configuration.' },
                        { t:'Analytics en temps reel', d:'Suivez les conversations, identifiez les questions frequentes, mesurez la satisfaction client.' },
                        { t:'Securite RGPD', d:'Donnees hebergees en Europe, chiffrement de bout en bout, conformite totale.' },
                        { t:'Intégrations', d:'Connectez UniChatter a votre CRM, Slack, Zendesk ou tout systeme via API REST.' },
                    ].map((f,i)=>(
                        <div key={i} className="lp-feat-card">
                            <div className="lp-feat-line"/>
                            <h3 className="lp-feat-t">{f.t}</h3>
                            <p className="lp-feat-d">{f.d}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA CARDS */}
            <div className="lp-nav-cards">
                <button className="lp-nav-card" onClick={onGoToVitrine}>
                    <div className="lp-nav-card-label">Demo interactive</div>
                    <h3 className="lp-nav-card-title">Voir UniChatter en action</h3>
                    <p className="lp-nav-card-desc">Testez notre demo sur le site d'une boulangerie artisanale. Cliquez sur le bouton chat pour parler a l'assistant.</p>
                    <span className="lp-nav-card-arrow">Voir la demo →</span>
                </button>
                <button className="lp-nav-card lp-nav-card-red" onClick={onGoToPaiement}>
                    <div className="lp-nav-card-label">Offres et tarifs</div>
                    <h3 className="lp-nav-card-title">Notre modele de paiement</h3>
                    <p className="lp-nav-card-desc">Decouvrez notre vision tarifaire, de l'offre gratuite a l'enterprise. Integration Stripe en cours de developpement.</p>
                    <span className="lp-nav-card-arrow">Voir les tarifs →</span>
                </button>
            </div>

            <footer className="lp-footer">
                <div className="lp-footer-logo">
                    <svg width="20" height="18" viewBox="0 0 40 34" fill="none">
                        <path d="M8 8 Q20 2 32 8" stroke="#E63946" strokeWidth="3" strokeLinecap="round" fill="none"/>
                        <path d="M4 17 Q20 10 36 17" stroke="#E63946" strokeWidth="3" strokeLinecap="round" fill="none"/>
                        <path d="M8 26 Q20 20 32 26" stroke="#E63946" strokeWidth="3" strokeLinecap="round" fill="none"/>
                    </svg>
                    <span>UniChatter</span>
                </div>
                <p className="lp-footer-copy">2025 UniChatter. Tous droits reserves.</p>
            </footer>
        </div>
    )
}

// ── PAIEMENT ──────────────────────────────────────────────────────────────────
function PaiementPage() {
    const offres = [
        { nom:'Decouverte', prix:'Gratuit', duree:'', desc:'Pour tester sans engagement', features:['1 assistant IA','100 conversations/mois','Widget personnalisable','Branding UniChatter','Support communautaire'], note:'Sans carte bancaire', hl:false },
        { nom:'Starter', prix:'29', duree:'/ mois', desc:'Ideal pour les TPE et PME', features:['1 assistant IA','1 000 conversations/mois','Widget sans branding','Entrainement sur documents','Statistiques de base','Support email'], note:"14 jours d'essai offerts", hl:true },
        { nom:'Pro', prix:'79', duree:'/ mois', desc:'Pour les equipes en croissance', features:['5 assistants IA','10 000 conversations/mois','Analytics avances','Integration CRM & Zapier','Historique complet','Support prioritaire'], note:'Le plus populaire', hl:false },
        { nom:'Enterprise', prix:'Sur devis', duree:'', desc:'Solutions grands comptes', features:['Assistants illimites','Conversations illimitees','Hebergement dedie EU','SLA 99,9% garanti','RGPD avance','Account manager'], note:'Contactez-nous', hl:false },
    ]

    return (
        <div className="pp">
            <div className="pp-header">
                <p className="lp-section-label">VISION TARIFAIRE</p>
                <h1 className="pp-title">Un modele simple et transparent</h1>
                <p className="pp-intro">Ces offres sont en cours de conception. Elles n'ont pas encore ete mises en production — cette page illustre la direction que nous souhaitons prendre. Integration Stripe prevue prochainement.</p>
            </div>

            <div className="pp-vision">
                {[
                    { t:'Abonnement mensuel previsible', d:'Pas de surprise sur la facture. Un prix fixe par mois, quelles que soient les variations d\'usage dans votre palier.' },
                    { t:'Gratuit pour commencer', d:'N\'importe quelle entreprise peut tester UniChatter gratuitement. L\'offre decouverte est vraiment utile, pas un outil bride.' },
                    { t:'Stripe en cours d\'integration', d:'Le systeme de paiement sera gere via Stripe. Facturation automatique, gestion des licences et portail client depuis le dashboard.' },
                ].map((v,i)=>(
                    <div key={i} className="pp-vision-card">
                        <div className="pp-vision-num">0{i+1}</div>
                        <h3 className="pp-vision-t">{v.t}</h3>
                        <p className="pp-vision-d">{v.d}</p>
                    </div>
                ))}
            </div>

            <h2 className="pp-offres-title">Les offres envisagees</h2>
            <div className="pp-offres">
                {offres.map((o,i)=>(
                    <div key={i} className={`pp-offre ${o.hl?'pp-offre-hl':''}`}>
                        {o.hl && <div className="pp-badge">Recommande</div>}
                        <div className="pp-offre-nom">{o.nom}</div>
                        <div className="pp-prix-row"><span className="pp-prix">{o.prix}</span><span className="pp-duree">{o.duree}</span></div>
                        <div className="pp-offre-desc">{o.desc}</div>
                        <ul className="pp-feats">{o.features.map((f,j)=><li key={j}>{f}</li>)}</ul>
                        <div className="pp-note">{o.note}</div>
                    </div>
                ))}
            </div>

            <div className="pp-disclaimer">
                <p>Ces tarifs sont indicatifs et susceptibles d'evoluer. Si vous souhaitez donner votre avis ou etes interesse par une offre, contactez-nous directement.</p>
            </div>
        </div>
    )
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
function App() {
    const [page, setPage] = useState<'landing'|'vitrine'|'paiement'>('landing')

    return (
        <div className="shell">
            <div className="tabs">
                <div className="tabs-logo">
                    <svg width="18" height="16" viewBox="0 0 40 34" fill="none">
                        <path d="M8 8 Q20 2 32 8" stroke="#E63946" strokeWidth="3" strokeLinecap="round" fill="none"/>
                        <path d="M4 17 Q20 10 36 17" stroke="#E63946" strokeWidth="3" strokeLinecap="round" fill="none"/>
                        <path d="M8 26 Q20 20 32 26" stroke="#E63946" strokeWidth="3" strokeLinecap="round" fill="none"/>
                    </svg>
                </div>
                <button className={`tab ${page==='landing'?'tab-on':''}`} onClick={()=>setPage('landing')}>UniChatter</button>
                <button className={`tab ${page==='vitrine'?'tab-on':''}`} onClick={()=>setPage('vitrine')}>Demo Vitrine</button>
                <button className={`tab ${page==='paiement'?'tab-on':''}`} onClick={()=>setPage('paiement')}>Modele de Paiement</button>
            </div>
            {page==='landing' && <LandingPage onGoToVitrine={()=>setPage('vitrine')} onGoToPaiement={()=>setPage('paiement')}/>}
            {page==='vitrine' && <VitrinePage/>}
            {page==='paiement' && <PaiementPage/>}
        </div>
    )
}

export default App