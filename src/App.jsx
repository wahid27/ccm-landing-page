import React, { useState, useEffect, useRef } from 'react';
import { 
  HardHat, Truck, Package, Home, Building2, Ruler, 
  ShieldCheck, Award, Clock, Star, ChevronRight, 
  Phone, Mail, MapPin, Search, Menu, X, Users, 
  Lightbulb, CheckCircle2, MessageCircle, ChevronDown,
  Scale, Zap, ChevronLeft, Quote, Loader2, Send, Settings, Save, Image as ImageIcon, Plus, Trash2
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// --- KONFIGURASI FIREBASE ANDA ---
const firebaseConfig = {
  apiKey: "AIzaSyDwAh8pY2-3oELinlpwyBBUyVCgeQshqN8",
  authDomain: "ccm-landingpage.firebaseapp.com",
  projectId: "ccm-landingpage",
  storageBucket: "ccm-landingpage.firebasestorage.app",
  messagingSenderId: "756544129594",
  appId: "1:756544129594:web:579fcd9ffa6ebea4180303",
  measurementId: "G-2YVZV487HC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "ccm-landingpage"; 

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5gUyeidvrwC5XkNk-ENgWo2w8WQyK9XcNG8KnMxu84fUtqLhfl7tLaFCD3mePwrKACA/exec"; 

// --- Reveal Animation Hook ---
const useReveal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setIsVisible(true); });
    }, { threshold: 0.1 });
    if (domRef.current) observer.observe(domRef.current);
    return () => { if (domRef.current) observer.unobserve(domRef.current); };
  }, []);
  return [domRef, isVisible];
};

