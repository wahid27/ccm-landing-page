import React, { useState, useEffect, useRef } from 'react';
import { 
  HardHat, Truck, Package, Building2, 
  ShieldCheck, Award, Star, ChevronRight, 
  Phone, Mail, MapPin, Menu, X, 
  CheckCircle2, MessageCircle, ChevronDown,
  Zap, Loader2, Send, Settings, Save, 
  Briefcase, Factory, FileDown, Users, Target, TrendingUp
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDwAh8pY2-3oELinlpwyBBUyVCgeQshqN8",
  authDomain: "ccm-landingpage.firebaseapp.com",
  projectId: "ccm-landingpage",
  storageBucket: "ccm-landingpage.firebasestorage.app",
  messagingSenderId: "756544129594",
  appId: "1:756544129594:web:579fcd9ffa6ebea4180303",
  measurementId: "G-2YVZV487HC"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "ccm-landingpage";

// URL Google Apps Script Anda (Wajib di-deploy sebagai "Anyone")
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5gUyeidvrwC5XkNk-ENgWo2w8WQyK9XcNG8KnMxu84fUtqLhfl7tLaFCD3mePwrKACA/exec";

// --- CUSTOM SVG ICONS (Solusi Anti-Crash) ---
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

// --- Custom Testimonial Card ---
const TestimonialCard = ({ name, role, content, image }) => (
  <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 relative group hover:border-[#0000ff]/30 transition-all duration-500 h-full">
    <div className="absolute -top-6 left-8 w-12 h-12 bg-[#0000ff] rounded-full flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20">
      "
    </div>
    <p className="text-slate-600 italic mb-8 mt-4 leading-relaxed group-hover:text-slate-900 transition-colors">"{content}"</p>
    <div className="flex items-center gap-4 mt-auto">
      <img src={image} alt={name} className="w-14 h-14 rounded-full object-cover border-2 border-[#0000ff]/10 group-hover:border-[#0000ff]/40 transition-all" />
      <div>
        <h5 className="font-bold text-slate-900 text-sm leading-tight">{name}</h5>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{role}</p>
      </div>
    </div>
  </div>
);

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
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // --- KONFIGURASI PATH GAMBAR LOKAL (SEMUA DARI FOLDER PUBLIC) ---
  const logoPath = "/logo-ccm.png";
  const iconPath = "/logo-ccm.png";
  const aboutPath = "/about-ccm.jpg";
 

  const [siteData, setSiteData] = useState({
    hero: [
      { 
        image: "/hero-1.jpg", 
        tag: "General Contractor, Supplier & Transporter", 
        title: "Solusi Konstruksi Terintegrasi & Terpercaya", 
        desc: "Menghadirkan layanan profesional, cepat, dan terpercaya untuk mendukung kebutuhan proyek skala kecil hingga besar." 
      },
      { 
        image: "/hero-2.jpg", 
        tag: "Kualitas & Ketepatan Waktu", 
        title: "Membangun Fondasi Masa Depan yang Kokoh", 
        desc: "Berfokus pada efisiensi biaya dan standar tinggi untuk memberikan nilai terbaik bagi setiap klien." 
      }
    ],
    stats: [
      { label: "Tahun Berdiri", value: "2016", icon: <Award className="text-blue-500" /> },
      { label: "Klien Puas", value: "50+", icon: <Users className="text-green-500" /> },
      { label: "Proyek Selesai", value: "100+", icon: <Target className="text-orange-500" /> },
      { label: "Sertifikasi ISO", value: "9001", icon: <ShieldCheck className="text-blue-600" /> }
    ],
    comproUrl: "https://drive.google.com/file/d/1QK0HE4pXlXkqhkNPgMCKhWImC3vkJ4jS/view?usp=sharing", // Ganti ke path lokal jika PDF ditaruh di public
    clients: [
      { name: "PT Bukit Asam, Tbk", icon: <Building2 className="text-orange-500" /> },
      { name: "PT PLN (Persero)", icon: <Zap className="text-blue-500" /> },
      { name: "PT Adhi Karya, Tbk", icon: <Building2 className="text-red-600" /> },
      { name: "PT PP (Persero), Tbk", icon: <HardHat className="text-blue-600" /> },
      { name: "PT Waskita Karya", icon: <Building2 className="text-blue-800" /> },
      { name: "PT Acset Indonusa", icon: <ShieldCheck className="text-blue-400" /> },
      { name: "PT Circle K Indonesia", icon: <Star className="text-red-500" /> },
      { name: "Adaro Energy", icon: <Zap className="text-yellow-600" /> }
    ],
    services: [
      { title: "Konstruksi Umum", desc: "Pembangunan gedung, infrastruktur sipil (jalan, jembatan), perumahan, hingga mekanikal & elektrikal.", icon: "Building2" },
      { title: "Supplier Material", desc: "Penyedia batu andesit, pasir, besi beton SNI, semen, dan material industri berkualitas tinggi.", icon: "Package" },
      { title: "Transportasi & Logistik", desc: "Layanan armada Dump Truck, Tronton, hingga Lowbed trailer untuk angkutan alat berat.", icon: "Truck" },
      { title: "Konveksi Kreatif", desc: "Produksi pakaian berkualitas tinggi dengan desain inovatif untuk seragam dan pasar industri.", icon: "Factory" }
    ],
    benefits: [
      { title: "Kualitas Unggul", desc: "Kami memiliki standar kualitas tinggi dan berkomitmen memberikan hasil terbaik di setiap proyek." },
      { title: "Solusi Inovatif", desc: "Kami mengembangkan pendekatan kreatif yang sesuai dengan kebutuhan dan tujuan bisnis Anda." },
      { title: "Keandalan", desc: "Mengutamakan kualitas pelayanan dan ketepatan waktu dalam setiap transaksi dan pengerjaan." }
    ],
    testimonials: [
      { name: "Budi Santoso", role: "Project Manager, PT Bukit Asam", content: "Kerjasama dengan CCM sangat memuaskan. Pengiriman material selalu tepat waktu dan kualitasnya konsisten.", image: "/testi-1.jpg" },
      { name: "Siti Aminah", role: "Procurement Head, PT Waskita", content: "CCM adalah mitra yang handal. Responsif terhadap kebutuhan mendesak dan profesionalisme luar biasa.", image: "/testi-2.jpg" }, 
      { name: "Budi Santoso", role: "Project Manager, PT Bukit Asam", content: "Kerjasama dengan CCM sangat memuaskan. Pengiriman material selalu tepat waktu dan kualitasnya konsisten.", image: "/testi-3.jpg" },
      { name: "Siti Aminah", role: "Procurement Head, PT Waskita", content: "CCM adalah mitra yang handal. Responsif terhadap kebutuhan mendesak dan profesionalisme luar biasa.", image: "/testi-4.jpg" }
    ],
    about: { 
      experience: "8", 
      title: "Tentang PT Chaerunisa Citra Mandiri", 
      desc: "Didirikan pada tahun 2016, CCM adalah perusahaan dinamis yang berfokus pada kepuasan pelanggan, pertumbuhan berkelanjutan, dan tanggung jawab sosial." 
    },
    founders: [
      { name: "Angga Hartata Sadiputra", role: "Komisaris", avatar: "/direksi-1.png" },
      { name: "Liska Ayulia, Amd", role: "Direktur Utama", avatar: "/direksi-2.png" },
      { name: "H. Iwa Gartiwa, SE", role: "Direktur Operasional", avatar: "/direksi-3.png" },
      { name: "Harlin Pirodi", role: "Manajer Projek", avatar: "/direksi-4.png" }
    ],
    projects: [
      { title: "Astra Daihatsu Motor Karawang", category: "Construction", image: "/proyek-1.jpg" },
      { title: "Supply Batu Andesit PT Bukit Asam", category: "Supplier", image: "/proyek-2.jpg" },
      { title: "Perumahan Mutiara Gemilang", category: "Construction", image: "/proyek-3.jpg" }
    ],
    faqs: [
      { q: "Sejak kapan PT CCM beroperasi?", a: "Didirikan pada 19 Juli 2016 di Bandung dan kini fokus melayani wilayah Sumatera Selatan dan sekitarnya." },
      { q: "Apa saja rincian material konstruksi yang disediakan?", a: "Kami menyediakan material SNI seperti Batu Andesit (Splite), Pasir, Besi Beton (KS, KSTY), Semen, dan Wiremesh." },
      { q: "Jenis armada transportasi apa yang tersedia?", a: "Dump Truck Colt Diesel, Tronton Trailer, hingga Lowbed Trailer milik sendiri." },
      { q: "Apakah CCM tersertifikasi?", a: "Ya, kami telah tersertifikasi SNI ISO 9001:2015 untuk Sistem Manajemen Mutu." }
    ],
    const contact = { 
  phone: "0811258995", 
  email: "chaerunisa.citra.mandiri@gmail.com"
};

// Menghilangkan angka 0 di depan dan menambah 62
const waFormatted = `https://wa.me/62${contact.phone.substring(1)}`;
const emailLink = `mailto:${contact.email}`;

console.log(waFormatted); // Hasil: https://wa.me/62811258995
    contact: { 
      phone: "0811258995", <a href={`https://wa.me/62${contact.phone.substring(1)}`} target="_blank">
  0811258995
</a> 
      email: "chaerunisa.citra.mandiri@gmail.com",
      address: "Jl. Perindustrian II Gang Manggis No. 138 Palembang",
      branch: "Jl. Lingkar Terminal Regional No. 24 Muaraenim"
    }
  });

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    document.title = "PT Chaerunisa Citra Mandiri | General Contractor & Supplier";
    const timer = setTimeout(() => setIsLoadingContent(false), 5000);
    const initAuth = async () => {
        try { await signInAnonymously(auth); } catch (err) { console.error("Auth Error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => { unsubscribe(); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), (docSnap) => {
      if (docSnap.exists()) setSiteData(prev => ({ ...prev, ...docSnap.data() }));
      setIsLoadingContent(false);
    }, (error) => setIsLoadingContent(false));
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === siteData.hero.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [siteData.hero.length]);

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
      // 1. Simpan ke Firestore
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'inquiries'), { ...formData, timestamp: serverTimestamp() });
      
      // 2. Kirim ke Google Apps Script (Email/Sheets Integration)
      if (GOOGLE_SCRIPT_URL) {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) { 
      console.error("Submit Error:", error);
      setSubmitStatus('error'); 
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getIcon = (name) => {
    const props = { size: 40 };
    switch(name) {
      case "Building2": return <Building2 {...props} />;
      case "Package": return <Package {...props} />;
      case "Truck": return <Truck {...props} />;
      case "Briefcase": return <Briefcase {...props} />;
      case "Factory": return <Factory {...props} />;
      default: return <HardHat {...props} />;
    }
  };

  if (isLoadingContent) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#1a202c] text-white font-black uppercase">
        <Loader2 className="animate-spin text-[#0000ff] mb-4" size={48} />
        <p className="tracking-[0.3em]">PT CCM LOADING...</p>
    </div>
  );

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
        </div>
      )}

      {/* Floating WA */}
      {/* Floating WA dengan Hover Text */}
