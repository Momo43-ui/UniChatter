import { useState, useRef, useEffect } from "react";
import './App.css';
import logo from './logo/Unichatterpng.png';

// ── LOGO UNICHATTER (utilise le PNG) ──────────────────────────────────────────────────────
function Logo({ size = 36 }: { size?: number }) {
    return (
        <img
            src={logo}
            alt="UniChatter Logo"
            style={{ width: `${size}px`, height: 'auto' }}
        />
    );
}

// ── CHAT MODAL CENTREE ────────────────────────────────────────────────────────
interface ChatModalProps {
    primaryColor: string;
    companyName: string;
    apiEndpoint?: string;
    onClose: () => void;
}

function ChatModal({ primaryColor, companyName, apiEndpoint, onClose }: ChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: `Bonjour ! Je suis l'assistant virtuel de ${companyName}. Comment puis-je vous aider aujourd'hui ?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;
        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        try {
            const endpoint = apiEndpoint || 'https://api.anthropic.com/v1/messages';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    system: `Tu es l'assistant virtuel de ${companyName}, une boulangerie artisanale. Réponds de façon concise et chaleureuse sur les produits, horaires et commandes.`,
                    messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
                })
            });
            const data = await res.json();
            const reply = data.content?.[0]?.text || "Désolé, je n'ai pas pu répondre.";
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "Une erreur s'est produite." }]);
        }
        setLoading(false);
    };

    return (
        <div className="chat-overlay" onClick={onClose}>
            <div className="chat-modal" onClick={e => e.stopPropagation()} style={{ '--cp': primaryColor } as React.CSSProperties}>
                <div className="chat-head" style={{ background: primaryColor }}>
                    <div className="chat-avatar">
                        <img src={logo} alt="UniChatter Logo" style={{ width: '22px', height: 'auto' }} />
                    </div>
                    <div>
                        <div className="chat-head-name">UniChatter Assistant</div>
                        <div className="chat-head-status"><span className="status-dot"/>En ligne</div>
                    </div>
                    <button className="chat-x" onClick={onClose}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
                <div className="chat-body">
                    {messages.map((msg, i) => (
                        <div key={i} className={`bubble ${msg.role}`}>{msg.content}</div>
                    ))}
                    {loading && <div className="bubble assistant loading"><span/><span/><span/></div>}
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── VITRINE BOULANGERIE ───────────────────────────────────────────────────────
function VitrinePage() {
    const [chatOpen, setChatOpen] = useState(false);

    const produits = [
        { img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', nom: 'Pain au Levain', prix: '4,50', desc: 'Fermentation lente 24h, croute dorée, mie alvéolée.' },
        { img: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80', nom: 'Baguette Tradition', prix: '1,20', desc: 'Farine Label Rouge, cuite sur sole de pierre, croustillante.' },
        { img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', nom: 'Croissant Pur Beurre', prix: '1,80', desc: 'Feuilletage maison, beurre AOP, 72h de préparation.' },
        { img: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=400&q=80', nom: 'Pain de Seigle', prix: '5,20', desc: '50% seigle, idéal avec fromages ou terrines.' },
        { img: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80', nom: 'Brioche', prix: '7,50', desc: "Tressée à la main, parfumée à la fleur d'oranger." },
        { img: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&q=80', nom: 'Focaccia Romarin', prix: '4,00', desc: "Huile d'olive extra vierge, romarin frais." },
    ];

    return (
        <div className="vw">
            <nav className="b-nav">
                <div className="b-nav-logo">
                    <span className="b-logo-main">MaisonLevain</span>
                    <span className="b-logo-dot">.</span>
                </div>
                <div className="b-nav-links">
                    <a href="#hero">Accueil</a>
                    <a href="#pains">Nos Pains</a>
                    <a href="#histoire">Pâtisseries</a>
                    <a href="#contact">Contact</a>
                </div>
            </nav>

            <section id="hero" className="b-hero">
                <img className="b-hero-img" src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80" alt="Pain artisanal"/>
                <div className="b-hero-overlay"/>
                <div className="b-hero-content">
                    <h1 className="b-hero-title">L'Art du Pain Authentique</h1>
                    <p className="b-hero-sub">Découvrez nos créations artisanales, façonnées avec passion et tradition chaque matin pour votre plus grand plaisir.</p>
                    <button className="b-cta" onClick={() => setChatOpen(true)}>Découvrir le Menu</button>
                </div>
            </section>

            <section id="pains" className="b-sec b-light">
                <div className="b-inner">
                    <p className="b-label-brown">NOS PAINS</p>
                    <h2 className="b-title-dark">Fabriqués chaque matin avec amour</h2>
                    <div className="b-grid3">
                        {produits.map((p, i) => (
                            <div key={i} className="b-card">
                                <img className="b-card-img" src={p.img} alt={p.nom}/>
                                <div className="b-card-body">
                                    <div className="b-card-top">
                                        <span className="b-card-nom">{p.nom}</span>
                                        <span className="b-card-prix">{p.prix} €</span>
                                    </div>
                                    <p className="b-card-desc">{p.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="histoire" className="b-sec b-dark">
                <div className="b-inner b-twocol">
                    <div className="b-col-txt">
                        <p className="b-label-light">NOTRE HISTOIRE</p>
                        <h2 className="b-title-light">Une boulangerie de quartier depuis 1987</h2>
                        <p className="b-body-txt">La Maison Levain, c'est trois générations de boulangers passionnés. Nous utilisons uniquement des farines biologiques locales et des levains naturels cultivés depuis plus de 30 ans.</p>
                        <p className="b-body-txt" style={{marginTop:'14px'}}>Notre fournil ouvre ses portes à 4h du matin pour que vous puissiez retrouver, chaque jour, des pains tout juste sortis du four.</p>
                        <div className="b-horaires">
                            {[['Lundi — Vendredi','7h00 — 19h30'],['Samedi','7h00 — 13h00'],['Dimanche','7h30 — 12h30']].map(([j,h],i)=>(
                                <div key={i} className="b-hrow">
                                    <span className="b-hj">{j}</span>
                                    <span className="b-hh">{h}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <img className="b-col-img" src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80" alt="Fournil"/>
                </div>
            </section>

            <section id="contact" className="b-sec b-light">
                <div className="b-inner">
                    <p className="b-label-brown">CONTACT</p>
                    <h2 className="b-title-dark">Venez nous rendre visite</h2>
                    <div className="b-cgrid">
                        <div className="b-cinfo">
                            <div className="b-ci"><span className="b-ci-l">Adresse</span><span>12 rue du Four, 75006 Paris</span></div>
                            <div className="b-ci"><span className="b-ci-l">Téléphone</span><span>01 42 34 56 78</span></div>
                            <div className="b-ci"><span className="b-ci-l">Email</span><span>contact@maisonlevain.fr</span></div>
                        </div>
                        <div className="b-cchat">
                            <p className="b-cchat-txt">Une question sur nos produits, une commande spéciale ou une allergie ? Notre assistant IA est disponible 24h/24.</p>
                            <button className="b-cta" onClick={() => setChatOpen(true)}>Parler à notre assistant</button>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="b-footer">
                <div style={{display:'flex',alignItems:'baseline',gap:'0'}}>
                    <span style={{color:'#c8956c',fontWeight:700,fontFamily:'Georgia,serif'}}>MaisonLevain</span>
                    <span style={{color:'#c8956c',fontWeight:700,fontFamily:'Georgia,serif'}}>.</span>
                </div>
                <p className="b-fcopy">Propulsé par <strong>UniChatter</strong> — 2025 Maison Levain. Tous droits réservés.</p>
            </footer>

            <button className="b-fab" onClick={() => setChatOpen(true)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            {chatOpen && <ChatModal primaryColor="#7c3a1e" companyName="Maison Levain" onClose={() => setChatOpen(false)}/>}
        </div>
    );
}

// ── LANDING UNICHATTER ────────────────────────────────────────────────────────
function LandingPage({ onGoToVitrine, onGoToPaiement }: { onGoToVitrine: () => void; onGoToPaiement: () => void }) {
    return (
        <div className="lp">
            <div className="lp-hero">
                <div className="lp-glow"/>
                <div className="lp-hi">
                    <div className="lp-logo-row">
                        <Logo size={46} />
                        <span className="lp-logo-txt">UniChatter</span>
                    </div>
                    <div className="lp-badge">Plateforme IA conversationnelle</div>
                    <h1 className="lp-h1">Votre entreprise parle.<br/><span className="lp-red">L'IA répond.</span></h1>
                    <p className="lp-sub">UniChatter déploie un assistant intelligent sur votre site web en quelques minutes. Vos clients obtiennent des réponses précises, instantanées, 24h/24 — entraîné sur vos propres données.</p>
                    <div className="lp-btns">
                        <button className="lp-btn-p" onClick={onGoToVitrine}>Voir la démo</button>
                        <button className="lp-btn-g" onClick={onGoToPaiement}>Voir les tarifs</button>
                    </div>
                </div>
            </div>

            <div className="lp-stats">
                <div className="lp-stat"><span className="lp-sn">+2 400</span><span className="lp-sl">entreprises clientes</span></div>
                <div className="lp-sep"/>
                <div className="lp-stat"><span className="lp-sn">98%</span><span className="lp-sl">taux de satisfaction</span></div>
                <div className="lp-sep"/>
                <div className="lp-stat"><span className="lp-sn">5 min</span><span className="lp-sl">pour intégrer</span></div>
                <div className="lp-sep"/>
                <div className="lp-stat"><span className="lp-sn">50+</span><span className="lp-sl">langues supportées</span></div>
            </div>

            <div className="lp-sec">
                <p className="lp-sec-lbl">COMMENT ÇA MARCHE</p>
                <h2 className="lp-sec-h2">Opérationnel en 3 étapes</h2>
                <div className="lp-steps">
                    {[
                        { n:'01', t:'Créez votre assistant', d:'Configurez le nom, les couleurs et le comportement de votre IA en quelques clics depuis le tableau de bord.' },
                        { n:'02', t:'Chargez vos données',   d:"Importez vos documents, FAQ et fiches produits. L'IA s'entraîne automatiquement sur votre contenu." },
                        { n:'03', t:'Intégrez et publiez',   d:'Copiez deux lignes de code sur votre site. Votre assistant est immédiatement actif pour vos visiteurs.' },
                    ].map((s, i) => (
                        <div key={i} className="lp-step">
                            <div className="lp-step-n">{s.n}</div>
                            <h3 className="lp-step-t">{s.t}</h3>
                            <p className="lp-step-d">{s.d}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lp-sec">
                <p className="lp-sec-lbl">FONCTIONNALITÉS</p>
                <h2 className="lp-sec-h2">Tout ce dont vous avez besoin</h2>
                <div className="lp-feats">
                    {[
                        { t:'Intégration instantanée',  d:'Widget prêt en 2 lignes de code. Compatible avec tous les CMS et frameworks modernes.' },
                        { t:'IA sur mesure',             d:'Entraînée sur vos documents, la réponse est toujours pertinente et dans le ton de votre marque.' },
                        { t:'Multilingue natif',         d:'Détection automatique de la langue du visiteur. Répond dans plus de 50 langues sans configuration.' },
                        { t:'Analytics temps réel',      d:'Suivez les conversations, identifiez les questions fréquentes, mesurez la satisfaction client.' },
                        { t:'Sécurité RGPD',             d:'Données hébergées en Europe, chiffrement de bout en bout, conformité totale garantie.' },
                        { t:'Intégrations',              d:'Connectez UniChatter à votre CRM, Slack, Zendesk ou tout système via API REST.' },
                    ].map((f, i) => (
                        <div key={i} className="lp-feat">
                            <div className="lp-feat-bar"/>
                            <h3 className="lp-feat-t">{f.t}</h3>
                            <p className="lp-feat-d">{f.d}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lp-sec">
                <div className="lp-navcards">
                    <button className="lp-nc" onClick={onGoToVitrine}>
                        <span className="lp-nc-tag">Démo interactive</span>
                        <h3 className="lp-nc-title">Voir UniChatter en action</h3>
                        <p className="lp-nc-desc">Testez notre démo sur le site d'une boulangerie artisanale. Cliquez sur le bouton chat pour parler à l'assistant.</p>
                        <span className="lp-nc-arrow">Voir la démo →</span>
                    </button>
                    <button className="lp-nc lp-nc-red" onClick={onGoToPaiement}>
                        <span className="lp-nc-tag">Offres et tarifs</span>
                        <h3 className="lp-nc-title">Notre modèle de paiement</h3>
                        <p className="lp-nc-desc">Découvrez notre vision tarifaire, de l'offre gratuite à l'enterprise. Intégration Stripe en cours de développement.</p>
                        <span className="lp-nc-arrow">Voir les tarifs →</span>
                    </button>
                </div>
            </div>

            <footer className="lp-footer">
                <div className="lp-flogo"><Logo size={20} /><span>UniChatter</span></div>
                <p className="lp-fcopy">2025 UniChatter. Tous droits réservés.</p>
            </footer>
        </div>
    );
}

// ── PAGE PAIEMENT ─────────────────────────────────────────────────────────────
function PaiementPage() {
    const offres = [
        { nom:'Découverte', prix:'Gratuit', duree:'', desc:'Pour tester sans engagement',
            feats:['1 assistant IA','100 conversations/mois','Widget personnalisable','Branding UniChatter','Support communautaire'],
            note:'Sans carte bancaire', hl:false },
        { nom:'Starter', prix:'29', duree:'/ mois', desc:'Idéal pour les TPE et PME',
            feats:['1 assistant IA','1 000 conversations/mois','Widget sans branding','Entraînement sur documents','Statistiques de base','Support email'],
            note:"14 jours d'essai offerts", hl:true },
        { nom:'Pro', prix:'79', duree:'/ mois', desc:'Pour les équipes en croissance',
            feats:['5 assistants IA','10 000 conversations/mois','Analytics avancés','Intégration CRM et Zapier','Historique complet','Support prioritaire'],
            note:'Le plus populaire', hl:false },
        { nom:'Enterprise', prix:'Sur devis', duree:'', desc:'Solutions grands comptes',
            feats:['Assistants illimités','Conversations illimitées','Hébergement dédié EU','SLA 99,9% garanti','RGPD avancé','Account manager'],
            note:'Contactez-nous', hl:false },
    ];

    return (
        <div className="pp">
            <div className="pp-hd">
                <p className="lp-sec-lbl">VISION TARIFAIRE</p>
                <h1 className="pp-h1">Un modèle simple et transparent</h1>
                <p className="pp-intro">Ces offres sont en cours de conception et n'ont pas encore été mises en production. Cette page illustre la direction que nous souhaitons prendre. Intégration Stripe prévue prochainement.</p>
            </div>

            <div className="pp-vision">
                {[
                    { t:'Abonnement mensuel prévisible', d:"Pas de surprise sur la facture. Un prix fixe par mois, quelles que soient les variations d'usage dans votre palier." },
                    { t:'Gratuit pour commencer',         d:"N'importe quelle entreprise peut tester UniChatter gratuitement. L'offre découverte est vraiment utile, pas un outil bridé." },
                    { t:"Stripe en cours d'intégration",  d:"Le système de paiement sera géré via Stripe. Facturation automatique, gestion des licences et portail client depuis le dashboard." },
                ].map((v, i) => (
                    <div key={i} className="pp-vc">
                        <div className="pp-vn">0{i+1}</div>
                        <h3 className="pp-vt">{v.t}</h3>
                        <p className="pp-vd">{v.d}</p>
                    </div>
                ))}
            </div>

            <h2 className="pp-otitle">Les offres envisagées</h2>
            <div className="pp-offres">
                {offres.map((o, i) => (
                    <div key={i} className={`pp-o${o.hl?' pp-hl':''}`}>
                        {o.hl && <div className="pp-badge">Recommandé</div>}
                        <div className="pp-nom">{o.nom}</div>
                        <div className="pp-pr"><span className="pp-prix">{o.prix}</span><span className="pp-duree">{o.duree}</span></div>
                        <div className="pp-desc">{o.desc}</div>
                        <ul className="pp-feats">{o.feats.map((f,j)=><li key={j}>{f}</li>)}</ul>
                        <div className="pp-note">{o.note}</div>
                    </div>
                ))}
            </div>

            <div className="pp-disc">
                <p>Ces tarifs sont indicatifs et susceptibles d'évoluer. Si vous souhaitez donner votre avis ou êtes intéressé par une offre, contactez-nous directement.</p>
            </div>
        </div>
    );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
interface Message {
    role: 'user' | 'assistant';
    content: string;
}

function App() {
    const [page, setPage] = useState<'landing'|'vitrine'|'paiement'>('landing');
    return (
        <div className="shell">
            <div className="tabs">
                <div className="tabs-logo"><Logo size={22} /></div>
                <button className={`tab${page==='landing'?' tab-on':''}`} onClick={()=>setPage('landing')}>UniChatter</button>
                <button className={`tab${page==='vitrine'?' tab-on':''}`} onClick={()=>setPage('vitrine')}>Démo Vitrine</button>
                <button className={`tab${page==='paiement'?' tab-on':''}`} onClick={()=>setPage('paiement')}>Modèle de Paiement</button>
            </div>
            {page==='landing'  && <LandingPage onGoToVitrine={()=>setPage('vitrine')} onGoToPaiement={()=>setPage('paiement')}/>}
            {page==='vitrine'  && <VitrinePage/>}
            {page==='paiement' && <PaiementPage/>}
        </div>
    );
}

export default App;