const RevealSection = ({ children, className = "" }) => {
  const [ref, isVisible] = useReveal();
  return (
    <div ref={ref} className={`${className} transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}>
      {children}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [projectFilter, setProjectFilter] = useState('All');
  const [activeFaq, setActiveFaq] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // CMS States
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data Awal Lengkap
  const [siteData, setSiteData] = useState({
    hero: [
      { image: "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=1600", tag: "Kontraktor & Supplier Terpercaya", title: "Membangun Kepercayaan Tanpa Batas", desc: "Integrasi layanan dari pengadaan material hingga eksekusi konstruksi untuk efisiensi proyek yang maksimal." },
      { image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600", tag: "Solusi Material Premium", title: "Kualitas Material Standar Internasional", desc: "Menyediakan pasokan bahan bangunan berkualitas tinggi langsung dari sumbernya." },
      { image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1600", tag: "Logistik & Transportasi", title: "Ketepatan Logistik di Setiap Lokasi", desc: "Armada transportasi handal siap mengirimkan kebutuhan proyek Anda tepat waktu." }
    ],
    services: [
      { title: "General Contractor", desc: "Konstruksi sipil, gedung, dan residensial dengan standar teknik tinggi." },
      { title: "Material Supplier", desc: "Penyedia bahan bangunan berkualitas premium langsung dari sumbernya." },
      { title: "Logistics & Transport", desc: "Armada handal untuk pengiriman material tepat waktu ke lokasi proyek." },
      { title: "Structural Design", desc: "Perencanaan struktur yang aman, efisien, dan sesuai regulasi terbaru." },
      { title: "Interior Finishing", desc: "Sentuhan akhir artistik untuk meningkatkan nilai estetika bangunan." },
      { title: "Project Management", desc: "Supervisi profesional untuk memastikan proyek selesai tepat anggaran." }
    ],
    process: [
      { step: "01", title: "Konsultasi & Survei", desc: "Diskusi mendalam mengenai kebutuhan, anggaran, dan survei lokasi proyek." },
      { step: "02", title: "Desain & Perencanaan", desc: "Pembuatan rancangan arsitektur, struktur, dan Rencana Anggaran Biaya (RAB)." },
      { step: "03", title: "Eksekusi & Supervisi", desc: "Pengerjaan konstruksi dengan pengawasan ketat untuk menjamin kualitas." }
    ],
    about: { experience: "10", title: "Mengapa Memilih Chaerunisa Citra Mandiri?", desc: "Kami menyederhanakan proses konstruksi yang rumit menjadi langkah-langkah yang terukur dan transparan bagi setiap klien kami." },
    projects: [
      { title: "Modern Family Residence", category: "Residential", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600" },
      { title: "Downtown Office Tower", category: "Commercial", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600" },
      { title: "Industrial Warehouse Hub", category: "Commercial", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600" },
      { title: "Urban Bridge Project", category: "Infrastructure", image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=600" },
      { title: "Luxury Villa Resort", category: "Residential", image: "https://images.unsplash.com/photo-1512918766775-dbf074485918?q=80&w=600" },
      { title: "Smart City Pipeline", category: "Infrastructure", image: "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=600" }
    ],
    testimonials: [
      { name: "Budi Santoso", role: "Owner Residensial", text: "CCM bekerja sangat profesional. Material dikirim tepat waktu dan pengerjaan strukturnya sangat rapi.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200" },
      { name: "Ir. Handoko", role: "Project Manager", text: "Kerjasama dalam pengadaan material logistik sangat membantu kami memangkas biaya operasional proyek secara signifikan.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200" },
      { name: "Siti Aminah", role: "Developer", text: "Integrasi layanan dari kontraktor hingga transporter membuat koordinasi proyek jauh lebih mudah dan terkendali.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200" }
    ],
    faqs: [
      { q: "Apakah melayani proyek di luar Jabodetabek?", a: "Ya, kami melayani proyek konstruksi dan pengiriman material ke seluruh wilayah Pulau Jawa dan beberapa wilayah di luar Jawa." },
      { q: "Bagaimana sistem pembayaran proyek di CCM?", a: "Sistem pembayaran dilakukan secara bertahap (termin) sesuai dengan progres pengerjaan fisik yang telah disepakati di awal." },
      { q: "Apakah material yang disediakan memiliki sertifikasi SNI?", a: "Tentu. Semua material yang kami suplai telah melalui kontrol kualitas ketat dan memiliki sertifikasi SNI untuk menjamin keamanan bangunan." }
    ],
    contact: { phone: "+62 21 555 0123", email: "contact@ccm-contractor.id" }
  });

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState(null);

  // Auth & Mode Detect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get('edit') === 'true') setIsAdminMode(true);
    }
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (err) {} };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Sync with Firestore (Real-time)
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), (docSnap) => {
      if (docSnap.exists()) setSiteData(docSnap.data());
      setIsLoadingContent(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Slider Logic (Auto loop)
  useEffect(() => {
    if (siteData.hero.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === siteData.hero.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [siteData.hero.length]);

  // Save Function
  const saveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), siteData);
      setIsAdminMode(false);
      window.history.replaceState({}, '', window.location.pathname);
    } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'inquiries'), { ...formData, timestamp: serverTimestamp() });
      if (GOOGLE_SCRIPT_URL) await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(formData) });
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) { setSubmitStatus('error'); }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoadingContent) return <div className="h-screen w-full flex items-center justify-center bg-[#1a202c] text-white"><Loader2 className="animate-spin text-[#0000ff]" size={48} /></div>;

  const filteredProjects = projectFilter === 'All' ? siteData.projects : siteData.projects.filter(p => p.category === projectFilter);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100 scroll-smooth">
      {/* CMS UI Toolbar */}
      {isAdminMode && (
        <div className="fixed top-24 right-6 z-[100] bg-white p-5 rounded-[2rem] shadow-2xl border-2 border-[#0000ff] flex flex-col gap-4 animate-fade-in-up w-72">
          <div className="flex items-center gap-2 text-[#0000ff] font-black text-xs uppercase tracking-widest"><Settings size={16}/> Mode Admin</div>
          <button onClick={saveChanges} disabled={isSaving} className="bg-[#0000ff] text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl">
            {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />} Simpan Perubahan
          </button>
          <p className="text-[9px] text-slate-400 font-bold leading-relaxed">Klik teks atau input untuk mengubah. Gunakan ikon sampah untuk menghapus item.</p>
        </div>
      )}

      {/* Floating WhatsApp */}
      <a href={`https://wa.me/${siteData.contact.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-[60] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all animate-bounce flex items-center justify-center"><MessageCircle size={32} /></a>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 px-6 py-4 transition-all duration-500 ${scrolled ? 'bg-[#1a202c]/95 shadow-2xl backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#0000ff] p-1.5 rounded-lg shadow-lg"><Building2 className="text-white w-6 h-6" /></div>
            <span className="text-xl font-black text-white tracking-tighter uppercase">CHAERUNISA <span className="text-[#0000ff]">CITRA MANDIRI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-300">
            <a href="#home" className="hover:text-[#0000ff]">Home</a>
            <a href="#services" className="hover:text-[#0000ff]">Layanan</a>
            <a href="#projects" className="hover:text-[#0000ff]">Proyek</a>
            <a href="#contact" className="bg-[#0000ff] text-white px-6 py-2.5 rounded-full hover:bg-blue-700 shadow-lg">Hubungi Kami</a>
          </div>
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center pt-20 overflow-hidden bg-slate-900">
        {siteData.hero.map((slide, index) => (
          <div key={index} className={`absolute inset-0 z-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <img src={slide.image} className="w-full h-full object-cover scale-110" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a202c] via-[#1a202c]/85 to-transparent"></div>
          </div>
        ))}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          {isAdminMode ? (
            <div className="max-w-4xl bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 space-y-6">
              <input className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white text-xs font-black uppercase tracking-widest" value={siteData.hero[currentSlide].tag} onChange={(e) => { let h = [...siteData.hero]; h[currentSlide].tag = e.target.value; setSiteData({...siteData, hero: h}); }} placeholder="Tagbar" />
              <textarea className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white text-5xl font-black h-48" value={siteData.hero[currentSlide].title} onChange={(e) => { let h = [...siteData.hero]; h[currentSlide].title = e.target.value; setSiteData({...siteData, hero: h}); }} placeholder="Judul Hero" />
              <div className="flex gap-2 text-white/40 text-[10px] items-center bg-black/20 p-3 rounded-xl"><ImageIcon size={14}/> Link Gambar: <input className="flex-1 bg-transparent outline-none text-white font-mono" value={siteData.hero[currentSlide].image} onChange={(e) => { let h = [...siteData.hero]; h[currentSlide].image = e.target.value; setSiteData({...siteData, hero: h}); }} /></div>
            </div>
          ) : (
            <div className="max-w-4xl animate-fade-in-up">
              <div className="inline-block px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full mb-8 text-[#0000ff] font-black text-[10px] uppercase tracking-[0.2em]">{siteData.hero[currentSlide].tag}</div>
              <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.1] mb-8 drop-shadow-2xl">{siteData.hero[currentSlide].title}</h1>
              <a href="#contact" className="bg-[#0000ff] text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all inline-flex items-center gap-3 shadow-2xl active:scale-95">Mulai Proyek <ChevronRight /></a>
            </div>
          )}
        </div>
        <div className="absolute bottom-12 right-12 z-20 flex flex-col gap-4">
          {siteData.hero.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 transition-all duration-500 rounded-full ${currentSlide === i ? 'w-16 bg-[#0000ff]' : 'w-4 bg-white/30'}`} />
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-[#1a202c] py-32 px-6 relative">
        <RevealSection className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4">Layanan Utama</h3>
            <h2 className="text-5xl font-black text-white">Solusi Konstruksi Terpadu</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {siteData.services.map((s, i) => (
              <div key={i} className="group p-10 bg-[#2d3748]/50 rounded-[2.5rem] hover:bg-[#0000ff] transition-all duration-500 border border-white/5 shadow-2xl">
                <Building2 className="text-[#0000ff] group-hover:text-white mb-8" size={40} />
                {isAdminMode ? (
                  <div className="space-y-3">
                    <input className="w-full bg-white/10 rounded-lg p-2 text-white font-bold" value={s.title} onChange={(e) => { let ns = [...siteData.services]; ns[i].title = e.target.value; setSiteData({...siteData, services: ns}); }} />
                    <textarea className="w-full bg-white/10 rounded-lg p-2 text-gray-400 text-sm h-24" value={s.desc} onChange={(e) => { let ns = [...siteData.services]; ns[i].desc = e.target.value; setSiteData({...siteData, services: ns}); }} />
                  </div>
                ) : (
                  <><h4 className="text-2xl font-bold text-white mb-4">{s.title}</h4><p className="text-gray-400 group-hover:text-blue-50 text-base leading-relaxed">{s.desc}</p></>
                )}
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* Process Section */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <RevealSection className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-16 items-center">
                <div className="md:w-1/2 space-y-8">
                    <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">Bagaimana Kami <span className="text-[#0000ff]">Bekerja?</span></h2>
                    <div className="space-y-10">
                        {siteData.process.map((p, i) => (
                            <div key={i} className="flex gap-6 items-start group">
                                <div className="text-4xl font-black text-blue-100 group-hover:text-[#0000ff] transition-colors">{p.step}</div>
                                <div className="flex-1">
                                    {isAdminMode ? (
                                      <div className="space-y-2">
                                        <input className="w-full font-bold text-xl border-b border-slate-100 p-1" value={p.title} onChange={(e) => { let np = [...siteData.process]; np[i].title = e.target.value; setSiteData({...siteData, process: np}); }} />
                                        <textarea className="w-full text-slate-500 text-sm p-1" value={p.desc} onChange={(e) => { let np = [...siteData.process]; np[i].desc = e.target.value; setSiteData({...siteData, process: np}); }} />
                                      </div>
                                    ) : (
                                      <><h4 className="text-xl font-bold mb-2">{p.title}</h4><p className="text-slate-500 text-sm">{p.desc}</p></>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="md:w-1/2 relative"><img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800" className="rounded-[3rem] shadow-2xl w-full aspect-square object-cover" alt="Process" /></div>
            </div>
        </RevealSection>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-32 px-6 bg-[#1a202c]">
        <RevealSection className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-16 text-center">Hasil Kerja Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((p, i) => (
              <div key={i} className="group relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl bg-[#2d3748]">
                <img src={p.image} alt="Project" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a202c] via-[#1a202c]/20 to-transparent flex flex-col justify-end p-8">
                  {isAdminMode ? (
                    <div className="bg-white/90 p-4 rounded-2xl space-y-2">
                      <input className="w-full text-xs font-black uppercase text-blue-600" value={p.category} onChange={(e) => { let np = [...siteData.projects]; np[i].category = e.target.value; setSiteData({...siteData, projects: np}); }} />
                      <input className="w-full text-lg font-bold text-slate-800" value={p.title} onChange={(e) => { let np = [...siteData.projects]; np[i].title = e.target.value; setSiteData({...siteData, projects: np}); }} />
                      <button onClick={() => { let np = siteData.projects.filter((_, idx) => idx !== i); setSiteData({...siteData, projects: np}); }} className="text-red-500 text-[10px] font-bold">Hapus</button>
                    </div>
                  ) : (
                    <><span className="text-[#0000ff] text-[10px] font-black uppercase tracking-[0.3em] mb-3">{p.category}</span><h4 className="text-white font-bold text-2xl leading-tight mb-2">{p.title}</h4></>
                  )}
                </div>
              </div>
            ))}
            {isAdminMode && (
              <button onClick={() => setSiteData({...siteData, projects: [...siteData.projects, { title: 'Proyek Baru', category: 'Residential', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5' }]})} className="border-4 border-dashed border-white/10 rounded-[2.5rem] flex items-center justify-center text-white/20 min-h-[400px] hover:text-[#0000ff] transition-all"><Plus size={48} /></button>
            )}
          </div>
        </RevealSection>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-6 bg-white relative">
        <RevealSection className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black text-slate-900 mb-16 text-center">Apa Kata Klien Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {siteData.testimonials.map((t, i) => (
              <div key={i} className="group bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative hover:-translate-y-4 transition-all duration-500">
                <Quote className="absolute top-8 right-10 text-blue-50" size={80} fill="currentColor" />
                <div className="relative z-10 space-y-6">
                  {isAdminMode ? (
                    <div className="space-y-4">
                      <textarea className="w-full text-slate-600 italic text-sm p-2 bg-slate-50 rounded-xl h-32" value={t.text} onChange={(e) => { let nt = [...siteData.testimonials]; nt[i].text = e.target.value; setSiteData({...siteData, testimonials: nt}); }} />
                      <input className="w-full font-black text-slate-900" value={t.name} onChange={(e) => { let nt = [...siteData.testimonials]; nt[i].name = e.target.value; setSiteData({...siteData, testimonials: nt}); }} />
                      <button onClick={() => { let nt = siteData.testimonials.filter((_, idx) => idx !== i); setSiteData({...siteData, testimonials: nt}); }} className="text-red-500 text-xs font-bold">Hapus Testimoni</button>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-600 italic text-lg leading-relaxed">"{t.text}"</p>
                      <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                        <img src={t.avatar} alt="Client" className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-50" />
                        <div><div className="font-black text-slate-900 text-lg leading-none mb-1">{t.name}</div><div className="text-xs text-[#0000ff] font-black uppercase tracking-widest">{t.role}</div></div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            {isAdminMode && (
              <button onClick={() => setSiteData({...siteData, testimonials: [...siteData.testimonials, { name: 'Nama Klien', role: 'Jabatan', text: 'Testimoni Anda...', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' }]})} className="border-4 border-dashed border-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-200 hover:text-[#0000ff] transition-all min-h-[300px]"><Plus size={32} /></button>
            )}
          </div>
        </RevealSection>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6 bg-slate-50">
        <RevealSection className="max-w-3xl mx-auto space-y-12">
          <h2 className="text-4xl font-black text-center">Pertanyaan Umum</h2>
          <div className="space-y-4">
            {siteData.faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
                {isAdminMode ? (
                  <div className="space-y-4">
                    <input className="w-full font-bold text-slate-800 border-b pb-2" value={faq.q} onChange={(e) => { let nf = [...siteData.faqs]; nf[i].q = e.target.value; setSiteData({...siteData, faqs: nf}); }} />
                    <textarea className="w-full text-slate-500 text-sm" value={faq.a} onChange={(e) => { let nf = [...siteData.faqs]; nf[i].a = e.target.value; setSiteData({...siteData, faqs: nf}); }} />
                    <button onClick={() => { let nf = siteData.faqs.filter((_, idx) => idx !== i); setSiteData({...siteData, faqs: nf}); }} className="text-red-500 text-xs font-bold">Hapus Pertanyaan</button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between text-left hover:text-[#0000ff] transition-colors">
                      <span className="font-bold text-slate-800">{faq.q}</span>
                      <ChevronDown className={`text-[#0000ff] transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {activeFaq === i && <div className="pt-4 text-slate-500 text-sm border-t border-slate-50 mt-4 leading-relaxed">{faq.a}</div>}
                  </>
                )}
              </div>
            ))}
            {isAdminMode && (
              <button onClick={() => setSiteData({...siteData, faqs: [...siteData.faqs, { q: 'Pertanyaan Baru?', a: 'Jawaban Anda...' }]})} className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-6 text-slate-300 hover:text-[#0000ff] hover:border-[#0000ff] transition-all flex items-center justify-center gap-2"><Plus size={20}/> Tambah Pertanyaan</button>
            )}
          </div>
        </RevealSection>
      </section>

      {/* Form Kontak */}
      <section id="contact" className="py-32 px-6 bg-white relative">
        <RevealSection className="max-w-7xl mx-auto">
            <div className="bg-[#1a202c] rounded-[4rem] overflow-hidden shadow-3xl flex flex-col lg:flex-row border border-white/5">
                <div className="lg:w-1/2 p-12 lg:p-24 text-white space-y-12">
                    <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight tracking-tight">Mulai Proyek <br/><span className="text-[#0000ff]">Anda Sekarang</span></h2>
                    <div className="space-y-10">
                        <div className="flex gap-6 items-center">
                          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center text-[#0000ff] shadow-2xl"><Phone size={28}/></div>
                          <div><p className="text-xs text-gray-500 uppercase tracking-widest font-black mb-1">Telepon/WA</p><p className="text-2xl font-bold">{siteData.contact.phone}</p></div>
                        </div>
                        <div className="flex gap-6 items-center">
                          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center text-[#0000ff] shadow-2xl"><Mail size={28}/></div>
                          <div><p className="text-xs text-gray-500 uppercase tracking-widest font-black mb-1">Email</p><p className="text-2xl font-bold">{siteData.contact.email}</p></div>
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/2 bg-white p-12 lg:p-24">
                    <form className="space-y-8" onSubmit={handleFormSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold shadow-sm" placeholder="Nama Lengkap" />
                            <input required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold shadow-sm" placeholder="Email Aktif" />
                        </div>
                        <input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold shadow-sm" placeholder="Nomor WhatsApp" />
                        <textarea required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 h-40 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold shadow-sm" placeholder="Detail Proyek Anda..."></textarea>
                        <button disabled={submitStatus === 'loading'} type="submit" className="w-full bg-[#0000ff] text-white font-black py-6 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-xl shadow-blue-500/30 text-xl active:scale-95 disabled:opacity-50">
                          {submitStatus === 'loading' ? <Loader2 className="animate-spin" /> : <><Send size={24} /> Kirim Permintaan Sekarang</>}
                        </button>
                        {submitStatus === 'success' && <div className="mt-4 p-6 bg-green-50 border-2 border-green-200 text-green-700 rounded-3xl text-center font-black animate-fade-in-up">✓ Terkirim ke Spreadsheet & Database!</div>}
                    </form>
                </div>
            </div>
        </RevealSection>
      </section>

      <footer className="bg-[#0b0f19] text-gray-500 py-24 px-6 border-t border-white/5 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="bg-[#0000ff] p-2.5 rounded-xl"><Building2 className="text-white w-8 h-8" /></div>
            <span className="text-3xl font-black text-white tracking-tighter uppercase">CHAERUNISA <span className="text-[#0000ff]">CITRA MANDIRI</span></span>
          </div>
          <p className="text-xs uppercase font-black tracking-[0.4em] opacity-40">© 2024 CHAERUNISA CITRA MANDIRI. All Rights Reserved.</p>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.5); }
      `}</style>
    </div>
  );
}