<a 
  href={`https://wa.me/${siteData.contact.phone.replace(/\D/g,'')}`} 
  target="_blank" 
  rel="noopener noreferrer" 
  className="fixed bottom-6 right-6 z-[60] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all animate-bounce flex items-center justify-center border-4 border-white shadow-green-500/20 group"
>
  <MessageCircle size={32} />
  
  {/* Tooltip Label yang muncul saat hover */}
  <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl border border-white/10">
    Chat dengan admin kami
    {/* Segitiga Panah kecil */}
    <span className="absolute top-1/2 -translate-y-1/2 left-full w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-slate-900"></span>
  </span>
</a>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 px-6 py-3 transition-all duration-500 ${scrolled ? 'bg-[#1a202c]/95 shadow-2xl backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-12 w-12 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 bg-transparent">
                <img 
                  src={iconPath} 
                  alt="Icon CCM" 
                  className="h-full w-full object-contain block" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }} 
                />
                <div style={{display: 'none'}} className="h-full w-full items-center justify-center text-[#0000ff] font-black text-xl">M</div>
            </div>
            <div className="flex flex-col">
                <span className="text-[12px] font-black text-white leading-none uppercase tracking-tighter">
  PT CHAERUNISA CITRA{" "}
  <span className="text-[#0000ff]">MANDIRI</span>
