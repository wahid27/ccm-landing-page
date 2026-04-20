import React, { useState, useEffect, useRef } from 'react';
import { 
  HardHat, Truck, Package, Home, Building2, Ruler, 
  ShieldCheck, Award, Clock, Star, ChevronRight, 
  Phone, Mail, MapPin, Search, Menu, X, Users, 
  Lightbulb, CheckCircle2, MessageCircle, ChevronDown,
  Scale, Zap, ChevronLeft, Quote, Loader2, Send, Settings, Save, 
  ImageIcon, Plus, Trash2, Briefcase, Factory, ExternalLink, Linkedin, Instagram, FileDown
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
  
  const logoPath = "/LOGO PT CHAERUNISA CITRA MANDIRI.png";

  const [siteData, setSiteData] = useState({
    hero: [
      { 
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=1600", 
        tag: "General Contractor, Supplier & Transporter", 
        title: "Solusi Konstruksi Terintegrasi & Terpercaya", 
        desc: "Menghadirkan layanan profesional, cepat, dan terpercaya untuk mendukung kebutuhan proyek skala kecil hingga besar." 
      },
      { 
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1600", 
        tag: "Kualitas & Ketepatan Waktu", 
        title: "Membangun Fondasi Masa Depan yang Kokoh", 
        desc: "Berfokus pada efisiensi biaya dan standar tinggi untuk memberikan nilai terbaik bagi setiap klien." 
      }
    ],
    comproUrl: "#", 
    clients: [
      { name: "PT Bukit Asam, Tbk", icon: <Building2 className="text-orange-500" /> },
      { name: "PT PLN (Persero)", icon: <Zap className="text-blue-500" /> },
      { name: "PT Adhi Karya, Tbk", icon: <Building2 className="text-red-600" /> },
      { name: "PT PP (Persero), Tbk", icon: <HardHat className="text-blue-600" /> },
      { name: "PT Waskita Karya", icon: <Building2 className="text-blue-800" /> },
      { name: "PT Acset Indonusa", icon: <ShieldCheck className="text-blue-400" /> },
      { name: "PT Circle K Indonesia", icon: <Star className="text-red-500" /> },
      { name: "PT Garba Buana Perkasa", icon: <Factory className="text-slate-600" /> },
      { name: "PT Tureloto Battu Indah", icon: <Truck className="text-green-600" /> },
      { name: "Astra Daihatsu Motor", icon: <Briefcase className="text-red-700" /> },
      { name: "Adaro Energy (MIP)", icon: <Zap className="text-yellow-600" /> }
    ],
    services: [
      { title: "Konstruksi Umum", desc: "Pembangunan gedung, infrastruktur sipil (jalan, jembatan), proyek perumahan, hingga mekanikal & elektrikal.", icon: "Building2" },
      { title: "Supplier Material", desc: "Penyedia batu andesit, pasir, besi beton SNI, semen, dan material industri berkualitas tinggi.", icon: "Package" },
      { title: "Transportasi & Logistik", desc: "Layanan pengangkutan material menggunakan armada Dump Truck, Tronton, hingga Lowbed trailer.", icon: "Truck" },
      { title: "Pengadaan Barang & Jasa", desc: "Solusi sourcing handal untuk berbagai kebutuhan operasional perusahaan dan instansi.", icon: "Briefcase" },
      { title: "Konveksi Kreatif", desc: "Produksi pakaian berkualitas tinggi dengan desain inovatif untuk seragam dan kebutuhan pasar.", icon: "Factory" }
    ],
    about: { 
      experience: "8", 
      title: "Tentang PT Chaerunisa Citra Mandiri", 
      desc: "Didirikan pada tahun 2016, CCM adalah perusahaan dinamis yang berfokus pada kepuasan pelanggan dan tanggung jawab sosial. Kami berkomitmen memberikan kontribusi positif bagi pertumbuhan ekonomi melalui inovasi berkelanjutan." 
    },
    founders: [
      { name: "Angga Hartata Sadiputra", role: "Komisaris", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200" },
      { name: "Liska Ayulia, Amd, SP., M.Si", role: "Direktur Utama", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200" },
      { name: "H. Iwa Gartiwa, SE", role: "Direktur Operasional", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200" },
      { name: "H. Harlin Pirodi", role: "Manajer Projek", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200" }
    ],
    projects: [
      { title: "Astra Daihatsu Motor Karawang", category: "Construction", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600" },
      { title: "Supply Batu Andesit PT Bukit Asam", category: "Supplier", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600" },
      { title: "Perumahan Mutiara Gemilang", category: "Construction", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600" }
    ],
    // FAQ Terbaru berdasarkan PDF Company Profile
    faqs: [
      { q: "Sejak kapan PT Chaerunisa Citra Mandiri beroperasi?", a: "Perusahaan kami didirikan secara resmi pada tanggal 19 Juli 2016 di Bandung dan kini memiliki jaringan operasional yang luas khususnya di wilayah Sumatera Selatan." },
      { q: "Apa saja rincian material konstruksi yang disediakan CCM?", a: "Kami menyediakan berbagai material SNI berkualitas tinggi seperti Batu Andesit (Splite) segala ukuran, Pasir & Agregat, Besi Beton (KS, KSTY, KSSG, DBS, KSTI), Semen, Wiremesh, hingga pipa industri." },
      { q: "Jenis armada apa saja yang tersedia untuk jasa logistik CCM?", a: "Kami didukung oleh armada milik sendiri yang meliputi Dump Truck Colt Diesel, Tronton Trailer, hingga Lowbed Trailer untuk pengangkutan alat berat dan material proyek secara cepat dan aman." },
      { q: "Apakah PT CCM memiliki sertifikasi manajemen mutu resmi?", a: "Ya, kami telah tersertifikasi SNI ISO 9001:2015 (Quality Management System) yang memastikan setiap layanan konstruksi dan pengadaan kami memenuhi standar internasional." },
      { q: "Layanan apa saja yang ditawarkan selain konstruksi umum?", a: "Selain konstruksi dan supplier, kami juga bergerak di bidang Konveksi Kreatif (produksi seragam & pakaian berkualitas), Pengadaan Barang/Jasa perusahaan, serta memiliki unit Jasa Keuangan/Koperasi." },
      { q: "Bagaimana jangkauan wilayah layanan proyek CCM?", a: "Fokus utama layanan kami adalah di wilayah Sumatera Selatan (Kantor Pusat Palembang & Cabang Muaraenim), namun kami juga menangani proyek strategis di Pulau Jawa seperti di Karawang." },
      { q: "Bagaimana cara mendapatkan penawaran harga untuk material atau proyek?", a: "Anda dapat langsung menghubungi tim marketing kami melalui tombol WhatsApp yang tersedia atau mengirim email resmi untuk mendapatkan konsultasi dan penawaran kompetitif." }
    ],
    contact: { 
      phone: "0811258995", 
      email: "chaerunisa.citra.mandiri@gmail.com",
      address: "Jl. Perindustrian II Gang Manggis No. 138 Kota Palembang, Sum-Sel",
      branch: "Jl. Lingkar Terminal Regional No. 24 Kota Muaraenim, Sum-Sel"
    }
  });

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    document.title = "PT Chaerunisa Citra Mandiri | General Contractor & Supplier";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get('edit') === 'true') setIsAdminMode(true);
    }
    const initAuth = async () => {
        try { await signInAnonymously(auth); } catch (err) { console.error("Auth Error:", err); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), (docSnap) => {
      if (docSnap.exists()) setSiteData(prev => ({ ...prev, ...docSnap.data() }));
      setIsLoadingContent(false);
    }, (error) => {
        console.error("Firestore Error:", error);
        setIsLoadingContent(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (siteData.hero.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === siteData.hero.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
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
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'inquiries'), { ...formData, timestamp: serverTimestamp() });
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
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#1a202c] text-white font-black">
        <Loader2 className="animate-spin text-[#0000ff] mb-4" size={48} />
        <p className="tracking-[0.3em]">CCM LOADING...</p>
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
            {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />} Simpan
          </button>
        </div>
      )}

      {/* Floating WA */}
      <a href={`https://wa.me/${siteData.contact.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-[60] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all animate-bounce flex items-center justify-center border-4 border-white"><MessageCircle size={32} /></a>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 px-6 py-3 transition-all duration-500 ${scrolled ? 'bg-[#1a202c]/95 shadow-2xl backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl shadow-lg">
                <img src={logoPath} alt="Logo PT CCM" className="h-10 w-auto object-contain" onError={(e) => e.target.style.display='none'} />
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-black text-white leading-none uppercase tracking-tighter">PT CHAERUNISA CITRA</span>
                <span className="text-xs font-black text-[#0000ff] leading-none uppercase tracking-tighter">MANDIRI</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-300">
            {['home', 'services', 'about', 'projects', 'faq'].map((item) => (
                <a key={item} href={`#${item}`} className="hover:text-[#0000ff] transition-colors">{item}</a>
            ))}
            <a href="#contact" className="bg-[#0000ff] text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg">Hubungi Kami</a>
          </div>
          <button className="md:hidden text-white" aria-label="Menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center pt-20 overflow-hidden bg-slate-900">
        {siteData.hero.map((slide, index) => (
          <div key={index} className={`absolute inset-0 z-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <img src={slide.image} className="w-full h-full object-cover scale-110" alt="Construction Background" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a202c] via-[#1a202c]/80 to-transparent"></div>
          </div>
        ))}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-4xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full mb-8 text-[#0000ff] font-black text-[10px] uppercase tracking-[0.2em]">
                <Zap size={14} /> {siteData.hero[currentSlide].tag}
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.1] mb-8 drop-shadow-2xl">
                {siteData.hero[currentSlide].title.split(' ').map((word, i) => (
                    <span key={i} className={i === 1 ? "text-[#0000ff]" : ""}>{word} </span>
                ))}
            </h1>
            <p className="text-gray-300 text-xl max-w-2xl mb-12 leading-relaxed font-medium">{siteData.hero[currentSlide].desc}</p>
            <div className="flex flex-wrap gap-4">
                <a href="#contact" className="bg-[#0000ff] text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all inline-flex items-center gap-3 shadow-2xl active:scale-95">Konsultasi Gratis <ChevronRight /></a>
                <a href={siteData.comproUrl} target="_blank" rel="noopener noreferrer" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-xl hover:bg-white/20 transition-all inline-flex items-center gap-3">
                    <FileDown size={24} /> Download Compro
                </a>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Client Logo Slider */}
      <div className="bg-slate-50 py-16 border-y border-slate-200 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6 mb-8 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0000ff]">Mitra Terpercaya Kami</h3>
              <div className="h-[2px] w-20 bg-blue-100 rounded-full"></div>
          </div>
          <div className="flex relative">
            <div className="flex whitespace-nowrap animate-infinite-scroll">
                {[...siteData.clients, ...siteData.clients].map((client, i) => (
                    <div key={i} className="inline-flex items-center gap-4 px-12 py-6 bg-white mx-4 rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-500 hover:shadow-xl transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center transition-colors group-hover:bg-blue-50">
                            {client.icon}
                        </div>
                        <span className="font-black text-slate-700 uppercase tracking-tighter text-sm whitespace-nowrap">
                            {client.name}
                        </span>
                    </div>
                ))}
            </div>
          </div>
      </div>

      {/* Services Grid */}
      <section id="services" className="bg-[#1a202c] py-32 px-6 relative overflow-hidden">
        <RevealSection className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4">Solusi Terintegrasi</h3>
            <h2 className="text-5xl font-black text-white">Jasa & Pelayanan Utama</h2>
            <div className="w-24 h-2 bg-[#0000ff] mx-auto mt-6 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {siteData.services.map((s, i) => (
              <div key={i} className="group p-10 bg-[#2d3748]/50 rounded-[2.5rem] hover:bg-[#0000ff] transition-all duration-500 border border-white/5 shadow-2xl flex flex-col h-full">
                <div className="text-[#0000ff] group-hover:text-white mb-8 transition-colors p-4 bg-white/5 w-fit rounded-2xl">
                  {getIcon(s.icon)}
                </div>
                <h4 className="text-2xl font-black text-white mb-4">{s.title}</h4>
                <p className="text-gray-400 group-hover:text-blue-50 text-base leading-relaxed mb-8 flex-grow">{s.desc}</p>
                <div className="flex items-center gap-2 text-xs font-black text-[#0000ff] group-hover:text-white uppercase tracking-widest mt-auto cursor-pointer">
                    Selengkapnya <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 bg-slate-50 relative overflow-hidden">
        <RevealSection className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2 relative group">
              <div className="relative rounded-[3rem] overflow-hidden shadow-3xl aspect-[4/3] border-8 border-white">
                <img src={siteData.hero[0].image} alt="CCM Company Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm"><CheckCircle2 className="text-[#0000ff]" /> Keunggulan Kualitas</div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm"><CheckCircle2 className="text-[#0000ff]" /> Solusi Inovatif</div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm"><CheckCircle2 className="text-[#0000ff]" /> Keberlanjutan</div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm"><CheckCircle2 className="text-[#0000ff]" /> Keandalan</div>
              </div>
              <div className="pt-8">
                  <a href={siteData.comproUrl} target="_blank" download="PT-CCM-Company-Profile.pdf" className="inline-flex items-center gap-4 bg-[#1a202c] text-white px-10 py-5 rounded-[2rem] font-black hover:bg-slate-800 transition-all shadow-xl hover:-translate-y-1">
                      <FileDown size={24} /> Unduh Company Profile PDF
                  </a>
              </div>
            </div>
        </RevealSection>
      </section>

      {/* Founders Section */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <RevealSection className="max-w-7xl mx-auto text-center">
          <div className="mb-20">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4">Leadership</h3>
            <h2 className="text-5xl font-black text-slate-900">Para Pendiri & Direksi</h2>
            <div className="w-24 h-2 bg-[#0000ff] mx-auto mt-6 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {siteData.founders.map((f, i) => (
              <div key={i} className="group relative rounded-[2.5rem] overflow-hidden shadow-xl aspect-[3/4] bg-slate-100">
                <img src={f.avatar} alt={f.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 text-left">
                  <p className="text-[#0000ff] text-[10px] font-black uppercase tracking-widest mb-1">{f.role}</p>
                  <h4 className="text-white font-black text-lg leading-tight">{f.name}</h4>
                </div>
              </div>
            ))}
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
                <button key={filter} onClick={() => setProjectFilter(filter)} className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${projectFilter === filter ? 'bg-[#0000ff] border-[#0000ff] text-white shadow-xl' : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30'}`}>{filter}</button>
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

      {/* FAQ Section - Diperbarui dengan data PDF */}
      <section id="faq" className="py-32 px-6 bg-slate-50">
        <RevealSection className="max-w-3xl mx-auto space-y-12">
          <div className="text-center">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4">Tanya Jawab</h3>
            <h2 className="text-4xl font-black text-slate-900">Pertanyaan Umum</h2>
            <p className="text-slate-400 text-sm mt-4">Informasi lengkap mengenai layanan, legalitas, dan operasional CCM.</p>
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

      {/* Contact Form */}
      <section id="contact" className="py-32 px-6 bg-white relative">
        <RevealSection className="max-w-7xl mx-auto">
            <div className="bg-[#1a202c] rounded-[4rem] overflow-hidden shadow-3xl flex flex-col lg:flex-row border border-white/5">
                <div className="lg:w-1/2 p-12 lg:p-24 text-white space-y-12 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">Mulai Proyek <br/><span className="text-[#0000ff]">Anda Hari Ini</span></h2>
                        <div className="space-y-10">
                            <div className="flex gap-6 items-center">
                              <div className="w-16 h-16 rounded-3xl bg-blue-600/20 flex items-center justify-center text-[#0000ff] shadow-2xl transition-all group-hover:bg-[#0000ff] group-hover:text-white"><Phone size={32}/></div>
                              <div><p className="text-xs text-gray-500 uppercase tracking-widest font-black mb-1">Telepon/WA</p><p className="text-2xl font-bold">{siteData.contact.phone}</p></div>
                            </div>
                            <div className="flex gap-6 items-center">
                              <div className="w-16 h-16 rounded-3xl bg-blue-600/20 flex items-center justify-center text-[#0000ff] shadow-2xl transition-all group-hover:bg-[#0000ff] group-hover:text-white"><Mail size={32}/></div>
                              <div><p className="text-xs text-gray-500 uppercase tracking-widest font-black mb-1">Email Resmi</p><p className="text-sm font-bold truncate max-w-[250px]">{siteData.contact.email}</p></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/2 bg-white p-12 lg:p-24">
                    <form className="space-y-6" onSubmit={handleFormSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold focus:border-blue-500 transition-all" placeholder="Nama Lengkap" />
                            <input required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold focus:border-blue-500 transition-all" placeholder="Email" />
                        </div>
                        <input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold focus:border-blue-500 transition-all" placeholder="WhatsApp (08...)" />
                        <textarea required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 h-32 outline-none font-bold resize-none focus:border-blue-500 transition-all" placeholder="Tuliskan kebutuhan proyek Anda..."></textarea>
                        <button disabled={submitStatus === 'loading'} type="submit" className="w-full bg-[#0000ff] text-white font-black py-6 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-xl text-xl active:scale-95 disabled:opacity-50">
                          {submitStatus === 'loading' ? <Loader2 className="animate-spin" /> : <><Send size={24} /> Kirim Pesan</>}
                        </button>
                    </form>
                </div>
            </div>
        </RevealSection>
      </section>

      {/* Footer */}
      <footer className="bg-[#0b0f19] text-gray-400 py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-white p-2 rounded-xl">
                <img src={logoPath} alt="Logo CCM" className="h-10 w-auto" onError={(e) => e.target.style.display='none'} />
              </div>
              <div className="flex flex-col">
                  <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">PT CHAERUNISA CITRA</span>
                  <span className="text-xl font-black text-[#0000ff] tracking-tighter uppercase leading-none">MANDIRI</span>
              </div>
            </div>
            <p className="max-w-md text-lg font-medium leading-relaxed mb-8">Membangun fondasi masa depan dengan standar teknik tinggi, efisiensi biaya, dan integritas terpercaya.</p>
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#0000ff] cursor-pointer transition-all"><Instagram size={20} className="text-white"/></div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#0000ff] cursor-pointer transition-all"><Linkedin size={20} className="text-white"/></div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-[0.2em] mb-8 text-xs">Lokasi Operasional</h4>
            <div className="space-y-6 text-xs leading-relaxed">
              <p className="flex gap-3"><MapPin className="text-[#0000ff] shrink-0" size={16} /> <strong>Palembang (HQ):</strong> {siteData.contact.address}</p>
              <p className="flex gap-3"><MapPin className="text-[#0000ff] shrink-0" size={16} /> <strong>Muaraenim (Branch):</strong> {siteData.contact.branch}</p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-[0.2em] mb-8 text-xs">Akses Cepat</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
                <li><a href="#home" className="hover:text-[#0000ff] transition-colors">Beranda</a></li>
                <li><a href="#projects" className="hover:text-[#0000ff] transition-colors">Portfolio</a></li>
                <li><a href={siteData.comproUrl} target="_blank" className="hover:text-[#0000ff] transition-colors flex items-center gap-2 underline decoration-[#0000ff]">Download Compro PDF</a></li>
                <li><a href="#contact" className="hover:text-[#0000ff] transition-colors">Kontak</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase font-black tracking-[0.5em] opacity-30">© 2024 PT CHAERUNISA CITRA MANDIRI. ALL RIGHTS RESERVED.</p>
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
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-infinite-scroll { animation: infiniteScroll 40s linear infinite; }
        .shadow-3xl { box-shadow: 0 50px 100px -20px rgba(0,0,0,0.6); }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}