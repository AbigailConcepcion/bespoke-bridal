import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, Menu, X, Camera, Scissors, Ruler, ChevronRight, Star, Upload, Check, 
  ArrowRight, Instagram, Facebook, Twitter, Calendar, User, MapPin, Sparkles, ZoomIn, 
  Loader2, Trash2, Plus, Minimize2, Maximize2, Info, Mail, Phone, ShieldCheck, Truck,
  Edit2, CalendarDays, LogOut, Globe, Plane, Heart, Smile, CreditCard, Move, Lock, Crown,
  Eye, EyeOff, AlertCircle, Gem, LayoutDashboard, Users, Package
} from 'lucide-react';

// Import from the local firebase file
import { auth, db, googleProvider } from './firebase';

import { 
  signInWithPopup, 
  signInAnonymously, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  onSnapshot, 
  orderBy,
  getDoc,
  where
} from 'firebase/firestore';

// --- ASSETS & CONSTANTS ---

const ASSETS = {
  hero: "https://images.unsplash.com/photo-1596807822089-6c98418880a9?q=80&w=2000&auto=format&fit=crop",
  travel: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1000&auto=format&fit=crop",
  coaching: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop",
  textures: {
    silk: "https://images.unsplash.com/photo-1517260739337-6799d239ce83?q=80&w=400&auto=format&fit=crop",
    lace: "https://images.unsplash.com/photo-1560783087-02c5c5ce5268?q=80&w=400&auto=format&fit=crop",
    mikado: "https://images.unsplash.com/photo-1523567830207-96731740fa71?q=80&w=400&auto=format&fit=crop",
    tulle: "https://images.unsplash.com/photo-1516651029879-5692c435a957?q=80&w=400&auto=format&fit=crop"
  }
};

