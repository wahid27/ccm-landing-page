import React, { useState, useEffect, useRef } from 'react';
import { 
  HardHat, Truck, Package, Home, Building2, Ruler, 
  ShieldCheck, Award, Clock, Star, ChevronRight, 
  Phone, Mail, MapPin, Search, Menu, X, Users, 
  Lightbulb, CheckCircle2, MessageCircle, ChevronDown,
  Scale, Zap, ChevronLeft, Quote, Loader2, Send, Settings, Save, Image as ImageIcon
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "ccm-landingpage"; 

// --- URL SPREADSHEET ANDA ---
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5gUyeidvrwC5XkNk-ENgWo2w8WQyK9XcNG8KnMxu84fUtqLhfl7tLaFCD3mePwrKACA/exec"; 

// --- Custom Hook for Scroll Reveal Animation ---
const useReveal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setIsVisible(true);
      });
    }, { threshold: 0.1 });
    const { current } = domRef;
    if (current) observer.observe(current);
    return () => { if (current) observer.unobserve(current); };
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
  
  // CMS & Content State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Default Site Content
  const [siteData, setSiteData] = useState({
    hero: [
      { 
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=1600", 
        tag: "Kontraktor & Supplier Terpercaya", 
        title: "Membangun Kepercayaan Tanpa Batas", 
        desc: "Integrasi layanan dari pengadaan material hingga eksekusi konstruksi untuk efisiensi proyek yang maksimal." 
      },
      { 
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600", 
        tag: "Solusi Material Premium", 
        title: "Kualitas Material Standar Internasional", 
        desc: "Menyediakan pasokan bahan bangunan berkualitas tinggi langsung dari sumbernya." 
      }
    ],
    about: { 
      experience: "10", 
      title: "Mengapa Memilih Chaerunisa Citra Mandiri?", 
      desc: "Kami menyederhanakan proses konstruksi yang rumit menjadi langkah-langkah yang terukur dan transparan bagi setiap klien kami." 
    },
    contact: { 
      phone: "+62 21 555 0123", 
      email: "contact@ccm-contractor.id" 
    }
  });

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState(null);

  // 1. Auth & Admin Detection
  useEffect(() => {
    if (typeof window !== "undefined") {
      try { getAnalytics(app); } catch(e) {}
      const params = new URLSearchParams(window.location.search);
      if (params.get('edit') === 'true') setIsAdminMode(true);
    }
    
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Fetch Content from Firestore
  useEffect(() => {
    if (!user) return;
    const configDoc = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main');
    
    const unsubscribe = onSnapshot(configDoc, (docSnap) => {
      if (docSnap.exists()) {
        setSiteData(docSnap.data());
      }
      setIsLoadingContent(false);
    }, (error) => {
      console.error("Firestore Load Error:", error);
      setIsLoadingContent(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  // 3. Slider Logic
  useEffect(() => {
    if (!siteData.hero || siteData.hero.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === siteData.hero.length - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(timer);
  }, [siteData.hero]);

  // 4. Save CMS Changes
  const saveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), siteData);
      setIsAdminMode(false);
      window.history.replaceState({}, '', window.location.pathname);
    } catch (e) {
      console.error("Save Error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitStatus('loading');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'inquiries'), {
        ...formData,
        timestamp: serverTimestamp(),
        userId: user.uid
      });

      if (GOOGLE_SCRIPT_URL) {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, source: 'CCM Website Official' })
        });
      }
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { title: "General Contractor", desc: "Konstruksi sipil, gedung, dan residensial dengan standar teknik tinggi.", icon: <Building2 className="w-8 h-8" /> },
    { title: "Material Supplier", desc: "Penyedia bahan bangunan berkualitas premium langsung dari sumbernya.", icon: <Package className="w-8 h-8" /> },
    { title: "Logistics & Transport", desc: "Armada handal untuk pengiriman material tepat waktu ke lokasi proyek.", icon: <Truck className="w-8 h-8" /> },
    { title: "Structural Design", desc: "Perencanaan struktur yang aman, efisien, dan sesuai regulasi terbaru.", icon: <Ruler className="w-8 h-8" /> },
    { title: "Interior Finishing", desc: "Sentuhan akhir artistik untuk meningkatkan nilai estetika bangunan.", icon: <Home className="w-8 h-8" /> },
    { title: "Project Management", desc: "Supervisi profesional untuk memastikan proyek selesai tepat anggaran.", icon: <HardHat className="w-8 h-8" /> }
  ];

  const projects = [
    { title: "Modern Family Residence", category: "Residential", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600" },
    { title: "Downtown Office Tower", category: "Commercial", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600" },
    { title: "Industrial Warehouse Hub", category: "Infrastructure", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600" },
    { title: "Urban Bridge Project", category: "Infrastructure", image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=600" }
  ];

  const testimonials = [
    { name: "Budi Santoso", role: "Owner Residensial", text: "CCM bekerja sangat profesional. Material dikirim tepat waktu dan pengerjaan strukturnya sangat rapi.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" },
    { name: "Ir. Handoko", role: "Project Manager", text: "Kerjasama dalam pengadaan material logistik sangat membantu kami memangkas biaya operasional proyek.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200" },
    { name: "Siti Aminah", role: "Developer", text: "Integrasi layanan dari kontraktor hingga transporter membuat koordinasi proyek jauh lebih mudah.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" }
  ];

  const filteredProjects = projectFilter === 'All' ? projects : projects.filter(p => p.category === projectFilter);

  if (isLoadingContent) return <div className="h-screen w-full flex items-center justify-center bg-[#1a202c] text-white"><Loader2 className="animate-spin text-[#0000ff]" size={48} /></div>;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100 scroll-smooth">
      {/* Admin Toolbar */}
      {isAdminMode && (
        <div className="fixed top-24 right-6 z-[100] bg-white p-4 rounded-2xl shadow-2xl border-2 border-[#0000ff] flex flex-col gap-3 animate-fade-in-up">
          <p className="text-[#0000ff] font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Settings size={14}/> Mode Edit Aktif</p>
          <button onClick={saveChanges} disabled={isSaving} className="bg-[#0000ff] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg">
            {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} Simpan Semua Perubahan
          </button>
        </div>
      )}

      {/* Floating WA */}
      <a href={`https://wa.me/${siteData.contact.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-[60] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all animate-bounce flex items-center justify-center"><MessageCircle size={32} /></a>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 px-6 py-4 transition-all duration-500 ${scrolled ? 'bg-[#1a202c]/95 shadow-2xl border-b border-white/5 backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#0000ff] p-1.5 rounded-lg shadow-lg"><Building2 className="text-white w-6 h-6" /></div>
            <span className="text-xl font-black text-white tracking-tighter uppercase">CHAERUNISA <span className="text-[#0000ff]">CITRA MANDIRI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-300">
            <a href="#home" className="hover:text-[#0000ff] transition-colors">Home</a>
            <a href="#services" className="hover:text-[#0000ff] transition-colors">Layanan</a>
            <a href="#projects" className="hover:text-[#0000ff] transition-colors">Proyek</a>
            <a href="#contact" className="bg-[#0000ff] text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-lg">Hubungi Kami</a>
          </div>
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
        </div>
        <div className={`fixed inset-0 bg-[#1a202c] z-40 transition-all duration-500 md:hidden flex flex-col items-center justify-center gap-8 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
            <a href="#home" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-white">Home</a>
            <a href="#services" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-white">Layanan</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="bg-[#0000ff] text-white px-10 py-4 rounded-full font-bold text-lg">Hubungi Kami</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center pt-20 overflow-hidden bg-slate-900">
        {siteData.hero.map((slide, index) => (
          <div key={index} className={`absolute inset-0 z-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <img src={slide.image} className="w-full h-full object-cover scale-110" alt="Construction Site" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a202c] via-[#1a202c]/85 to-transparent"></div>
          </div>
        ))}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-4xl space-y-6">
            {isAdminMode ? (
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 space-y-4">
                <input className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white text-xs font-bold" value={siteData.hero[currentSlide].tag} onChange={(e) => { let h = [...siteData.hero]; h[currentSlide].tag = e.target.value; setSiteData({...siteData, hero: h}); }} placeholder="Tag Hero" />
                <textarea className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white text-4xl md:text-6xl font-black h-48" value={siteData.hero[currentSlide].title} onChange={(e) => { let h = [...siteData.hero]; h[currentSlide].title = e.target.value; setSiteData({...siteData, hero: h}); }} />
                <div className="flex gap-2 text-white/40 text-xs items-center bg-black/20 p-2 rounded-lg"><ImageIcon size={14}/> URL Gambar: <input className="flex-1 bg-transparent outline-none text-white font-mono" value={siteData.hero[currentSlide].image} onChange={(e) => { let h = [...siteData.hero]; h[currentSlide].image = e.target.value; setSiteData({...siteData, hero: h}); }} /></div>
              </div>
            ) : (
              <div className="animate-fade-in-up">
                <div className="inline-block px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full mb-8 text-[#0000ff] font-black text-[10px] uppercase tracking-[0.2em]">{siteData.hero[currentSlide].tag}</div>
                <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.1] mb-8 drop-shadow-2xl">{siteData.hero[currentSlide].title}</h1>
                <p className="text-gray-300 text-xl max-w-xl mb-12 leading-relaxed">{siteData.hero[currentSlide].desc}</p>
                <a href="#contact" className="bg-[#0000ff] text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all inline-flex items-center gap-3 shadow-2xl">Mulai Proyek <ChevronRight /></a>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-12 right-12 z-20 flex flex-col gap-4">
          {siteData.hero.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 transition-all duration-500 rounded-full ${currentSlide === i ? 'w-16 bg-[#0000ff]' : 'w-4 bg-white/30'}`} />
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-[#1a202c] py-32 px-6 relative">
        <RevealSection className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4">Layanan Utama</h3>
            <h2 className="text-5xl font-black text-white">Solusi Konstruksi Terpadu</h2>
            <div className="w-24 h-2 bg-[#0000ff] mx-auto mt-6 rounded-full shadow-lg shadow-blue-500/40"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <div key={i} className="group p-10 bg-[#2d3748]/50 rounded-[2.5rem] hover:bg-[#0000ff] transition-all duration-500 cursor-pointer border border-white/5 shadow-2xl hover:-translate-y-3">
                <div className="w-20 h-20 bg-[#1a202c] group-hover:bg-white/20 rounded-2xl flex items-center justify-center text-[#0000ff] group-hover:text-white mb-8 transition-all duration-500">{s.icon}</div>
                <h4 className="text-2xl font-bold text-white mb-4">{s.title}</h4>
                <p className="text-gray-400 group-hover:text-blue-50 text-base leading-relaxed transition-colors">{s.desc}</p>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* Working Process Section */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <RevealSection className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-16 items-center">
                <div className="md:w-1/2">
                    <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.2em] text-sm mb-4">Our Process</h3>
                    <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Bagaimana Kami <br/><span className="text-[#0000ff]">Bekerja?</span></h2>
                    <p className="text-slate-500 text-lg mb-10">Kami menyederhanakan proses konstruksi yang rumit menjadi langkah-langkah yang terukur dan transparan bagi klien kami.</p>
                    <div className="space-y-8">
                        {[
                            { step: "01", title: "Konsultasi & Survei", desc: "Diskusi mendalam mengenai kebutuhan, anggaran, dan survei lokasi proyek." },
                            { step: "02", title: "Desain & Perencanaan", desc: "Pembuatan rancangan arsitektur, struktur, dan Rencana Anggaran Biaya (RAB)." },
                            { step: "03", title: "Eksekusi & Supervisi", desc: "Pengerjaan konstruksi dengan pengawasan ketat untuk menjamin kualitas." },
                        ].map((p, i) => (
                            <div key={i} className="flex gap-6 items-start group">
                                <div className="text-4xl font-black text-blue-100 group-hover:text-[#0000ff] transition-colors">{p.step}</div>
                                <div><h4 className="text-xl font-bold mb-2">{p.title}</h4><p className="text-slate-500 text-sm">{p.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="md:w-1/2 relative">
                    <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800" className="rounded-[3rem] shadow-2xl w-full object-cover aspect-square" alt="Planning process" />
                </div>
            </div>
        </RevealSection>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="py-32 px-6 bg-slate-50 relative overflow-hidden">
        <RevealSection className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2 relative group">
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl aspect-[4/3] border-8 border-white">
                <img src={siteData.hero[0].image} alt="CCM Construction" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute -bottom-10 right-0 sm:right-10 bg-white p-10 rounded-[2rem] shadow-2xl border-b-[10px] border-[#0000ff] animate-float z-10 text-center min-w-[240px]">
                {isAdminMode ? (
                  <input className="text-5xl font-black text-center w-full border-none outline-none focus:ring-0" value={siteData.about.experience} onChange={(e) => setSiteData({...siteData, about: {...siteData.about, experience: e.target.value}})} />
                ) : (
                  <span className="text-7xl font-black">{siteData.about.experience}<span className="text-[#0000ff]">+</span></span>
                )}
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Tahun Pengalaman</p>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-8">
              <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.4em] text-xs">Keunggulan Kami</h3>
              {isAdminMode ? (
                <div className="space-y-4">
                  <input className="text-4xl font-black w-full p-4 border-2 border-blue-100 rounded-2xl focus:border-[#0000ff] transition-all" value={siteData.about.title} onChange={(e) => setSiteData({...siteData, about: {...siteData.about, title: e.target.value}})} />
                  <textarea className="w-full text-slate-500 h-48 p-4 border-2 border-blue-100 rounded-2xl focus:border-[#0000ff] transition-all" value={siteData.about.desc} onChange={(e) => setSiteData({...siteData, about: {...siteData.about, desc: e.target.value}})} />
                </div>
              ) : (
                <>
                  <h2 className="text-4xl md:text-6xl font-black leading-[1.1]">{siteData.about.title}</h2>
                  <p className="text-slate-500 text-xl leading-relaxed">{siteData.about.desc}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                    {["Legalitas Lengkap", "Tim Ahli Bersertifikat", "Material Berkualitas", "Support 24/7"].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 font-bold text-slate-800"><CheckCircle2 className="text-[#0000ff]" size={20} /> {item}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
        </RevealSection>
      </section>

      {/* Projects Gallery */}
      <section id="projects" className="py-32 px-6 bg-[#1a202c]">
        <RevealSection className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.2em] text-xs mb-4">Our Projects</h3>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-10">Hasil Kerja Kami</h2>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {['All', 'Residential', 'Commercial', 'Infrastructure'].map((filter) => (
                <button key={filter} onClick={() => setProjectFilter(filter)} className={`px-6 py-2 rounded-full font-bold text-sm transition-all border-2 ${projectFilter === filter ? 'bg-[#0000ff] border-[#0000ff] text-white' : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30'}`}>{filter}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProjects.map((p, i) => (
              <div key={i} className="group relative rounded-3xl overflow-hidden aspect-[4/5] cursor-pointer shadow-2xl bg-[#2d3748]">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a202c] via-[#1a202c]/20 to-transparent flex flex-col justify-end p-8">
                  <span className="text-[#0000ff] text-[10px] font-black uppercase tracking-[0.3em] mb-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">{p.category}</span>
                  <h4 className="text-white font-bold text-2xl leading-tight mb-2">{p.title}</h4>
                  <div className="flex items-center gap-2 text-white/50 text-xs mt-2 overflow-hidden"><div className="w-8 h-[2px] bg-[#0000ff] shrink-0"></div><span>View Project</span></div>
                </div>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-white relative">
        <RevealSection className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4">Testimonials</h3>
            <h2 className="text-5xl font-black text-slate-900 mb-6 text-center">Apa Kata Klien Kami</h2>
            <div className="w-20 h-2 bg-[#0000ff] mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((t, i) => (
              <div key={i} className="group bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 hover:border-[#0000ff] transition-all duration-500 relative flex flex-col justify-between hover:-translate-y-4">
                <div className="absolute top-8 right-10 text-blue-50 group-hover:text-blue-100 transition-colors"><Quote size={80} fill="currentColor" /></div>
                <div className="relative z-10">
                  <div className="flex gap-1 text-yellow-400 mb-8">{[...Array(5)].map((_, idx) => <Star key={idx} size={18} fill="currentColor" />)}</div>
                  <p className="text-slate-600 italic text-lg mb-10 font-medium leading-relaxed">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                  <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-50" />
                  <div>
                    <div className="font-black text-slate-900 text-lg leading-none mb-1">{t.name}</div>
                    <div className="text-xs text-[#0000ff] font-black uppercase tracking-widest">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* FAQ */}
      <section className="py-32 px-6 bg-slate-50">
        <RevealSection className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black mb-12 text-center">Pertanyaan Umum</h2>
          <div className="space-y-4">
            {['Apakah melayani proyek di luar kota?', 'Bagaimana sistem pembayaran?', 'Apakah material bergaransi?'].map((q, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors">
                  <span className="font-bold text-slate-800">{q}</span>
                  <ChevronDown className={`text-[#0000ff] transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && <div className="p-6 pt-0 text-slate-500 text-sm border-t border-slate-50">Ya, kami melayani proyek skala nasional dengan syarat dan ketentuan yang disepakati bersama.</div>}
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-32 px-6 bg-white relative">
        <RevealSection className="max-w-7xl mx-auto">
            <div className="bg-[#1a202c] rounded-[4rem] overflow-hidden shadow-3xl flex flex-col lg:flex-row border border-white/5">
                <div className="lg:w-1/2 p-12 lg:p-24 text-white space-y-12">
                    <h2 className="text-5xl font-black mb-8 leading-tight">Mulai Proyek <br/><span className="text-[#0000ff]">Anda Sekarang</span></h2>
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
                            <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold" placeholder="Nama Lengkap" />
                            <input required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold" placeholder="Email Aktif" />
                        </div>
                        <input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold" placeholder="WhatsApp (0812...)" />
                        <textarea required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 h-40 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold" placeholder="Detail Proyek..."></textarea>
                        <button disabled={submitStatus === 'loading'} type="submit" className="w-full bg-[#0000ff] text-white font-black py-6 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-xl shadow-blue-500/30 text-xl">
                          {submitStatus === 'loading' ? <Loader2 className="animate-spin" /> : <><Send size={24} /> Kirim Permintaan Sekarang</>}
                        </button>
                        {submitStatus === 'success' && <div className="mt-4 p-6 bg-green-50 border-2 border-green-200 text-green-700 rounded-3xl text-center font-black animate-fade-in-up">✓ Berhasil Terkirim ke Database & Spreadsheet!</div>}
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
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.5); }
      `}</style>
    </div>
  );
}