</span>

            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-300">
            {['home', 'services', 'testimonials', 'about', 'projects', 'faq'].map((item) => (
                <a key={item} href={`#${item}`} className="hover:text-[#0000ff] transition-colors">{item}</a>
            ))}
            <a href="#contact" className="bg-[#0000ff] text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg text-[10px] active:scale-95 uppercase font-bold">Hubungi Kami</a>
          </div>
          <button className="md:hidden text-white" aria-label="Menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
        </div>
      </nav>
      {/* OVERLAY */}
<div
  className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 ${
    isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
  }`}
  onClick={() => setIsMenuOpen(false)}
></div>

{/* SIDEBAR */}
<div
  className={`fixed top-0 right-0 h-full w-[75%] max-w-[300px] bg-[#0f172a] z-50 transform transition-all duration-300 ease-in-out ${
    isMenuOpen ? "translate-x-0" : "translate-x-full"
  }`}
>
  {/* HEADER */}
  <div className="flex items-center justify-between p-5 border-b border-white/10">
    <span className="text-white font-bold">MENU</span>
    <button onClick={() => setIsMenuOpen(false)}>
      <X size={26} className="text-white" />
    </button>
  </div>

  {/* MENU */}
  <div className="flex flex-col p-5 space-y-4">
    {['home', 'services', 'testimonials', 'about', 'projects', 'faq'].map((item) => (
      <a
        key={item}
        href={`#${item}`}
        onClick={() => setIsMenuOpen(false)}
        className="text-white text-sm font-semibold uppercase tracking-wider hover:text-[#0000ff] transition"
      >
        {item}
      </a>
    ))}

    <a
      href="#contact"
      onClick={() => setIsMenuOpen(false)}
      className="mt-4 bg-[#0000ff] text-white text-center py-3 rounded-xl font-bold"
    >
      Hubungi Kami
    </a>
  </div>