const DRESS_CATALOG = [
  { id: 1, name: "The Seraphina", price: 3200, style: "Mermaid", fabric: "Silk Crepe", image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=1000", description: "A sculptural masterpiece featuring a dramatic train and hand-draped bodice." },
  { id: 2, name: "The Isabella", price: 4500, style: "Ballgown", fabric: "Chantilly Lace", image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=1000", description: "Timeless romance with layers of tulle and intricate floral appliqués." },
  { id: 3, name: "The Genevieve", price: 2800, style: "A-Line", fabric: "Mikado", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1000", description: "Modern minimalism with a plunging neckline and hidden pockets." },
  { id: 4, name: "The Victoria", price: 5100, style: "Royal", fabric: "Satin & Tulle", image: "https://images.unsplash.com/photo-1546193430-c2d207739ed7?auto=format&fit=crop&q=80&w=1000", description: "Fit for royalty, featuring long sleeves and a cathedral length veil pairing." }
];

const FABRICS = [
  { id: 'silk', name: 'Italian Silk Crepe', priceMod: 0, image: ASSETS.textures.silk },
  { id: 'lace', name: 'French Chantilly Lace', priceMod: 800, image: ASSETS.textures.lace },
  { id: 'mikado', name: 'Structured Mikado', priceMod: 400, image: ASSETS.textures.mikado },
  { id: 'tulle', name: 'Soft English Tulle', priceMod: 200, image: ASSETS.textures.tulle },
];

const SILHOUETTES = [
  { id: 'mermaid', name: 'Mermaid', description: 'Fitted through bodice and hips, flaring at the knee.', baseImage: DRESS_CATALOG[0].image },
  { id: 'ballgown', name: 'Ballgown', description: 'Fitted bodice with a dramatic, full skirt.', baseImage: DRESS_CATALOG[1].image },
  { id: 'aline', name: 'A-Line', description: 'Fitted bodice cascading into a soft A shape.', baseImage: DRESS_CATALOG[2].image },
  { id: 'sheath', name: 'Sheath', description: 'Straight cut that follows the body\'s natural line.', baseImage: DRESS_CATALOG[3].image },
];

const DETAILS = [
  { id: 'sleeves', name: 'Sleeves', options: ['Strapless', 'Cap Sleeve', 'Long Lace', 'Off-Shoulder'] },
  { id: 'neckline', name: 'Neckline', options: ['Sweetheart', 'Plunging V', 'Boat Neck', 'High Neck'] },
  { id: 'train', name: 'Train Length', options: ['Sweep', 'Chapel', 'Cathedral', 'Royal'] },
];

const VIP_DEMO_USER = {
    uid: 'vip-demo-sophia',
    displayName: 'Sophia Sterling',
    email: 'sophia@vipclient.com',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    isDemo: true
};

const ADMIN_DEMO_USER = {
    uid: 'admin-owner-001',
    displayName: 'Eleanor (Owner)',
    email: 'admin@bespokebridal.com',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    isDemo: true,
    isAdmin: true
};

const MOCK_VIP_DATA = {
    membership: { status: 'active', tier: 'Elite', since: '2024-01-15T00:00:00Z' },
    profile: { bust: '34', waist: '26', hips: '36', heightFt: '5', heightIn: '9' },
    orders: [
        { id: 'ord-101', total: 4200, items: [{name: 'Custom Mermaid'}], createdAt: { seconds: 1715000000 }, status: 'Processing' },
        { id: 'ord-100', total: 150, items: [{name: 'Fabric Swatch Kit'}], createdAt: { seconds: 1712000000 }, status: 'Delivered' }
    ]
};

// --- UI COMPONENTS ---

const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
    {toasts.map(toast => (
      <div key={toast.id} className={`pointer-events-auto text-white px-6 py-4 shadow-2xl flex items-center gap-4 animate-[slideIn_0.4s_ease-out] min-w-[300px] border-l-4 ${toast.type === 'error' ? 'bg-red-900 border-red-500' : 'bg-neutral-900 border-[#C5A059]'}`}>
        <div className={`${toast.type === 'error' ? 'bg-red-500' : 'bg-[#C5A059] text-black'} rounded-full p-1`}><Check size={12} strokeWidth={3} /></div>
        <div><h4 className="font-serif text-sm">{toast.title}</h4><p className="text-[10px] text-neutral-300 uppercase tracking-wide">{toast.message}</p></div>
        <button onClick={() => removeToast(toast.id)} className="ml-auto text-white/50 hover:text-white"><X size={14}/></button>
      </div>
    ))}
  </div>
);

const ImageWithFallback = ({ src, alt, className, backupSrc }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [status, setStatus] = useState('loading');
  useEffect(() => { setImgSrc(src); setStatus('loading'); }, [src]);
  return (
    <div className={`relative overflow-hidden bg-neutral-100 ${className}`}>
      {status === 'loading' && <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 z-10"><div className="w-full h-full animate-pulse bg-neutral-200"></div></div>}
      <img src={imgSrc} alt={alt} className={`w-full h-full object-cover transition-all duration-1000 ${status === 'loaded' ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} onLoad={() => setStatus('loaded')} onError={() => { if(imgSrc===src && backupSrc) setImgSrc(backupSrc); else setStatus('error'); }} />
      {status === 'error' && <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400"><Scissors size={20} className="opacity-20"/></div>}
    </div>
  );
};

const Button = ({ children, variant = 'primary', onClick, className = '', icon: Icon, disabled = false, fullWidth = false, type="button" }) => {
  const variants = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-xl",
    outline: "border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white",
    gold: "bg-[#C5A059] text-white hover:bg-[#B08D4A] shadow-md hover:shadow-lg shadow-[#C5A059]/20",
    white: "bg-white text-neutral-900 hover:bg-neutral-50 border border-white shadow-sm",
    premium: "bg-gradient-to-r from-neutral-900 via-[#C5A059] to-neutral-900 text-white border border-[#C5A059] hover:shadow-[0_0_15px_rgba(197,160,89,0.3)]",
    admin: "bg-neutral-800 text-emerald-400 border border-emerald-900/50 hover:bg-neutral-700"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`px-8 py-3.5 uppercase tracking-widest text-[10px] md:text-[11px] font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={14} className="shrink-0" />} {children}
    </button>
  );
};

const SectionTitle = ({ title, subtitle, light = false }) => (
  <div className="text-center mb-16 animate-fade-in-up">
    <span className="text-[#C5A059] uppercase tracking-[0.2em] text-xs font-bold mb-3 flex items-center justify-center gap-3"><span className="w-8 h-px bg-[#C5A059]/50"></span>{subtitle}<span className="w-8 h-px bg-[#C5A059]/50"></span></span>
    <h2 className={`font-serif text-4xl md:text-5xl ${light ? 'text-white' : 'text-neutral-900'}`}>{title}</h2>
  </div>
);

// --- 3. MODALS & MENUS ---

const MobileMenu = ({ isOpen, onClose, onNavigate, activeTab }) => {
  return (
    <div className={`fixed inset-0 bg-neutral-950 z-[150] transform transition-transform duration-500 ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="flex flex-col h-full p-8 relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white"><X size={32} /></button>
        <div className="flex-1 flex flex-col items-center justify-center gap-8">{['home', 'customize', 'tryon'].map((tab) => (<button key={tab} onClick={() => { onNavigate(tab); onClose(); }} className={`font-serif text-4xl transition-all ${activeTab === tab ? 'text-[#C5A059] italic scale-110' : 'text-white hover:text-neutral-300'}`}>{tab === 'home' ? 'Collections' : tab === 'customize' ? 'The Atelier' : 'Fitting Room'}</button>))} <div className="w-12 h-px bg-white/20 my-4"></div><button onClick={() => { onNavigate('consultation'); onClose(); }} className="font-serif text-3xl text-white hover:text-[#C5A059]">Book Appointment</button></div>
        <div className="text-center text-neutral-500 text-[10px] uppercase tracking-widest">Bespoke Bridal • Est. 2024</div>
      </div>
    </div>
  );
};

const ProductModal = ({ isOpen, onClose, product, onBook }) => {
    if(!isOpen || !product) return null;
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-4xl h-[80vh] md:h-auto md:max-h-[90vh] relative z-10 shadow-2xl rounded-sm flex flex-col md:flex-row overflow-hidden animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-black z-20 bg-white/50 p-2 rounded-full"><X size={24}/></button>
                <div className="w-full md:w-1/2 bg-neutral-100 relative">
                    <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                    <div className="mb-6">
                        <span className="text-[#C5A059] text-xs uppercase tracking-widest font-bold">{product.style} Collection</span>
                        <h2 className="font-serif text-4xl text-neutral-900 mt-2 mb-4">{product.name}</h2>
                        <p className="text-neutral-500 font-light leading-relaxed">{product.description}</p>
                    </div>
                    <div className="space-y-4 mb-8 border-y border-neutral-100 py-6">
                        <div className="flex justify-between text-sm"><span className="text-neutral-400">Fabrication</span><span className="font-serif">{product.fabric}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-neutral-400">Silhouette</span><span className="font-serif">{product.style}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-neutral-400">Starting Price</span><span className="font-serif text-xl">${product.price.toLocaleString()}</span></div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button variant="gold" fullWidth onClick={() => { onClose(); onBook(product); }}>Request Consultation</Button>
                        <Button variant="outline" fullWidth>Download Lookbook</Button>
                    </div>
                    <div className="mt-6 text-center text-[10px] text-neutral-400 uppercase tracking-widest flex items-center justify-center gap-2"><ShieldCheck size={12}/> Authenticity Guaranteed</div>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = ({ isOpen, onClose, db, appId, addToast }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [allOrders, setAllOrders] = useState([]);
    const [allConsultations, setAllConsultations] = useState([]);
    const [subscribers, setSubscribers] = useState([]);

    useEffect(() => {
        if (!isOpen || !db) return;
        
        // Fetch Global Data
        const unsubOrders = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'all_orders'), orderBy('createdAt', 'desc')), s => setAllOrders(s.docs.map(d => ({id: d.id, ...d.data()}))));
        const unsubConsults = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'all_consultations'), orderBy('createdAt', 'desc')), s => setAllConsultations(s.docs.map(d => ({id: d.id, ...d.data()}))));
        const unsubSubs = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'subscribers'), orderBy('createdAt', 'desc')), s => setSubscribers(s.docs.map(d => ({id: d.id, ...d.data()}))));

        return () => { unsubOrders(); unsubConsults(); unsubSubs(); };
    }, [isOpen, db, appId]);

    const updateOrderStatus = async (orderId, status) => {
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'all_orders', orderId), { status });
            addToast("Updated", `Order marked as ${status}`);
        } catch(e) { addToast("Error", "Update failed."); }
    };

    if (!isOpen) return null;

    const totalRevenue = allOrders.reduce((acc, curr) => acc + (curr.total || 0), 0);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-neutral-900">
             <div className="w-full h-full max-w-7xl mx-auto flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-neutral-800">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-500"><LayoutDashboard size={20}/></div>
                        <div><h2 className="text-white font-serif text-2xl">Owner Dashboard</h2><p className="text-emerald-500 text-xs uppercase tracking-widest">Admin Access • Live Data</p></div>
                    </div>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={24}/></button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-64 border-r border-neutral-800 p-6 space-y-2 hidden md:block">
                        <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest font-bold rounded transition-colors flex items-center gap-3 ${activeTab === 'overview' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-500 hover:bg-neutral-800 hover:text-white'}`}><LayoutDashboard size={14}/> Overview</button>
                        <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest font-bold rounded transition-colors flex items-center gap-3 ${activeTab === 'orders' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-500 hover:bg-neutral-800 hover:text-white'}`}><Package size={14}/> Orders</button>
                        <button onClick={() => setActiveTab('bookings')} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest font-bold rounded transition-colors flex items-center gap-3 ${activeTab === 'bookings' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-500 hover:bg-neutral-800 hover:text-white'}`}><CalendarDays size={14}/> Bookings</button>
                        <button onClick={() => setActiveTab('customers')} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest font-bold rounded transition-colors flex items-center gap-3 ${activeTab === 'customers' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-500 hover:bg-neutral-800 hover:text-white'}`}><Users size={14}/> Customers</button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 bg-black/20">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="bg-neutral-800 p-6 rounded-sm border border-neutral-700"><h5 className="text-neutral-400 text-xs uppercase mb-2">Total Revenue</h5><p className="text-3xl text-white font-serif">${totalRevenue.toLocaleString()}</p></div>
                                    <div className="bg-neutral-800 p-6 rounded-sm border border-neutral-700"><h5 className="text-neutral-400 text-xs uppercase mb-2">Pending Orders</h5><p className="text-3xl text-white font-serif">{allOrders.filter(o => o.status === 'paid').length}</p></div>
                                    <div className="bg-neutral-800 p-6 rounded-sm border border-neutral-700"><h5 className="text-neutral-400 text-xs uppercase mb-2">Upcoming Appts</h5><p className="text-3xl text-white font-serif">{allConsultations.length}</p></div>
                                </div>
                                
                                <h3 className="text-white font-serif text-xl pt-8 border-t border-neutral-800">Recent Activity</h3>
                                <div className="space-y-2">
                                    {allOrders.slice(0,3).map(o => (
                                        <div key={o.id} className="bg-neutral-800/50 p-4 flex justify-between items-center text-sm text-neutral-300">
                                            <span>New Order placed by {o.userEmail || 'Client'}</span>
                                            <span className="text-emerald-400">+${o.total}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="space-y-4">
                                <h3 className="text-white font-serif text-xl mb-6">Global Order Management</h3>
                                {allOrders.map(order => (
                                    <div key={order.id} className="bg-neutral-800 p-6 rounded-sm border border-neutral-700 flex justify-between items-start">
                                        <div>
                                            <h4 className="text-white font-bold mb-1">Order #{order.id.slice(-6).toUpperCase()}</h4>
                                            <p className="text-neutral-400 text-sm mb-2">Client: {order.userEmail}</p>
                                            <div className="flex gap-2">{order.items?.map((i, idx) => <span key={idx} className="bg-neutral-900 px-2 py-1 text-xs text-neutral-300 rounded">{i.name}</span>)}</div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl text-[#C5A059] font-serif mb-2">${order.total?.toLocaleString()}</p>
                                            <select 
                                                className="bg-neutral-900 text-white text-xs border border-neutral-600 p-2 rounded outline-none"
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            >
                                                <option value="paid">Paid</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
             </div>
        </div>
    );
};

const AuthModal = ({ isOpen, onClose, auth, setUser, addToast }) => {
  const [mode, setMode] = useState('signin'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // VIP DEMO LOGIN
  const handleDemoLogin = () => {
      setLoading(true);
      setTimeout(() => {
          setUser(VIP_DEMO_USER); 
          addToast("Welcome Ms. Sterling", "VIP Access Granted.");
          setLoading(false);
          onClose();
      }, 800);
  };

  // ADMIN LOGIN
  const handleAdminLogin = () => {
      setLoading(true);
      setTimeout(() => {
          setUser(ADMIN_DEMO_USER);
          addToast("Welcome Owner", "Admin Dashboard Unlocked.");
          setLoading(false);
          onClose();
      }, 800);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName: name });
            setUser({ ...result.user, displayName: name }); 
            addToast("Success", `Welcome to Bespoke, ${name}!`);
        } catch (err) {
            // Fallback
            if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/unauthorized-domain') {
               const res = await signInAnonymously(auth);
               await updateProfile(res.user, { displayName: name });
               setUser({ ...res.user, displayName: name });
               addToast("Success", "Account created (Guest Mode).");
            } else throw err;
        }
      } else {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            setUser(result.user);
            addToast("Success", "Signed in.");
        } catch (err) {
            if (err.code === 'auth/operation-not-allowed') {
                const res = await signInAnonymously(auth);
                setUser(res.user);
                addToast("Guest Access", "Signed in as Guest.");
            } else throw err;
        }
      }
      onClose();
    } catch (err) {
      console.error("Auth Error:", err);
      addToast("Error", "Authentication failed.", 'error');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
      setLoading(true);
      try {
          const result = await signInWithPopup(auth, googleProvider);
          setUser(result.user);
          addToast("Success", "Signed in with Google.");
          onClose();
      } catch(err) {
          console.error(err);
          if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/operation-not-allowed') {
             // Auto Fallback
             try {
               const res = await signInAnonymously(auth);
               await updateProfile(res.user, { displayName: "Google User (Simulated)" });
               setUser(res.user);
               addToast("Success", "Signed in via Google (Simulated)");
               onClose();
             } catch(e) { addToast("Error", "Login failed."); }
          } else {
             addToast("Error", "Google Sign-In failed.", 'error');
          }
      } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-md p-10 relative z-10 shadow-2xl rounded-sm text-center animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900"><X size={24}/></button>
        <h3 className="font-serif text-3xl mb-2">The Atelier</h3>
        <p className="text-neutral-500 text-sm mb-6">Access your private bridal profile</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#FDFBF7] border border-[#C5A059] p-3 rounded-sm cursor-pointer hover:bg-[#F0E6D2] transition-colors" onClick={handleDemoLogin}>
                <div className="flex justify-center text-[#C5A059] mb-1"><Gem size={16}/></div>
                <div className="text-[10px] uppercase font-bold text-[#C5A059]">View as VIP Client</div>
            </div>
            <div className="bg-neutral-100 border border-neutral-200 p-3 rounded-sm cursor-pointer hover:bg-neutral-200 transition-colors" onClick={handleAdminLogin}>
                <div className="flex justify-center text-neutral-600 mb-1"><Lock size={16}/></div>
                <div className="text-[10px] uppercase font-bold text-neutral-600">Owner Login (Demo)</div>
            </div>
        </div>

        <div className="flex items-center gap-4 mb-6"><div className="h-px bg-neutral-200 flex-1"></div><span className="text-[10px] uppercase text-neutral-400">Or Standard Access</span><div className="h-px bg-neutral-200 flex-1"></div></div>

        <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
            {mode === 'signup' && (<div><label className="text-[10px] uppercase font-bold text-neutral-500">Name</label><input type="text" required className="w-full border-b border-neutral-300 py-2 outline-none focus:border-[#C5A059]" value={name} onChange={(e) => setName(e.target.value)} /></div>)}
            <div><label className="text-[10px] uppercase font-bold text-neutral-500">Email</label><input type="email" required className="w-full border-b border-neutral-300 py-2 outline-none focus:border-[#C5A059]" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><label className="text-[10px] uppercase font-bold text-neutral-500">Password</label><input type="password" required className="w-full border-b border-neutral-300 py-2 outline-none focus:border-[#C5A059]" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button variant="primary" fullWidth type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : (mode === 'signin' ? 'Sign In' : 'Create Account')}</Button>
        </form>
        <div className="mt-4"><Button variant="outline" fullWidth onClick={handleGoogle}>Continue with Google</Button></div>
        
        <div className="mt-6 text-xs text-neutral-500">
            <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="font-bold underline hover:text-[#C5A059]">
                {mode === 'signin' ? 'Create New Account' : 'Back to Login'}
            </button>
        </div>
      </div>
    </div>
  );
};

const BookingModal = ({ isOpen, onClose, addToast, db, userId, appId, type="consultation" }) => {
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', date: '', location: 'virtual' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault(); setStep('submitting');
    try {
        if(userId && db) {
             const booking = { ...formData, type, userEmail: 'demo@user.com', createdAt: serverTimestamp() };
             await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'consultations'), booking);
             await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'all_consultations'), booking);
        }
        setTimeout(() => { setStep('success'); addToast("Confirmed", "Appointment booked."); }, 1000);
    } catch(e) { console.error(e); setStep('form'); addToast("Error", "Failed"); }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-lg p-8 relative z-10 animate-fade-in-up shadow-2xl rounded-sm border-t-4 border-[#C5A059]">
        <button onClick={onClose} className="absolute top-4 right-4 hover:text-neutral-900"><X size={24} /></button>
        {step !== 'success' ? (
          <>
            <h3 className="font-serif text-2xl mb-2 text-center">{type === 'coaching' ? 'Book Wellness Session' : 'Book Consultation'}</h3>
            <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="First Name" required className="border-b border-neutral-300 py-2 text-sm outline-none focus:border-[#C5A059]" onChange={e=>setFormData({...formData,firstName:e.target.value})}/><input type="text" placeholder="Last Name" required className="border-b border-neutral-300 py-2 text-sm outline-none focus:border-[#C5A059]" onChange={e=>setFormData({...formData,lastName:e.target.value})}/></div>
              <input type="email" placeholder="Email" required className="w-full border-b border-neutral-300 py-2 text-sm outline-none focus:border-[#C5A059]" onChange={e=>setFormData({...formData,email:e.target.value})}/>
              <div className="relative"><Calendar size={14} className="absolute left-0 top-3 text-neutral-400"/><input type="text" placeholder="Date" className="w-full border-b border-neutral-300 py-2 pl-6 text-sm outline-none focus:border-[#C5A059]" onFocus={e=>e.target.type='date'} onChange={e=>setFormData({...formData,date:e.target.value})}/></div>
              <Button variant="gold" fullWidth type="submit" className="mt-4">{step === 'submitting' ? <Loader2 className="animate-spin"/> : 'Confirm Booking'}</Button>
            </form>
          </>
        ) : (
          <div className="text-center py-12"><div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600"><Check size={32}/></div><h3 className="font-serif text-2xl mb-2">Confirmed</h3><Button variant="outline" onClick={onClose}>Close</Button></div>
        )}
      </div>
    </div>
  );
};

const ProfileDashboard = ({ isOpen, onClose, user, auth, db, appId, addToast }) => {
    const [activeTab, setActiveTab] = useState('overview');
    // Use Mock Data if User is Demo, else real state (omitted for brevity in this specific component, utilizing pre-load for demo)
    const isDemo = user?.isDemo;
    const data = isDemo ? MOCK_VIP_DATA : { membership: null, profile: {}, orders: [] }; 

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white w-full max-w-4xl h-[85vh] relative z-10 shadow-2xl rounded-sm flex flex-col overflow-hidden animate-fade-in-up">
                <div className="bg-neutral-900 text-white p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">{user.photoURL && <img src={user.photoURL} className="w-12 h-12 rounded-full border-2 border-[#C5A059]" alt="User"/>}<div><h3 className="font-serif text-xl">{user.displayName}</h3><p className="text-[10px] uppercase tracking-widest text-[#C5A059]">{data.membership ? `Bridal Society ${data.membership.tier}` : 'Standard Client'}</p></div></div>
                    <div className="flex gap-4"><button onClick={() => isDemo ? onClose() : signOut(auth).then(onClose)} className="text-xs text-neutral-400 hover:text-white flex items-center gap-2"><LogOut size={14}/> Sign Out</button><button onClick={onClose}><X size={24}/></button></div>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-48 bg-neutral-50 border-r border-neutral-100 p-4 space-y-2 hidden md:block">
                        {['overview', 'measurements', 'orders'].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest font-bold rounded transition-colors ${activeTab === tab ? 'bg-white shadow-sm text-[#C5A059]' : 'text-neutral-500 hover:bg-neutral-100'}`}>{tab}</button>)}
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <h2 className="font-serif text-3xl text-neutral-800">Dashboard</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-[#FDFBF7] p-6 border border-[#C5A059]/20"><h5 className="text-[#C5A059] text-xs uppercase font-bold mb-2">Status</h5><p className="font-serif text-xl">{data.membership ? 'Elite VIP' : 'Standard'}</p></div>
                                    <div className="bg-neutral-50 p-6 border border-neutral-100"><h5 className="text-neutral-400 text-xs uppercase font-bold mb-2">Orders</h5><p className="font-serif text-xl">{data.orders.length}</p></div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'measurements' && (
                            <div className="max-w-lg">
                                <h4 className="font-serif text-2xl mb-6">My Measurements</h4>
                                <div className="grid grid-cols-2 gap-6">{Object.entries(data.profile).map(([k, v]) => (<div key={k}><label className="block text-[10px] uppercase text-neutral-500 mb-1">{k}</label><input type="text" className="w-full border-b border-neutral-300 py-2 font-serif text-lg" defaultValue={v} readOnly={isDemo}/></div>))}</div>
                            </div>
                        )}
                         {activeTab === 'orders' && (
                             <div className="space-y-4">
                                 <h4 className="font-serif text-2xl mb-6">Order History</h4>
                                 {data.orders.map((o, i) => (
                                     <div key={i} className="border p-4 flex justify-between items-center">
                                         <div><p className="font-bold text-sm">Order #{o.id}</p><p className="text-xs text-neutral-500">{new Date(o.createdAt.seconds * 1000).toLocaleDateString()}</p></div>
                                         <span className="text-[#C5A059] font-serif">${o.total}</span>
                                     </div>
                                 ))}
                             </div>
                        )}
                    </div>
                </div>
             </div>
        </div>
    );
};

const PaymentModal = ({ isOpen, onClose, amount, onSuccess, title="Secure Checkout" }) => {
    const [processing, setProcessing] = useState(false);
    if(!isOpen) return null;
    const handlePay = (e) => { e.preventDefault(); setProcessing(true); setTimeout(() => { setProcessing(false); onSuccess(); onClose(); }, 2000); };
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-md p-8 relative z-10 shadow-2xl rounded-sm">
                <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-4"><h3 className="font-serif text-xl flex items-center gap-2"><Lock size={18}/> {title}</h3><button onClick={onClose}><X size={20}/></button></div>
                <div className="mb-8 text-center"><span className="text-xs uppercase text-neutral-500 tracking-widest">Total Amount</span><div className="font-serif text-4xl text-neutral-900 mt-2">${amount.toLocaleString()}</div></div>
                <form onSubmit={handlePay} className="space-y-4">
                    <div><label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Card Number</label><div className="relative"><CreditCard size={16} className="absolute left-3 top-3 text-neutral-400"/><input type="text" placeholder="0000 0000 0000 0000" className="w-full border border-neutral-200 p-2 pl-10 rounded-sm focus:border-[#C5A059] outline-none font-mono" required /></div></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Expiry</label><input type="text" placeholder="MM/YY" className="w-full border border-neutral-200 p-2 rounded-sm focus:border-[#C5A059] outline-none text-center" required /></div><div><label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">CVC</label><input type="text" placeholder="123" className="w-full border border-neutral-200 p-2 rounded-sm focus:border-[#C5A059] outline-none text-center" required /></div></div>
                    <Button variant="gold" fullWidth type="submit" disabled={processing} className="mt-4 h-12">{processing ? <><Loader2 className="animate-spin"/> Processing...</> : `Pay $${amount.toLocaleString()}`}</Button>
                </form>
            </div>
        </div>
    );
};

const PremiumModal = ({ isOpen, onClose, onUpgrade }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[#C5A059]/20 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white w-full max-w-md p-8 relative z-10 shadow-2xl rounded-sm border border-[#C5A059] animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900"><X size={24}/></button>
                <div className="text-center">
                    <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 text-[#C5A059]"><Crown size={32}/></div>
                    <h3 className="font-serif text-3xl mb-2 text-neutral-900">Bridal Society</h3>
                    <p className="text-neutral-500 text-sm mb-6 px-4">Saving designs is exclusive to our society members. Join today to unlock.</p>
                    <Button variant="premium" fullWidth onClick={onUpgrade}>Join for $99 / Year</Button>
                    <button onClick={onClose} className="mt-4 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-900">No thanks</button>
                </div>
            </div>
        </div>
    );
};

const CartDrawer = ({ isOpen, onClose, items, onRemove, db, user, appId, addToast, clearCart }) => {
    const [isPayOpen, setIsPayOpen] = useState(false);
    const subtotal = items.reduce((acc, item) => acc + item.price, 0);

    const handleCheckoutSuccess = async () => {
        if(db && user) {
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), {
                items, total: subtotal, status: 'paid', createdAt: serverTimestamp()
            });
            // Clear cart (in real app, batch delete)
            clearCart(); 
            addToast("Order Placed", "Thank you for your purchase.", 'success');
        }
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}/>
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50"><h3 className="font-serif text-xl flex items-center gap-2">Portfolio</h3><button onClick={onClose}><X size={24}/></button></div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {items.length === 0 && <div className="text-center text-neutral-400 pt-20">Your portfolio is empty.</div>}
                        {items.map((item, i) => (
                            <div key={i} className="flex gap-4 border p-3 rounded-sm"><div className="w-20 h-24 bg-neutral-100 shrink-0"><ImageWithFallback src={item.image} className="w-full h-full object-cover"/></div><div className="flex-1"><div className="flex justify-between"><h4 className="font-serif text-lg">{item.name}</h4><button onClick={() => onRemove(i)}><Trash2 size={14}/></button></div><p className="text-sm text-[#C5A059]">${item.price}</p></div></div>
                        ))}
                    </div>
                    <div className="p-6 border-t border-neutral-100 bg-neutral-50">
                        <div className="flex justify-between mb-4"><span className="uppercase text-xs">Total</span><span className="font-serif text-2xl">${subtotal.toLocaleString()}</span></div>
                        <Button variant="gold" fullWidth disabled={items.length === 0} onClick={() => setIsPayOpen(true)}>Checkout</Button>
                    </div>
                </div>
            </div>
            <PaymentModal isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} amount={subtotal} onSuccess={handleCheckoutSuccess} title="Complete Order" />
        </>
    );
};

const ContentModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[140] flex items-center justify-center px-4"><div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose}></div><div className="bg-white w-full max-w-lg p-8 relative z-10 shadow-2xl rounded-sm border-t-4 border-[#C5A059]"><button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900"><X size={24}/></button><h3 className="font-serif text-2xl mb-4 text-center">{title}</h3><div className="text-neutral-600 text-sm leading-relaxed space-y-4">{children}</div></div></div>;
};

// --- 4. DATA ---

// --- MAIN APP ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [bookingType, setBookingType] = useState(null); 
  const [selectedProduct, setSelectedProduct] = useState(null); // New: For Product Modal
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [adminView, setAdminView] = useState(false);

  // Firebase
  const [appId] = useState(typeof __app_id !== 'undefined' ? __app_id : 'bespoke-v16-ent');
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);

  useEffect(() => {
    if (firebaseConfig) { const app = initializeApp(firebaseConfig); setAuth(getAuth(app)); setDb(getFirestore(app)); }
  }, [firebaseConfig]);

  useEffect(() => { 
    if (auth) return onAuthStateChanged(auth, (u) => {
        if (u && !u.isDemo) setUser(u);
        else if (!u) setUser(null); // Logout
    }); 
  }, [auth]);

  const addToast = (title, message, type='info') => { const id = Date.now(); setToasts(p => [...p, { id, title, message, type }]); setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000); };

  const handleNavClick = (tab) => {
    if (tab === 'consultation') setBookingType('consultation');
    else { setActiveTab(tab); window.scrollTo(0, 0); }
    setIsMobileMenuOpen(false);
  };

  const checkPremium = (action) => {
      if (user && (user.isAnonymous || user.isDemo)) {
          if (user.isDemo) action(); 
          else setIsPremiumModalOpen(true);
      } else if (user) {
          action();
      } else {
          setIsAuthOpen(true);
      }
  };

  const handleAddToCart = (item) => {
      setCartItems([...cartItems, item]);
      addToast("Saved", "Added to Portfolio");
      setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-[#C5A059] selection:text-white">
      <style dangerouslySetInnerHTML={{__html: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Lato:wght@300;400;700&display=swap'); :root{--font-serif:'Playfair Display',serif;--font-sans:'Lato',sans-serif;} .font-serif{font-family:var(--font-serif);} .font-sans{font-family:var(--font-sans);} .animate-fade-in-up{animation:fadeInUp 0.8s ease-out forwards;} @keyframes fadeInUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}} @keyframes slideIn{from{transform:translateX(100%);}to{transform:translateX(0);}}`}} />

      <header className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-neutral-100 py-4">
         <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
                <button className="lg:hidden hover:opacity-70 p-2 -ml-2" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
                <nav className="hidden lg:flex gap-6 text-[11px] uppercase tracking-widest font-bold"><button onClick={() => setActiveTab('home')}>Home</button><button onClick={() => setActiveTab('wellness')}>Wellness</button><button onClick={() => setActiveTab('travel')}>Honeymoon</button><button onClick={() => setActiveTab('tryon')}>Virtual Fit</button></nav>
            </div>
            <div className="font-serif text-2xl cursor-pointer" onClick={() => setActiveTab('home')}>BESPOKE</div>
            <div className="flex items-center gap-6">
              {user?.isAdmin && (
                  <button onClick={() => setAdminView(true)} className="hidden md:flex items-center gap-2 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100">
                      <LayoutDashboard size={14}/> Admin Panel
                  </button>
              )}
              {user ? (
                  <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-2 text-[11px] uppercase font-bold hover:text-[#C5A059]">
                      <User size={16}/> 
                      <span className="hidden md:inline">{user.displayName?.split(' ')[0]}'s Atelier</span>
                  </button>
              ) : (
                  <button onClick={() => setIsAuthOpen(true)} className="text-[11px] uppercase font-bold hover:text-[#C5A059]">Sign In</button>
              )}
              <button className="relative hover:text-[#C5A059]" onClick={() => setIsCartOpen(true)}>
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  {cartItems.length > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#C5A059] rounded-full text-[9px] flex items-center justify-center text-white font-bold">{cartItems.length}</span>}
              </button>
            </div>
         </div>
      </header>

      <div className="pt-20">
         {activeTab === 'home' && (
             <>
                <div className="relative h-[85vh] w-full overflow-hidden bg-neutral-900"><ImageWithFallback src={ASSETS.hero} className="w-full h-full object-cover opacity-80" /><div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center"><h1 className="font-serif text-6xl md:text-8xl mb-6">The Art of You</h1><Button variant="white" onClick={() => setActiveTab('tryon')}>Enter Virtual Atelier</Button></div></div>
                <div className="py-24 bg-white px-6 md:px-12">
                  <SectionTitle title="The 2025 Collection" subtitle="Curated Elegance" />
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 max-w-7xl mx-auto">
                    {DRESS_CATALOG.map((dress) => (
                      <div key={dress.id} className="group cursor-pointer" onClick={() => setSelectedProduct(dress)}>
                        <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-neutral-100">
                          <ImageWithFallback src={dress.image} backupSrc={dress.backup} alt={dress.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex justify-between items-center border-t border-[#C5A059]"><span className="text-[10px] uppercase tracking-widest font-bold">View Details</span><ChevronRight size={14} /></div>
                        </div>
                        <h3 className="font-serif text-xl mb-1 group-hover:text-[#C5A059] transition-colors">{dress.name}</h3>
                        <p className="text-neutral-900 font-serif italic">From ${dress.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
             </>
         )}
         {activeTab === 'customize' && <div className="py-12"><Customizer onAddToCart={handleAddToCart} addToast={addToast} checkPremium={checkPremium} /></div>}
         {activeTab === 'wellness' && <div className="py-24 bg-[#FDFBF7]"><SectionTitle title="Bridal Wellness" subtitle="Mind & Body" /><div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center"><div className="order-2 md:order-1"><h3 className="font-serif text-3xl mb-4">Motivational Coaching</h3><p className="text-neutral-500 mb-6">Preparing for your wedding is more than just fitting a dress. Our in-house life coaches help you navigate the emotional journey.</p><Button variant="primary" onClick={() => setBookingType('coaching')}>Book a Session</Button></div><div className="order-1 md:order-2 relative"><ImageWithFallback src={ASSETS.coaching} className="w-full aspect-square object-cover" /></div></div></div>}
         {activeTab === 'travel' && <div className="py-24 bg-white"><SectionTitle title="Honeymoon Escapes" subtitle="Affiliate Travel" /><div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">{[{ loc: "Amalfi Coast", price: "$3,200" }, { loc: "Santorini", price: "$2,800" }, { loc: "Maldives", price: "$4,500" }].map((trip, i) => (<div key={i} className="group cursor-pointer"><div className="overflow-hidden relative aspect-video mb-4"><ImageWithFallback src={ASSETS.travel} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Travel" /><div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div><div className="absolute bottom-4 left-4 text-white font-serif text-xl">{trip.loc}</div></div><div className="flex justify-between items-center"><span className="text-xs uppercase tracking-widest text-neutral-500">Starting at {trip.price}</span><span className="text-[#C5A059] text-xs font-bold flex items-center gap-1">View Package <ArrowRight size={12}/></span></div></div>))}</div></div>}
         {activeTab === 'tryon' && <VirtualFittingRoom user={user} db={db} appId={appId} addToast={addToast} checkPremium={checkPremium} />}
      </div>

      <footer className="bg-neutral-900 text-white py-20 border-t border-neutral-800"><div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12"><div><h5 className="font-serif text-2xl mb-6">BESPOKE BRIDAL</h5><div className="flex gap-4 text-neutral-400"><Instagram size={16} /><Facebook size={16} /><Twitter size={16} /></div></div><div><h6 className="text-xs uppercase font-bold mb-6 text-[#C5A059]">Experience</h6><ul className="space-y-3 text-sm text-neutral-400 font-light"><li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('tryon')}>Virtual Fit</li><li className="hover:text-white cursor-pointer" onClick={() => setBookingType('consultation')}>Book Consultation</li></ul></div><div className="md:col-span-1"><h6 className="text-xs uppercase font-bold mb-6 text-[#C5A059]">Contact Us</h6><p className="text-sm text-neutral-400 font-light mb-2">155 Wooster St, New York, NY 10012</p><p className="text-sm text-neutral-400 font-light mb-2">+1 (212) 555-0198</p><p className="text-sm text-neutral-400 font-light">atelier@bespokebridal.com</p></div></div></footer>

      <ProductModal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} onBook={() => setBookingType('consultation')} />
      <BookingModal isOpen={!!bookingType} onClose={() => setBookingType(null)} type={bookingType} addToast={addToast} db={db} userId={user?.uid} appId={appId} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} auth={auth} setUser={setUser} addToast={addToast} />
      <ProfileDashboard isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} auth={auth} db={db} appId={appId} addToast={addToast} />
      <AdminDashboard isOpen={adminView} onClose={() => setAdminView(false)} db={db} appId={appId} addToast={addToast} />
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} onUpgrade={() => addToast("Success", "Membership Activated")} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} onNavigate={handleNavClick} activeTab={activeTab} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onRemove={(i) => {const n=[...cartItems]; n.splice(i,1); setCartItems(n)}} db={db} user={user} appId={appId} addToast={addToast} clearCart={() => setCartItems([])} />
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(p => p.filter(t => t.id !== id))} />
    </div>
  );
}
