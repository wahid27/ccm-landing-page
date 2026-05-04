import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  HardHat, Truck, Package, Building2, 
  ShieldCheck, Award, Star, ChevronRight, 
  Phone, Mail, MapPin, Menu, X, 
  CheckCircle2, MessageCircle, ChevronDown,
  Zap, Loader2, Send, Settings, Save, 
  Briefcase, Factory, FileDown, Users, Target, TrendingUp, Plus, Minus, Navigation
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

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5gUyeidvrwC5XkNk-ENgWo2w8WQyK9XcNG8KnMxu84fUtqLhfl7tLaFCD3mePwrKACA/exec";

// --- CUSTOM SVG ICONS ---

const WhatsAppIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.13.57-.074 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.825 0 00-3.48-8.413z" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

// --- TESTIMONIAL CARD COMPONENT ---
const TestimonialCard = ({ name, role, content, image }) => (
  <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 relative group hover:border-[#0000ff]/30 transition-all duration-500 h-full">
    <div className="absolute -top-6 left-8 w-12 h-12 bg-[#0000ff] rounded-full flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20">"</div>
    <p className="text-slate-600 italic mb-8 mt-4 leading-relaxed group-hover:text-slate-900 transition-colors">"{content}"</p>
    <div className="flex items-center gap-4 mt-auto">
      <img src={image} alt={name} className="w-14 h-14 rounded-full object-cover border-2 border-[#0000ff]/10 group-hover:border-[#0000ff]/40 transition-all" onError={(e) => e.target.src="https://i.pravatar.cc/150?u="+name} />
      <div>
        <h5 className="font-bold text-slate-900 text-sm leading-tight uppercase tracking-wider">{name}</h5>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{role}</p>
      </div>
    </div>
  </div>
);

// --- MAP DISPLAY COMPONENT ---
const MapDisplay = React.memo(({ iframeUrl, address, googleMapsUrl, logoPath }) => {
  return (
    <div className="relative rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-3xl h-[580px] md:h-[650px] border-4 border-white/5 bg-[#0f172a] group">
      <iframe 
        src={iframeUrl}
        width="100%" height="100%" 
        style={{ border: 0, filter: 'grayscale(1) contrast(1.1) invert(0.9) hue-rotate(180deg)' }} 
        allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Map CCM"
      ></iframe>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="relative flex items-center justify-center">
              <div className="absolute w-24 h-24 bg-[#0000ff]/20 rounded-full animate-ping"></div>
              <div className="absolute w-14 h-14 bg-[#0000ff]/30 rounded-full animate-pulse"></div>
              <div className="relative w-12 h-12 bg-white rounded-full p-2 border-4 border-[#0000ff] shadow-2xl flex items-center justify-center">
                  <img src={logoPath} alt="CCM Pin" className="w-full h-full object-contain" />
              </div>
          </div>
      </div>
      <div className="absolute top-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:top-10 md:left-10 p-6 md:p-8 bg-[#1a202c]/95 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl text-white w-[92%] md:max-w-xs transition-all duration-500 z-20">
          <div className="flex items-center gap-3 mb-4 text-white">
              <div className="p-2 bg-[#0000ff] rounded-xl shadow-lg shadow-blue-600/20 text-white"><Building2 size={20}/></div>
              <h4 className="font-black text-sm md:text-lg uppercase tracking-wider">Kantor Pusat</h4>
          </div>
          <p className="text-[10px] text-gray-400 mb-6 leading-relaxed opacity-95 font-medium whitespace-pre-line">{address}</p>
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-[#0000ff] text-white px-6 py-3.5 rounded-2xl font-black text-[10px] hover:bg-blue-700 transition-all uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 w-full text-white">
            <Navigation size={14}/> Navigasi Maps
          </a>
      </div>
    </div>
  );
});

const RevealSection = ({ children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setIsVisible(true); });
    }, { threshold: 0.1 });
    if (domRef.current) observer.observe(domRef.current);
    return () => { if (domRef.current) observer.unobserve(domRef.current); };
  }, []);
  return (
    <div ref={domRef} className={`${className} transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}>
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
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const [activeServiceModal, setActiveServiceModal] = useState(null);
  
  const logoPath = "/logo-ccm.png";
  const iconPath = "/logo-ccm.png";
  const aboutPath = "/about-ccm.jpg";

  const [siteData, setSiteData] = useState({
    hero: [
      { image: "/hero-1.jpg", tag: "General Contractor, Supplier & Transporter", title: "Solusi Konstruksi Terintegrasi & Terpercaya", desc: "Menghadirkan layanan profesional, cepat, dan terpercaya untuk mendukung kebutuhan proyek skala kecil hingga besar." },
      { image: "/hero-2.jpg", tag: "Kualitas & Ketepatan Waktu", title: "Membangun Fondasi Masa Depan yang Kokoh", desc: "Berfokus pada efisiensi biaya dan standar tinggi untuk memberikan nilai terbaik bagi setiap klien." }
    ],
    stats: [
      { label: "Tahun Berdiri", value: "2016", icon: <Award className="text-blue-500" /> },
      { label: "Klien Puas", value: "50+", icon: <Users className="text-green-500" /> },
      { label: "Proyek Selesai", value: "100+", icon: <Target className="text-orange-500" /> },
      { label: "Sertifikasi ISO", value: "9001", icon: <ShieldCheck className="text-blue-600" /> }
    ],
    comproUrl: "https://drive.google.com/file/d/13JaISrgneIDiE0TZb9mRnWtlNUdXFDO3/view?usp=sharing",
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
      { 
        title: "Konstruksi Umum", 
        desc: "Pembangunan gedung, infrastruktur sipil (jalan, jembatan), perumahan, hingga mekanikal & elektrikal.", 
        icon: "Building2",
        longDesc: "Layanan konstruksi kami mencakup perencanaan hingga eksekusi proyek sipil skala besar. Kami mengkhususkan diri pada pembangunan gedung komersial, jembatan bentang panjang, dan infrastruktur jalan tol dengan standar keteknikan tertinggi. Tim ahli kami memastikan penggunaan teknologi beton terbaru dan manajemen proyek yang efisien untuk mencapai hasil yang presisi dan tahan lama."
      },
      { 
        title: "Supplier Material", 
        desc: "Penyedia batu andesit, pasir, besi beton SNI, semen, dan material industri berkualitas tinggi.", 
        icon: "Package",
        longDesc: "Sebagai pemasok material terintegrasi, CCM menjamin ketersediaan bahan konstruksi berkualitas tinggi seperti batu andesit pecah (split), pasir beton, besi beton berstandar SNI (KS, KSTY), semen industri, dan wiremesh. Kami memiliki jaringan tambang dan distributor langsung untuk memberikan harga kompetitif dengan kualitas material yang konsisten bagi proyek strategis nasional."
      },
      { 
        title: "Transportasi & Logistik", 
        desc: "Layanan armada Dump Truck, Tronton, hingga Lowbed trailer untuk angkutan alat berat.", 
        icon: "Truck",
        longDesc: "Dukungan logistik CCM diperkuat oleh armada milik sendiri yang mencakup Dump Truck Colt Diesel untuk medan sempit, Tronton Trailer untuk kapasitas besar, hingga Lowbed Trailer khusus angkutan alat berat. Sistem manajemen armada kami memastikan pengiriman material dan alat berat tepat waktu ke lokasi proyek, didukung oleh operator berpengalaman dan pemeliharaan kendaraan rutin."
      },
      { 
        title: "Konveksi Kreatif", 
        desc: "Produksi pakaian berkualitas tinggi dengan desain inovatif untuk seragam dan pasar industri.", 
        icon: "Factory",
        longDesc: "Unit bisnis konveksi kami melayani kebutuhan seragam kerja industri, wearpack, dan pakaian promosi berkualitas tinggi. Menggunakan bahan kain teknis yang nyaman dan tahan lama, serta teknik jahitan presisi tinggi. Kami berfokus pada desain fungsional yang mendukung produktivitas kerja karyawan di lingkungan konstruksi maupun perkantoran."
      }
    ],
    benefits: [
      { title: "Kualitas Unggul", desc: "Kami memiliki standar kualitas tinggi dan berkomitmen memberikan hasil terbaik di setiap proyek." },
      { title: "Solusi Inovatif", desc: "Kami mengembangkan pendekatan kreatif yang sesuai dengan kebutuhan dan tujuan bisnis Anda." },
      { title: "Keandalan", desc: "Mengutamakan kualitas pelayanan dan ketepatan waktu dalam setiap transaksi dan pengerjaan." }
    ],
    testimonials: [
      { name: "Budi Santoso", role: "Project Manager, PT Bukit Asam", content: "Kerjasama dengan CCM sangat memuaskan. Pengiriman material selalu tepat waktu dan kualitasnya konsisten.", image: "/testi-1.jpg" },
      { name: "Siti Aminah", role: "Procurement Head, PT Waskita", content: "CCM adalah mitra yang handal. Responsif terhadap kebutuhan mendesak dan profesionalisme luar biasa.", image: "/testi-2.jpg" }, 
      { name: "H. Ahmad Fauzi", role: "Site Engineer, PT Adhi Karya", content: "Sangat terbantu dengan armada pengangkutan CCM yang selalu prima dan tepat waktu.", image: "/testi-3.jpg" },
      { name: "Maya Saputri", role: "Purchasing, Circle K", content: "Seragam konveksi dari CCM hasilnya sangat rapi dan bahannya berkualitas tinggi.", image: "/testi-4.jpg" }
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
      { title: "Perumahan Mutiara Gemilang", category: "Construction", image: "/proyek-3.jpg" },
      { title: "Pembangunan Jembatan Regional", category: "Infrastructure", image: "/proyek-4.png" },
      { title: "Gudang Logistik Muaraenim", category: "Construction", image: "/proyek-5.png" },
      { title: "Infrastruktur Jalan Tol Sumsel", category: "Infrastructure", image: "/proyek-6.png" },
      { title: "Supply Besi Beton Proyek PLTU", category: "Supplier", image: "proyek-7.png" },
      { title: "Konveksi Seragam Industri PT BA", category: "Supplier", image: "/proyek-8.png" },
      { title: "Konveksi Seragam Industri PT BA", category: "Supplier", image: "/proyek-8.png" }
    ],
    faqs: [
      { q: "Sejak kapan PT CCM beroperasi?", a: "Didirikan pada 19 Juli 2016 di Bandung dan kini fokus melayani wilayah Sumatera Selatan dan sekitarnya." },
      { q: "Apa saja rincian material konstruksi yang disediakan?", a: "Kami menyediakan material SNI seperti Batu Andesit (Splite), Pasir, Besi Beton (KS, KSTY), Semen, dan Wiremesh." },
      { q: "Jenis armada transportasi apa yang tersedia?", a: "Dump Truck Colt Diesel, Tronton Trailer, hingga Lowbed Trailer milik sendiri." },
      { q: "Apakah CCM tersertifikasi?", a: "Ya, kami telah tersertifikasi SNI ISO 9001:2015 untuk Sistem Manajemen Mutu." },
      { q: "Bagaimana cara melakukan kerja sama proyek dengan CCM?", a: "Anda dapat mengisi formulir kontak di website kami atau langsung menghubungi tim marketing via WhatsApp." },
      { q: "Apakah CCM melayani proyek di luar Sumatera Selatan?", a: "Ya, kami melayani proyek skala nasional tergantung pada kompleksitas dan jangkauan logistik yang dibutuhkan." },
      { q: "Berapa lama rata-rata waktu pengerjaan konstruksi?", a: "Waktu pengerjaan sangat bervariasi tergantung skala proyek, namun kami selalu berkomitmen pada timeline yang disepakati di awal kontrak." },
      { q: "Apakah material yang disediakan memiliki uji laboratorium?", a: "Tentu. Setiap material strategis kami melewati uji kualitas internal dan laboratorium independen untuk memastikan standar SNI." },
      { q: "Apa visi utama PT Chaerunisa Citra Mandiri?", a: "Menjadi perusahaan jasa konstruksi dan supplier terdepan yang mengutamakan kualitas, ketepatan waktu, dan inovasi berkelanjutan." },
      { q: "Apakah CCM memiliki dukungan alat berat sendiri?", a: "Ya, kami memiliki beberapa unit alat berat pendukung serta jaringan kemitraan untuk memenuhi kebutuhan proyek skala besar." },
      { q: "Jenis seragam apa yang diproduksi oleh unit konveksi CCM?", a: "Kami memproduksi Wearpack, seragam kantor, seragam lapangan industri, hingga atribut promosi perusahaan." },
      { q: "Apakah CCM terdaftar sebagai rekanan resmi BUMN?", a: "Ya, kami telah bekerja sama dengan berbagai BUMN seperti PT Bukit Asam (Tbk) dan PT PLN (Persero)." },
      { q: "Apa komitmen CCM terhadap keselamatan kerja (K3)?", a: "Keselamatan adalah prioritas nomor satu. Kami menerapkan standar K3 ketat di setiap lokasi proyek untuk menjamin keamanan seluruh personel." },
      { q: "Bagaimana sistem pembayaran yang berlaku di CCM?", a: "Sistem pembayaran disesuaikan dengan kesepakatan kontrak, biasanya melalui termin bertahap sesuai progres pengerjaan atau pengiriman." },
      { q: "Apakah CCM menerima permintaan suplai material dalam jumlah kecil?", a: "Kami fokus pada suplai menengah hingga besar (B2B), namun tetap terbuka untuk diskusi kebutuhan mitra retail tertentu." }
    ],
    contact: {
      phone: "0811258995",
      email: "ccm@chaerunisa.co.id",
      address: "PT CHAERUNISA CITRA MANDIRI\nJl. Boulevard Komplek Citra Grand City\nOrchard Walk North, B. 08 No. 26\nAlang-Alang Lebar Kota Palembang\nKode Pos 30154 - Provinsi Sumatera Selatan",
      branch: "Jl. Lingkar Terminal Regional No. 24 Muaraenim",
      googleMapsUrl: "https://maps.app.goo.gl/3ZKdLxF3cSMbEAeK7",
      mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.6247493774845!2d104.68593447587747!3d-2.923838939515206!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e3b74004944d185%3A0x6b68e986259f976a!2sPT%20Chaerunisa%20Citra%20Mandiri!5e0!3m2!1sid!2sid!4v1714570000000!5m2!1sid!2sid" 
    }
  });

  const waLink = useMemo(() => `https://wa.me/62${siteData.contact.phone.substring(1)}`, [siteData.contact.phone]);
  const emailLink = useMemo(() => `mailto:${siteData.contact.email}`, [siteData.contact.email]);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    document.title = "PT Chaerunisa Citra Mandiri | General Contractor & Supplier";
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') setIsAdminMode(true);
    const timer = setTimeout(() => setIsLoadingContent(false), 2000);
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (err) {} };
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
    } catch (e) {} finally { setIsSaving(false); }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'inquiries'), { ...formData, timestamp: serverTimestamp() });
      if (GOOGLE_SCRIPT_URL) {
        await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(formData) });
      }
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
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#1a202c] text-white font-black uppercase">
        <Loader2 className="animate-spin text-[#0000ff] mb-4" size={48} />
        <p className="tracking-[0.3em]">PT CCM LOADING...</p>
    </div>
  );

  const filteredProjects = projectFilter === 'All' ? siteData.projects : siteData.projects.filter(p => p.category === projectFilter);
  const displayedProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 6);
  const displayedFaqs = showAllFaqs ? siteData.faqs : siteData.faqs.slice(0, 5);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100 scroll-smooth">
      {/* MODAL LAYANAN DETAIL */}
      {activeServiceModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setActiveServiceModal(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-3xl overflow-hidden animate-fade-in-up">
              <div className="bg-[#0000ff] p-10 flex items-center justify-between text-white">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/20 rounded-2xl">{getIcon(activeServiceModal.icon)}</div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{activeServiceModal.title}</h3>
                  </div>
                  <button onClick={() => setActiveServiceModal(null)} className="p-2 hover:rotate-90 transition-transform"><X size={32}/></button>
              </div>
              <div className="p-10 text-slate-600 leading-relaxed text-lg italic">
                  "{activeServiceModal.longDesc}"
              </div>
              <div className="px-10 pb-10 flex justify-end">
                  <a href="#contact" onClick={() => setActiveServiceModal(null)} className="bg-[#0000ff] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-3">Diskusikan Proyek <ChevronRight size={16}/></a>
              </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {isAdminMode && (
        <div className="fixed top-24 right-6 z-[100] bg-white p-5 rounded-[2rem] shadow-2xl border-2 border-[#0000ff] flex flex-col gap-4 animate-fade-in-up w-72">
          <div className="flex items-center gap-2 text-[#0000ff] font-black text-xs uppercase tracking-widest"><Settings size={16}/> Mode Admin</div>
          <button onClick={saveChanges} disabled={isSaving} className="bg-[#0000ff] text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl active:scale-95 text-white">
            {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />} Simpan
          </button>
        </div>
      )}

      {/* WhatsApp Floating */}
      <a href={waLink} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-[60] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all animate-bounce flex items-center justify-center border-4 border-white group shadow-green-500/20">
        <WhatsAppIcon size={32} />
        <span className="absolute right-full mr-4 bg-slate-900 text-white text-[10px] font-bold px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">Chat WA Admin</span>
      </a>

      {/* Nav */}
      <nav className={`fixed top-0 w-full z-50 px-6 py-3 transition-all duration-500 ${scrolled ? 'bg-[#1a202c]/95 shadow-2xl backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer text-white">
            <img src={iconPath} alt="CCM Icon" className="h-10 w-10 md:h-12 md:w-12 object-contain transition-transform group-hover:scale-110" />
            <div className="flex flex-col">
              <span className="text-[10px] md:text-[12px] font-black leading-none uppercase tracking-tighter">PT CHAERUNISA CITRA <span className="text-[#0000ff]">MANDIRI</span></span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-300">
            {['home', 'services', 'testimonials', 'about', 'projects', 'faq'].map((item) => (
                <a key={item} href={`#${item}`} className="hover:text-[#0000ff] transition-colors uppercase tracking-widest">{item}</a>
            ))}
            <a href="#contact" className="bg-[#0000ff] text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg text-[10px] active:scale-95 uppercase font-bold text-white">Hubungi Kami</a>
          </div>
          <button className="md:hidden text-white" aria-label="Menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
        </div>
      </nav>

      {/* Sidebar Mobile */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setIsMenuOpen(false)}></div>
      <div className={`fixed top-0 right-0 h-full w-[75%] max-w-[300px] bg-[#0f172a] z-50 transform transition-all duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col p-8 space-y-6 text-white font-bold uppercase tracking-widest text-xs">
          <button onClick={() => setIsMenuOpen(false)} className="self-end mb-4 text-white"><X size={32}/></button>
          {['home', 'services', 'testimonials', 'about', 'projects', 'faq'].map((item) => (
            <a key={item} href={`#${item}`} onClick={() => setIsMenuOpen(false)} className="hover:text-[#0000ff] transition-colors">{item}</a>
          ))}
          <a href="#contact" onClick={() => setIsMenuOpen(false)} className="bg-[#0000ff] text-center py-4 rounded-xl text-white">Hubungi Kami</a>
        </div>
      </div>

      {/* Hero */}
      <section id="home" className="relative h-screen flex items-center pt-20 overflow-hidden bg-slate-900 text-white px-6">
        {siteData.hero.map((slide, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <img src={slide.image} className="w-full h-full object-cover scale-110" alt="Construction Hero" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a202c] via-[#1a202c]/80 to-transparent"></div>
          </div>
        ))}
        <div className="relative z-10 max-w-7xl mx-auto w-full animate-fade-in-up">
          <div className="max-w-4xl">
            <div className="inline-flex gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full mb-8 text-[#0000ff] font-black text-[10px] uppercase tracking-widest"><Zap size={14}/> {siteData.hero[currentSlide]?.tag}</div>
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] drop-shadow-2xl">{siteData.hero[currentSlide]?.title}</h1>
            <p className="text-gray-300 text-xl max-w-2xl mb-12 opacity-90 leading-relaxed font-medium">{siteData.hero[currentSlide]?.desc}</p>
            <div className="flex flex-wrap gap-4 text-white">
                <a href="#contact" className="bg-[#0000ff] text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-700 shadow-2xl flex items-center gap-3 active:scale-95 transition-all text-white text-white">Mulai Sekarang <ChevronRight /></a>
                <a href={siteData.comproUrl} target="_blank" rel="noopener noreferrer" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-xl hover:bg-white/20 flex items-center gap-3 text-white"><FileDown size={24} /> Compro PDF</a>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Slider */}
      <section className="bg-slate-50 py-24 border-y border-slate-200 overflow-hidden relative text-slate-900">
          <RevealSection className="max-w-7xl mx-auto px-6 mb-16 text-center text-slate-900">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-[10px] mb-4 text-[#0000ff]">Mitra Strategis & Klien</h3>
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-slate-900">Dipercaya Oleh Berbagai Perusahaan Besar</h2>
            <div className="w-16 h-1.5 bg-[#0000ff] mx-auto rounded-full text-slate-900"></div>
          </RevealSection>
          <div className="flex relative whitespace-nowrap animate-infinite-scroll hover:[animation-play-state:paused]">
                {[...siteData.clients, ...siteData.clients].map((client, i) => (
                    <div key={i} className="inline-flex items-center gap-4 px-12 py-8 bg-white mx-4 rounded-3xl shadow-sm border border-slate-100 group hover:bg-[#0000ff] hover:shadow-2xl transition-all cursor-pointer">
                        <div className="w-14 h-14 flex items-center justify-center transition-all group-hover:text-white text-[#0000ff]">{React.cloneElement(client.icon, { size: 40 })}</div>
                        <span className="font-black text-slate-700 uppercase tracking-tighter text-sm group-hover:text-white transition-colors">{client.name}</span>
                    </div>
                ))}
          </div>
      </section>

      {/* Achievements */}
      <section className="py-24 bg-white text-slate-900 px-6">
          <RevealSection className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-slate-900">
              {siteData.stats.map((stat, i) => (
                  <div key={i} className="text-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:bg-[#0000ff] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:rotate-12 transition-transform">{stat.icon}</div>
                      <h4 className="text-5xl font-black mb-2 group-hover:text-white transition-colors">{stat.value}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-100 transition-colors">{stat.label}</p>
                  </div>
              ))}
          </RevealSection>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 bg-[#1a202c] relative overflow-hidden text-white px-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px]"></div>
          <RevealSection className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center text-white">
              <div className="lg:w-1/2">
                  <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4 uppercase text-[#0000ff]">Keunggulan Strategis</h3>
                  <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Standar Tinggi, Hasil Presisi.</h2>
                  <div className="space-y-6">
                      {siteData.benefits.map((b, i) => (
                          <div key={i} className="flex gap-6 p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-[#0000ff]/30 transition-all group">
                              <div className="w-12 h-12 rounded-2xl bg-[#0000ff]/20 flex items-center justify-center text-[#0000ff] shrink-0 group-hover:bg-[#0000ff] group-hover:text-white transition-all text-[#0000ff]"><TrendingUp size={24}/></div>
                              <div><h4 className="font-bold text-xl mb-2 uppercase tracking-widest">{b.title}</h4><p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p></div>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                  <div className="space-y-4 translate-y-8">
                    <img src="/benefit-1.jpg" className="rounded-[2rem] shadow-2xl border-4 border-[#0000ff]/20 w-full aspect-square object-cover" alt="Work 1" onError={(e) => e.target.src="https://images.unsplash.com/photo-1541913054-225c50406820?q=80&w=400"}/>
                    <img src="/benefit-2.jpg" className="rounded-[2rem] shadow-2xl border-4 border-[#0000ff]/20 w-full aspect-[4/5] object-cover" alt="Work 2" onError={(e) => e.target.src="https://images.unsplash.com/photo-1504307651254-35680f3366d4?q=80&w=400"}/>
                  </div>
                  <div className="space-y-4">
                    <img src="/benefit-3.jpg" className="rounded-[2rem] shadow-2xl border-4 border-[#0000ff]/20 w-full aspect-[4/5] object-cover" alt="Work 3" onError={(e) => e.target.src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=400"}/>
                    <img src="/benefit-4.jpg" className="rounded-[2rem] shadow-2xl border-4 border-[#0000ff]/20 w-full aspect-square object-cover" alt="Work 4" onError={(e) => e.target.src="https://images.unsplash.com/photo-1503387762-592be5a52680?q=80&w=400"}/>
                  </div>
              </div>
          </RevealSection>
      </section>

      {/* Services Grid */}
      <section id="services" className="bg-slate-50 py-32 px-6 text-slate-900">
        <RevealSection className="max-w-7xl mx-auto">
          <div className="text-center mb-20 text-slate-900">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4 text-[#0000ff]">Solusi Terintegrasi</h3>
            <h2 className="text-5xl font-black uppercase text-slate-900">Layanan Utama</h2>
            <div className="w-24 h-2 bg-[#0000ff] mx-auto mt-6 rounded-full text-slate-900"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-slate-900">
            {siteData.services.map((s, i) => (
              <div key={i} className="group p-10 bg-white rounded-[2.5rem] hover:bg-[#0000ff] transition-all border border-slate-100 shadow-xl flex flex-col h-full hover:-translate-y-2 text-slate-900">
                <div className="text-[#0000ff] group-hover:text-white mb-8 p-4 bg-slate-50 w-fit rounded-2xl group-hover:bg-white/10 transition-colors text-[#0000ff]">{getIcon(s.icon)}</div>
                <h4 className="text-2xl font-black group-hover:text-white mb-4 transition-colors uppercase tracking-tighter leading-tight text-slate-900">{s.title}</h4>
                <p className="text-slate-500 group-hover:text-blue-50 text-sm leading-relaxed mb-8 flex-grow">{s.desc}</p>
                <button 
                  onClick={() => setActiveServiceModal(s)}
                  className="flex items-center gap-2 text-xs font-black group-hover:text-white uppercase tracking-widest mt-auto cursor-pointer outline-none active:scale-95 transition-all text-[#0000ff]"
                >
                  Selengkapnya <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* RESTORED: Testimonials Section */}
      <section id="testimonials" className="py-32 bg-white px-6">
        <RevealSection className="max-w-7xl mx-auto text-center text-slate-900">
            <div className="mb-20 text-slate-900">
                <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4 text-[#0000ff]">Suara Mitra</h3>
                <h2 className="text-5xl font-black uppercase text-slate-900">Testimoni Klien</h2>
                <div className="w-24 h-2 bg-[#0000ff] mx-auto mt-6 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {siteData.testimonials.map((t, i) => (
                    <TestimonialCard key={i} {...t} />
                ))}
            </div>
        </RevealSection>
      </section>

      {/* RESTORED: Founders Section */}
      <section className="py-32 px-6 bg-slate-50 overflow-hidden text-slate-900">
        <RevealSection className="max-w-7xl mx-auto text-center">
          <div className="mb-20 text-slate-900">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4 uppercase text-[#0000ff]">Leadership</h3>
            <h2 className="text-5xl font-black uppercase text-slate-900">Para Pendiri & Direksi</h2>
            <div className="w-24 h-2 bg-[#0000ff] mx-auto mt-6 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {siteData.founders.map((f, i) => (
              <div key={i} className="group relative rounded-[2.5rem] overflow-hidden shadow-xl aspect-[3/4] bg-white text-white">
                <img src={f.avatar} alt={f.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" onError={(e) => e.target.src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400"} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8 text-left translate-y-4 group-hover:translate-y-0 transition-transform">
                  <p className="text-[#0000ff] text-[10px] font-black uppercase mb-1 tracking-widest">{f.role}</p>
                  <h4 className="font-black text-lg leading-tight uppercase tracking-widest">{f.name}</h4>
                  <div className="h-1 w-0 bg-[#0000ff] mt-4 group-hover:w-full transition-all duration-700"></div>
                </div>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 bg-white relative overflow-hidden text-slate-900">
        <RevealSection className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2 relative group text-slate-900">
              <div className="rounded-[3rem] overflow-hidden shadow-3xl aspect-[4/3] border-8 border-white bg-slate-200">
                <img src={aboutPath} alt="CCM About" className="w-full h-full object-cover transition-transform group-hover:scale-105" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1503387762-592be5a52680?q=80&w=800"; }} />
              </div>
              <div className="absolute -bottom-10 right-0 sm:right-10 bg-white p-10 rounded-[2rem] shadow-2xl border-b-[10px] border-[#0000ff] text-center min-w-[200px]">
                <span className="text-7xl font-black text-slate-900 leading-none">{siteData.about.experience}<span className="text-[#0000ff]">+</span></span>
                <p className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-[0.3em]">Tahun Melayani</p>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-8 text-slate-900">
              <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.4em] text-xs text-[#0000ff]">Visi & Misi</h3>
              <h2 className="text-4xl md:text-6xl font-black leading-[1.1] uppercase text-slate-900">{siteData.about.title}</h2>
              <p className="text-slate-500 text-xl leading-relaxed opacity-90">{siteData.about.desc}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 font-bold text-slate-800">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl shadow-sm hover:bg-blue-50 transition-colors uppercase tracking-widest text-xs text-slate-900"><CheckCircle2 className="text-[#0000ff]" /> Keunggulan Kualitas</div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl shadow-sm hover:bg-blue-50 transition-colors uppercase tracking-widest text-xs text-slate-900"><CheckCircle2 className="text-[#0000ff]" /> Solusi Inovatif</div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl shadow-sm hover:bg-blue-50 transition-colors uppercase tracking-widest text-xs text-slate-900"><CheckCircle2 className="text-[#0000ff]" /> Keberlanjutan</div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl shadow-sm hover:bg-blue-50 transition-colors uppercase tracking-widest text-xs text-slate-900"><CheckCircle2 className="text-[#0000ff]" /> Keandalan</div>
              </div>
              <div className="pt-8 text-center sm:text-left">
                  <a href={siteData.comproUrl} target="_blank" className="inline-flex items-center gap-4 bg-[#1a202c] text-white px-10 py-5 rounded-[2rem] font-black hover:bg-slate-800 transition-all shadow-xl hover:-translate-y-1 uppercase tracking-widest text-xs text-white">
                      <FileDown size={24} /> Unduh Company Profile PDF
                  </a>
              </div>
            </div>
        </RevealSection>
      </section>

      {/* Projects Gallery */}
      <section id="projects" className="py-32 px-6 bg-[#1a202c] text-white">
        <RevealSection className="max-w-7xl mx-auto">
          <div className="text-center mb-16 text-white">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.2em] text-[10px] mb-4 text-[#0000ff]">Portfolio Unggulan</h3>
            <h2 className="text-4xl md:text-5xl font-black mb-10 text-white uppercase">Hasil Kerja Kami</h2>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {['All', 'Construction', 'Supplier', 'Infrastructure'].map((filter) => (
                <button key={filter} onClick={() => { setProjectFilter(filter); setShowAllProjects(false); }} className={`px-8 py-3 rounded-full font-black text-[10px] uppercase transition-all border-2 ${projectFilter === filter ? 'bg-[#0000ff] border-[#0000ff] text-white shadow-blue-500/30' : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30 text-white'}`}>{filter}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-slate-900">
            {displayedProjects.map((p, i) => (
              <div key={i} className="group relative rounded-[2.5rem] overflow-hidden aspect-[1.1] shadow-2xl bg-[#2d3748] animate-fade-in-up border border-white/5" style={{ animationDelay: `${i * 100}ms` }}>
                <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" onError={(e) => e.target.src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=400"} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a202c] via-[#1a202c]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-8 translate-y-8 group-hover:translate-y-0 transition-all duration-500">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[2rem]">
                    <span className="text-[#0000ff] text-[9px] font-black uppercase tracking-widest mb-2 block text-[#0000ff]">{p.category}</span>
                    <h4 className="text-white font-bold text-lg leading-tight group-hover:text-white transition-colors uppercase tracking-widest text-white">{p.title}</h4>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-white/50 opacity-0 group-hover:opacity-100 transition-opacity text-white uppercase tracking-widest">Lihat Detail <ChevronRight size={12} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredProjects.length > 6 && (
            <div className="mt-20 flex justify-center">
              <button onClick={() => setShowAllProjects(!showAllProjects)} className="group inline-flex items-center gap-4 bg-white text-slate-900 px-14 py-6 rounded-2xl font-black text-xs uppercase hover:bg-[#0000ff] hover:text-white transition-all active:scale-95 shadow-xl text-slate-900">
                {showAllProjects ? <>Tampilkan Sedikit <Minus size={20}/></> : <>Lihat Seluruh Proyek <Plus size={20}/></>}
              </button>
            </div>
          )}
        </RevealSection>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6 bg-white text-slate-900">
        <RevealSection className="max-w-3xl mx-auto space-y-12 text-slate-900">
          <div className="text-center text-slate-900">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-xs mb-4 text-[#0000ff]">Tanya Jawab</h3>
            <h2 className="text-4xl font-black uppercase text-slate-900">Pertanyaan Umum</h2>
          </div>
          <div className="space-y-4 text-slate-900">
            {displayedFaqs.map((faq, i) => (
              <div key={i} className="bg-slate-50 rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md text-slate-900">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between p-8 text-left group text-slate-900">
                  <span className={`font-black text-lg pr-8 transition-colors ${activeFaq === i ? 'text-[#0000ff]' : 'text-slate-800 group-hover:text-[#0000ff] uppercase tracking-widest text-slate-900'}`}>{faq.q}</span>
                  <div className={`p-2 rounded-full transition-all flex-shrink-0 ${activeFaq === i ? 'bg-[#0000ff] text-white rotate-180' : 'bg-white text-[#0000ff] text-[#0000ff]'}`}><ChevronDown size={20} /></div>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeFaq === i ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}><div className="px-8 pb-8 text-slate-500 font-medium leading-relaxed border-t border-slate-200/50 pt-6">{faq.a}</div></div>
              </div>
            ))}
          </div>
          {siteData.faqs.length > 5 && (
            <div className="mt-12 flex justify-center text-slate-900">
              <button 
                onClick={() => setShowAllFaqs(!showAllFaqs)} 
                className="group inline-flex items-center gap-3 text-[#0000ff] font-black uppercase tracking-widest text-xs hover:gap-5 transition-all py-4 px-8 border-2 border-[#0000ff] rounded-2xl hover:bg-[#0000ff] hover:text-white text-[#0000ff]"
              >
                {showAllFaqs ? "Tampilkan Sedikit" : "Lihat Seluruh Pertanyaan FAQ"} 
                {showAllFaqs ? <Minus size={18}/> : <Plus size={18}/>}
              </button>
            </div>
          )}
        </RevealSection>
      </section>

      {/* Map Section */}
      <section className="py-24 px-6 bg-[#1a202c]">
        <RevealSection className="max-w-7xl mx-auto text-white">
          <div className="text-center mb-16 text-white text-slate-900">
            <h3 className="text-[#0000ff] font-bold uppercase tracking-[0.3em] text-[10px] mb-4 text-[#0000ff]">Lokasi Kantor Kami</h3>
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-8 text-white uppercase">Ayo Bangun Masa Depan <br/> Bersama Kami Hari Ini!</h2>
            <div className="w-16 h-1.5 bg-[#0000ff] mx-auto rounded-full text-[#0000ff]"></div>
          </div>
          <MapDisplay 
            iframeUrl={siteData.contact.mapIframe} 
            address={siteData.contact.address} 
            googleMapsUrl={siteData.contact.googleMapsUrl}
            logoPath={logoPath}
          />
        </RevealSection>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-32 px-6 bg-white border-t border-slate-50 text-slate-900">
        <RevealSection className="max-w-7xl mx-auto flex flex-col lg:flex-row rounded-[4rem] overflow-hidden bg-white shadow-3xl border border-slate-100">
            <div className="lg:w-1/2 p-12 lg:p-24 bg-[#0000ff] text-white space-y-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-white/5 blur-3xl rounded-full translate-x-[-50%] text-white"></div>
                <div className="relative z-10 text-white">
                    <h2 className="text-5xl font-black mb-12 leading-tight uppercase text-white">Mulai Proyek <br/>Bersama Kami</h2>
                    <div className="space-y-10 text-white">
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex gap-6 items-center group cursor-pointer hover:bg-white/10 p-4 rounded-3xl transition-all text-white text-white">
                          <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center shadow-2xl group-hover:bg-[#25D366] group-hover:text-white transition-all text-white"><WhatsAppIcon size={32}/></div>
                          <div><p className="text-[10px] opacity-60 uppercase tracking-[0.3em] font-black mb-1 text-white">WhatsApp</p><p className="text-2xl font-bold text-white text-white">{siteData.contact.phone}</p></div>
                        </a>
                        <a href={emailLink} className="flex gap-6 items-center group cursor-pointer hover:bg-white/10 p-4 rounded-3xl transition-all text-white">
                          <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center shadow-2xl group-hover:bg-white group-hover:text-[#0000ff] transition-all text-white"><Mail size={32}/></div>
                          <div><p className="text-[10px] opacity-60 uppercase tracking-[0.3em] font-black mb-1 text-white">Email Bisnis</p><p className="text-base font-bold text-white text-white">{siteData.contact.email}</p></div>
                        </a>
                    </div>
                </div>
            </div>
            <div className="lg:w-1/2 p-12 lg:p-24 text-slate-900">
                <form className="space-y-6" onSubmit={handleFormSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-slate-900">
                        <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold focus:border-[#0000ff] transition-all text-sm text-slate-900" placeholder="Nama Lengkap" />
                        <input required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold focus:border-[#0000ff] transition-all text-sm text-slate-900" placeholder="Email Perusahaan" />
                    </div>
                    <input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold focus:border-[#0000ff] text-sm text-slate-900" placeholder="Nomor WhatsApp (Aktif)" />
                    <textarea required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 h-32 outline-none font-bold resize-none focus:border-[#0000ff] text-sm text-slate-900" placeholder="Tuliskan kebutuhan proyek Anda atau pertanyaan Anda di sini..."></textarea>
                    <button disabled={submitStatus === 'loading'} type="submit" className="w-full bg-[#0000ff] text-white font-black py-6 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-xl text-xl active:scale-95 uppercase tracking-widest text-white text-white">
                      {submitStatus === 'loading' ? <Loader2 className="animate-spin" /> : <><Send size={24} /> Kirim Pesan Sekarang</>}
                    </button>
                    {submitStatus === 'success' && <p className="text-green-600 font-bold text-center animate-bounce mt-4 tracking-widest text-xs uppercase">✓ PESAN BERHASIL DIKIRIM! TIM KAMI AKAN SEGERA MENGHUBUNGI ANDA.</p>}
                </form>
            </div>
        </RevealSection>
      </section>

      {/* Footer */}
      <footer className="bg-[#0b0f19] text-gray-400 py-24 px-6 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 border-t border-white/5 pt-16 text-white">
          <div className="lg:col-span-2 text-white">
              <div className="flex items-center gap-3 mb-8 group cursor-pointer text-white">
                <img src={logoPath} alt="Logo" className="h-16 w-16 object-contain" />
                <div className="flex flex-col text-white">
                  <span className="text-xxl font-black uppercase text-white leading-none text-white">PT CHAERUNISA CITRA</span>
                  <span className="text-xxl font-black text-[#0000ff] uppercase tracking-tighter leading-none text-[#0000ff]">MANDIRI</span>
                </div>
              </div>
              <p className="text-lg font-medium leading-relaxed max-w-sm mb-8 opacity-70 text-white">Membangun masa depan dengan standar teknik tinggi, integritas terpercaya, dan solusi inovatif sejak 2016.</p>
              <div className="flex gap-4 text-white">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#0000ff] cursor-pointer transition-all border border-white/10 group shadow-lg text-white text-white"><InstagramIcon /></div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#0000ff] cursor-pointer transition-all border border-white/10 group shadow-lg text-white text-white"><LinkedinIcon /></div>
              </div>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest mb-8 text-xs text-[#0000ff] tracking-[0.2em] text-white">Lokasi Operasional</h4>
            <div className="space-y-6 text-xs text-white/70">
              <div className="flex gap-3 text-white text-white"><MapPin className="text-[#0000ff] shrink-0" size={16} /><p className="text-white"><strong>Palembang (HQ):</strong><br/>{siteData.contact.address}</p></div>
              <div className="flex gap-3 text-white text-white"><MapPin className="text-[#0000ff] shrink-0" size={16} /><p className="text-white"><strong>Muaraenim (Branch):</strong><br/>{siteData.contact.branch}</p></div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest mb-8 text-xs text-[#0000ff] tracking-[0.2em] text-white">Akses Cepat</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-white text-white">
                <li><a href="#home" className="hover:text-[#0000ff] transition-colors flex items-center gap-2 text-white"><ChevronRight size={12}/> BERANDA</a></li>
                <li><a href="#projects" className="hover:text-[#0000ff] transition-colors flex items-center gap-2 text-white"><ChevronRight size={12}/> PORTFOLIO</a></li>
                <li><a href={siteData.comproUrl} target="_blank" className="text-[#0000ff] underline underline-offset-4 flex items-center gap-2 font-black uppercase text-[#0000ff]">DOWNLOAD COMPRO PDF</a></li>
                <li><a href="#contact" className="hover:text-[#0000ff] transition-colors flex items-center gap-2 text-white"><ChevronRight size={12}/> HUBUNGI KAMI</a></li>
            </ul>
          </div>
        </div>
        <p className="max-w-7xl mx-auto mt-16 text-[10px] uppercase font-black tracking-[0.5em] opacity-30 text-center text-white">© 2026 PT CHAERUNISA CITRA MANDIRI. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-6 justify-center mt-4 text-[10px] uppercase font-black tracking-widest opacity-20 text-white text-white">
          <a href="#" className="text-white text-white">Privacy Policy</a>
          <a href="#" className="text-white text-white">Terms of Service</a>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes infiniteScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float { animation: float 6s ease-in-out infinite alternate; }
        .animate-infinite-scroll { animation: infiniteScroll 40s linear infinite; }
        .animate-infinite-scroll:hover { animation-play-state: paused; }
        .shadow-3xl { box-shadow: 0 50px 100px -20px rgba(0,0,0,0.6); }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