</div>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center pt-20 overflow-hidden bg-slate-900">
        {siteData.hero.map((slide, index) => (
          <div key={index} className={`absolute inset-0 z-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <img src={slide.image} className="w-full h-full object-cover scale-110" alt="Construction" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a202c] via-[#1a202c]/80 to-transparent"></div>
          </div>
        ))}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-4xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full mb-8 text-[#0000ff] font-black text-[10px] uppercase tracking-[0.2em]">
                <Zap size={14} /> {siteData.hero[currentSlide]?.tag}
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.1] mb-8 drop-shadow-2xl">
                {siteData.hero[currentSlide]?.title}
            </h1>
            <p className="text-gray-300 text-xl max-w-2xl mb-12 leading-relaxed font-medium opacity-90">{siteData.hero[currentSlide]?.desc}</p>
            <div className="flex flex-wrap gap-4">
                <a href="#contact" className="bg-[#0000ff] text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all inline-flex items-center gap-3 shadow-2xl active:scale-95">Mulai Sekarang <ChevronRight /></a>
                <a href={siteData.comproUrl} target="_blank" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-xl hover:bg-white/20 transition-all inline-flex items-center gap-3">
                    <FileDown size={24} /> Download PDF
                </a>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Client Slider */}
      <div className="bg-slate-50 py-16 border-y border-slate-200 overflow-hidden relative">
          <div className="flex relative whitespace-nowrap animate-infinite-scroll">
                {[...siteData.clients, ...siteData.clients].map((client, i) => (
                    <div key={i} className="inline-flex items-center gap-4 px-12 py-6 bg-white mx-4 rounded-2xl shadow-sm border border-slate-100 group">
                        <div className="w-12 h-12 flex items-center justify-center transition-colors">
                            {client.icon}
                        </div>
                        <span className="font-black text-slate-700 uppercase tracking-tighter text-sm whitespace-nowrap">
                            {client.name}
                        </span>
                    </div>
                ))}
          </div>
      </div>

      {/* Achievements / Progress Section */}
      <section className="py-24 bg-white">
          <RevealSection className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  {siteData.stats.map((stat, i) => (
                      <div key={i} className="text-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:bg-[#0000ff] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:rotate-12 transition-transform">
                              {stat.icon}
                          </div>
                          <h4 className="text-5xl font-black mb-2 group-hover:text-white transition-colors">{stat.value}</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-100 transition-colors">{stat.label}</p>
                      </div>
                  ))}
              </div>
          </RevealSection>
      </section>

      {/* Why Choose Us (Benefits) */}
      <section className="py-32 bg-[#1a202c] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px]"></div>
          <RevealSection className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row gap-16 items-center">
                  <div className="lg:w-1/2">
                      <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4">Keunggulan Strategis</h3>
                      <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Standar Tinggi, Hasil Presisi.</h2>
                      <div className="space-y-6">
                          {siteData.benefits.map((b, i) => (
                              <div key={i} className="flex gap-6 p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-[#0000ff]/30 transition-all group">
                                  <div className="w-12 h-12 rounded-2xl bg-[#0000ff]/20 flex items-center justify-center text-[#0000ff] shrink-0 group-hover:bg-[#0000ff] group-hover:text-white transition-all"><TrendingUp size={24}/></div>
                                  <div>
                                      <h4 className="text-white font-bold text-xl mb-2">{b.title}</h4>
                                      <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                      <div className="space-y-4 translate-y-8">
                        <img src="/benefit-1.jpg" className="rounded-[2rem] shadow-2xl border-4 border-[#0000ff]/20" alt="Work 1" />
                        <img src="/benefit-2.jpg" className="rounded-[2rem] shadow-2xl border-4 border-[#0000ff]/20" alt="Work 2" />
                      </div>
                      <div className="space-y-4">
                        <img src="/benefit-3.jpg" className="rounded-[2rem] shadow-2xl border-4 border-[#0000ff]/20" alt="Work 3" />
                        <img src="/benefit-2.jpg" className="rounded-[2rem] shadow-2xl border-4 border-[#0000ff]/20" alt="Work 4" />
                      </div>
                  </div>
              </div>
          </RevealSection>
      </section>

      {/* Services Grid */}
      <section id="services" className="bg-slate-50 py-32 px-6 relative overflow-hidden">
        <RevealSection className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4">Solusi Terintegrasi</h3>
            <h2 className="text-5xl font-black text-slate-900">Layanan Utama</h2>
            <div className="w-24 h-2 bg-[#0000ff] mx-auto mt-6 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {siteData.services.map((s, i) => (
              <div key={i} className="group p-10 bg-white rounded-[2.5rem] hover:bg-[#0000ff] transition-all duration-500 border border-slate-100 shadow-xl flex flex-col h-full">
                <div className="text-[#0000ff] group-hover:text-white mb-8 transition-colors p-4 bg-slate-50 w-fit rounded-2xl group-hover:bg-white/10">
                  {getIcon(s.icon)}
                </div>
                <h4 className="text-2xl font-black text-slate-900 group-hover:text-white mb-4">{s.title}</h4>
                <p className="text-slate-500 group-hover:text-blue-50 text-sm leading-relaxed mb-8 flex-grow">{s.desc}</p>
                <div className="flex items-center gap-2 text-xs font-black text-[#0000ff] group-hover:text-white uppercase tracking-widest mt-auto cursor-pointer">
                    Selengkapnya <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 bg-white px-6">
          <RevealSection className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                  <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4">Suara Mitra</h3>
                  <h2 className="text-5xl font-black">Testimoni Klien</h2>
                  <div className="w-24 h-2 bg-[#0000ff] mx-auto mt-6 rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {siteData.testimonials.map((t, i) => (
                      <div key={i} className="bg-slate-50 p-10 rounded-[3rem] relative border border-slate-100 hover:border-[#0000ff]/30 transition-all group h-full">
                          <div className="absolute -top-6 left-12 w-12 h-12 bg-[#0000ff] rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg">"</div>
                          <p className="text-slate-600 italic text-lg mb-8 leading-relaxed">"{t.content}"</p>
                          <div className="flex items-center gap-4 mt-auto">
                              <img src={t.image} className="w-14 h-14 rounded-full object-cover border-2 border-[#0000ff]" alt={t.name} />
                              <div>
                                  <h5 className="font-bold text-slate-900">{t.name}</h5>
                                  <p className="text-xs text-slate-400 font-bold uppercase">{t.role}</p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </RevealSection>
      </section>

      {/* Founders Section (Direksi) */}
      <section className="py-32 px-6 bg-slate-50 overflow-hidden">
        <RevealSection className="max-w-7xl mx-auto text-center">
          <div className="mb-20">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4">Leadership</h3>
            <h2 className="text-5xl font-black text-slate-900">Para Pendiri & Direksi</h2>
            <div className="w-24 h-2 bg-[#0000ff] mx-auto mt-6 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {siteData.founders.map((f, i) => (
              <div key={i} className="group relative rounded-[2.5rem] overflow-hidden shadow-xl aspect-[3/4] bg-white">
                <img src={f.avatar} alt={f.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8 text-left translate-y-4 group-hover:translate-y-0 transition-transform">
                  <p className="text-[#0000ff] text-[10px] font-black uppercase tracking-widest mb-1">{f.role}</p>
                  <h4 className="text-white font-black text-lg leading-tight">{f.name}</h4>
                  <div className="h-1 w-0 bg-[#0000ff] mt-4 group-hover:w-full transition-all duration-700"></div>
                </div>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 bg-white relative overflow-hidden">
        <RevealSection className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2 relative group">
              <div className="relative rounded-[3rem] overflow-hidden shadow-3xl aspect-[4/3] border-8 border-white bg-slate-200">
                <img 
                  src={aboutPath} 
                  alt="CCM About Photo" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1503387762-592be5a52680?q=80&w=800"; 
                  }}
                />
              </div>
              <div className="absolute -bottom-10 right-0 sm:right-10 bg-white p-10 rounded-[2rem] shadow-2xl border-b-[10px] border-[#0000ff] animate-float z-10 text-center min-w-[240px]">
                <span className="text-7xl font-black">{siteData.about.experience}<span className="text-[#0000ff]">+</span></span>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Tahun Melayani</p>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-8">
              <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.4em] text-xs">Visi & Misi</h3>
              <h2 className="text-4xl md:text-6xl font-black leading-[1.1]">{siteData.about.title}</h2>
              <p className="text-slate-500 text-xl leading-relaxed font-medium">{siteData.about.desc}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 font-bold text-slate-800">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl shadow-sm hover:bg-blue-50 transition-colors"><CheckCircle2 className="text-[#0000ff]" /> Keunggulan Kualitas</div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl shadow-sm hover:bg-blue-50 transition-colors"><CheckCircle2 className="text-[#0000ff]" /> Solusi Inovatif</div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl shadow-sm hover:bg-blue-50 transition-colors"><CheckCircle2 className="text-[#0000ff]" /> Keberlanjutan</div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl shadow-sm hover:bg-blue-50 transition-colors"><CheckCircle2 className="text-[#0000ff]" /> Keandalan</div>
              </div>
              <div className="pt-8">
                  <a href={siteData.comproUrl} target="_blank" download className="inline-flex items-center gap-4 bg-[#1a202c] text-white px-10 py-5 rounded-[2rem] font-black hover:bg-slate-800 transition-all shadow-xl hover:-translate-y-1">
                      <FileDown size={24} /> Unduh Company Profile PDF
                  </a>
              </div>
            </div>
        </RevealSection>
      </section>

      {/* Projects Gallery */}
      <section id="projects" className="py-32 px-6 bg-[#1a202c]">
        <RevealSection className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.2em] text-xs mb-4">Portfolio</h3>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-10">Hasil Kerja Kami</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {['All', 'Construction', 'Supplier', 'Infrastructure'].map((filter) => (
                <button key={filter} onClick={() => setProjectFilter(filter)} className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${projectFilter === filter ? 'bg-[#0000ff] border-[#0000ff] text-white shadow-xl shadow-blue-600/20' : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30'}`}>{filter}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((p, i) => (
              <div key={i} className="group relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl bg-[#2d3748]">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a202c] via-[#1a202c]/20 to-transparent flex flex-col justify-end p-8">
                  <span className="text-[#0000ff] text-[10px] font-black uppercase tracking-[0.3em] mb-3">{p.category}</span>
                  <h4 className="text-white font-bold text-2xl leading-tight mb-2 group-hover:text-[#0000ff] transition-colors">{p.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6 bg-slate-50 border-t border-slate-200">
        <RevealSection className="max-w-3xl mx-auto space-y-12">
          <div className="text-center">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4">Tanya Jawab</h3>
            <h2 className="text-4xl font-black text-slate-900">Pertanyaan Umum</h2>
          </div>
          <div className="space-y-4">
            {siteData.faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between p-8 text-left group">
                  <span className={`font-black text-lg pr-8 transition-colors ${activeFaq === i ? 'text-[#0000ff]' : 'text-slate-800 group-hover:text-[#0000ff]'}`}>{faq.q}</span>
                  <div className={`p-2 rounded-full transition-all flex-shrink-0 ${activeFaq === i ? 'bg-[#0000ff] text-white rotate-180' : 'bg-slate-50 text-[#0000ff]'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeFaq === i ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-8 pb-8 text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-6">
                        {faq.a}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 bg-[#1a202c]">
        <RevealSection className="max-w-7xl mx-auto flex flex-col lg:flex-row rounded-[4rem] overflow-hidden bg-white shadow-3xl">
                <div className="lg:w-1/2 p-12 lg:p-24 bg-[#0000ff] text-white space-y-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/5 blur-3xl rounded-full translate-x-[-50%]"></div>
                    <div className="relative z-10">
                        <h2 className="text-5xl font-black mb-8 leading-tight">Mulai Proyek <br/>Bersama Kami</h2>
                        <div className="space-y-10">
                            <div className="flex gap-6 items-center group">
                              <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center shadow-2xl transition-all hover:bg-white hover:text-[#0000ff]"><Phone size={32}/></div>
                              <div><p className="text-xs opacity-60 uppercase tracking-widest font-black mb-1">WhatsApp</p><p className="text-2xl font-bold">{siteData.contact.phone}</p></div>
                            </div>
                            <div className="flex gap-6 items-center group">
                              <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center shadow-2xl transition-all hover:bg-white hover:text-[#0000ff]"><Mail size={32}/></div>
                              <div><p className="text-xs opacity-60 uppercase tracking-widest font-black mb-1">Email</p><p className="text-base font-bold">{siteData.contact.email}</p></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/2 p-12 lg:p-24">
                    <form className="space-y-6" onSubmit={handleFormSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold focus:border-[#0000ff] transition-all text-sm" placeholder="Nama" />
                            <input required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold focus:border-[#0000ff] transition-all text-sm" placeholder="Email" />
                        </div>
                        <input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold focus:border-[#0000ff] transition-all text-sm" placeholder="WhatsApp" />
                        <textarea required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 h-32 outline-none font-bold resize-none focus:border-[#0000ff] transition-all text-sm" placeholder="Tuliskan kebutuhan Anda..."></textarea>
                        <button disabled={submitStatus === 'loading'} type="submit" className="w-full bg-[#0000ff] text-white font-black py-6 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-xl text-xl active:scale-95">
                          {submitStatus === 'loading' ? <Loader2 className="animate-spin" /> : <><Send size={24} /> Kirim Pesan</>}
                        </button>
                        {submitStatus === 'success' && <p className="text-green-600 font-bold text-center animate-bounce mt-4">✓ Pesan terkirim! tim kami akan segera menghubungi anda, thx!</p>}
                        {submitStatus === 'error' && <p className="text-red-600 font-bold text-center mt-4">Gagal mengirim pesan. Coba lagi nanti.</p>}
                    </form>
                </div>
        </RevealSection>
      </section>

      {/* Footer Lengkap */}
      <footer className="bg-[#0b0f19] text-gray-400 py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 border-t border-white/5 pt-16">
          <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-8 group cursor-pointer">
                  <div className="h-16 w-16 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 overflow-hidden bg-transparent">
                    <img 
                      src={logoPath} 
                      alt="Logo CCM Footer" 
                      className="h-full w-full object-contain block" 
                      onError={(e) => { e.target.style.display = 'none'; }} 
                    />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-xxl font-black text-white leading-none uppercase tracking-tighter">PT CHAERUNISA CITRA</span>
                      <span className="text-xxl font-black text-[#0000ff] leading-none uppercase tracking-tighter">MANDIRI</span>
                  </div>
              </div>
              <p className="text-lg font-medium leading-relaxed max-w-sm mb-8 opacity-70">Membangun masa depan dengan standar teknik tinggi, integritas terpercaya, dan solusi inovatif.</p>
              <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#0000ff] cursor-pointer transition-all border border-white/10 shadow-lg group"><InstagramIcon /></div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#0000ff] cursor-pointer transition-all border border-white/10 shadow-lg group"><LinkedinIcon /></div>
              </div>
          </div>
          
          <div>
            <h4 className="text-white font-black uppercase tracking-widest mb-8 text-xs text-[#0000ff]">Lokasi Operasional</h4>
            <div className="space-y-6 text-xs leading-relaxed">
              <div className="flex gap-3">
                  <MapPin className="text-[#0000ff] shrink-0" size={16} />
                  <p><strong>Palembang (HQ):</strong><br/>{siteData.contact.address}</p>
              </div>
              <div className="flex gap-3">
                  <MapPin className="text-[#0000ff] shrink-0" size={16} />
                  <p><strong>Muaraenim (Branch):</strong><br/>{siteData.contact.branch}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-widest mb-8 text-xs text-[#0000ff]">Akses Cepat</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
                <li><a href="#home" className="hover:text-[#0000ff] transition-colors flex items-center gap-2"><ChevronRight size={12}/> Beranda</a></li>
                <li><a href="#projects" className="hover:text-[#0000ff] transition-colors flex items-center gap-2"><ChevronRight size={12}/> Portfolio</a></li>
                <li><a href={siteData.comproUrl} target="_blank" className="hover:text-[#0000ff] transition-colors flex items-center gap-2 text-[#0000ff] underline underline-offset-4 font-black">Download Compro PDF</a></li>
                <li><a href="#contact" className="hover:text-[#0000ff] transition-colors flex items-center gap-2"><ChevronRight size={12}/> Hubungi Kami</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 mt-16">
          <p className="text-[10px] uppercase font-black tracking-[0.5em] opacity-30 text-center md:text-left">© 2024 PT CHAERUNISA CITRA MANDIRI. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest opacity-30">
              <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes infiniteScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float { animation: float 6s ease-in-out infinite alternate; }
        .animate-infinite-scroll { animation: infiniteScroll 40s linear infinite; }
        .shadow-3xl { box-shadow: 0 50px 100px -20px rgba(0,0,0,0.6); }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
