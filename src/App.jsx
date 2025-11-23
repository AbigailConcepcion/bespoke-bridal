import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, Menu, X, Camera, Scissors, Ruler, ChevronRight, Star, Upload, Check, 
  ArrowRight, Instagram, Facebook, Twitter, Calendar, User, MapPin, Sparkles, ZoomIn, 
  Loader2, Trash2, Plus, Minimize2, Maximize2, Info, Mail, Phone, ShieldCheck, Truck,
  Edit2, CalendarDays, LogOut, Globe, Plane, Heart, Smile, CreditCard, Move, Lock, Crown,
  Eye, EyeOff, AlertCircle, Gem, LayoutDashboard, Users, Package, Settings
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
const ADMIN_EMAIL = "admin@bespokebridal.com"; // John Swahn's Access

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

// Pre-configured VIP User for Demos
const VIP_USER = {
    uid: 'vip-client-001',
    displayName: 'Sophia Sterling',
    email: 'sophia@vip.com',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    isVIP: true
};

// Pre-configured Owner User (John Swahn)
const OWNER_USER = {
    uid: 'owner-admin-001',
    displayName: 'John Swahn',
    email: ADMIN_EMAIL,
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    isAdmin: true
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

const ImageWithFallback = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [status, setStatus] = useState('loading');
  useEffect(() => { setImgSrc(src); setStatus('loading'); }, [src]);
  return (
    <div className={`relative overflow-hidden bg-neutral-100 ${className}`}>
      {status === 'loading' && <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 z-10"><div className="w-full h-full animate-pulse bg-neutral-200"></div></div>}
      <img src={imgSrc} alt={alt} className={`w-full h-full object-cover transition-all duration-1000 ${status === 'loaded' ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} onLoad={() => setStatus('loaded')} onError={() => setStatus('error')} />
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
    admin: "bg-emerald-900 text-emerald-50 border border-emerald-700/50 hover:bg-emerald-800"
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

const AdminDashboard = ({ isOpen, onClose, db, appId, addToast }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [allOrders, setAllOrders] = useState([]);
    const [allConsultations, setAllConsultations] = useState([]);

    // Listen to GLOBAL collections (Admin View)
    useEffect(() => {
        if (!isOpen || !db) return;
        // In a real app, these would be secured by Firestore Rules to only allow admin UID
        const unsubOrders = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'all_orders'), orderBy('createdAt', 'desc')), s => setAllOrders(s.docs.map(d => ({id: d.id, ...d.data()}))));
        const unsubConsults = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'all_consultations'), orderBy('createdAt', 'desc')), s => setAllConsultations(s.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => { unsubOrders(); unsubConsults(); };
    }, [isOpen, db, appId]);

    const updateOrderStatus = async (orderId, status) => {
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'all_orders', orderId), { status });
            addToast("System Update", `Order #${orderId.slice(0,4)} marked as ${status}`);
        } catch(e) { addToast("Error", "Admin update failed.", 'error'); }
    };

    if (!isOpen) return null;
    const totalRevenue = allOrders.reduce((acc, curr) => acc + (curr.total || 0), 0);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-neutral-950">
             <div className="w-full h-full max-w-7xl mx-auto flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-neutral-800">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-500"><LayoutDashboard size={20}/></div>
                        <div><h2 className="text-white font-serif text-2xl">John Swahn | Owner</h2><p className="text-emerald-500 text-xs uppercase tracking-widest">Master Admin Access</p></div>
                    </div>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={24}/></button>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-64 border-r border-neutral-800 p-6 space-y-2 hidden md:block">
                        {['overview', 'orders', 'bookings', 'inventory'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest font-bold rounded transition-colors flex items-center gap-3 ${activeTab === tab ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-500 hover:bg-neutral-800 hover:text-white'}`}>{tab}</button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 bg-black/20">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="bg-neutral-800 p-6 rounded-sm border border-neutral-700"><h5 className="text-neutral-400 text-xs uppercase mb-2">Gross Revenue</h5><p className="text-3xl text-white font-serif">${totalRevenue.toLocaleString()}</p></div>
                                    <div className="bg-neutral-800 p-6 rounded-sm border border-neutral-700"><h5 className="text-neutral-400 text-xs uppercase mb-2">Active Orders</h5><p className="text-3xl text-white font-serif">{allOrders.length}</p></div>
                                    <div className="bg-neutral-800 p-6 rounded-sm border border-neutral-700"><h5 className="text-neutral-400 text-xs uppercase mb-2">Pending Appts</h5><p className="text-3xl text-white font-serif">{allConsultations.length}</p></div>
                                </div>
                                <h3 className="text-white font-serif text-xl pt-8 border-t border-neutral-800">Recent Activity Log</h3>
                                <div className="space-y-2">
                                    {allOrders.slice(0,5).map(o => (
                                        <div key={o.id} className="bg-neutral-800/50 p-4 flex justify-between items-center text-sm text-neutral-300 border-l-2 border-emerald-500">
                                            <span>New Order placed by {o.userEmail || 'Client'}</span>
                                            <span className="text-emerald-400">+${o.total?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'orders' && (
                            <div className="space-y-4">
                                {allOrders.map(order => (
                                    <div key={order.id} className="bg-neutral-800 p-6 rounded-sm border border-neutral-700 flex justify-between items-start">
                                        <div><h4 className="text-white font-bold mb-1">Order #{order.id.slice(0,8)}</h4><p className="text-neutral-400 text-sm">Client: {order.userEmail}</p></div>
                                        <div className="text-right"><p className="text-xl text-[#C5A059] font-serif mb-2">${order.total?.toLocaleString()}</p><select className="bg-neutral-900 text-white text-xs border border-neutral-600 p-2 rounded outline-none" value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}><option value="paid">Paid</option><option value="processing">Processing</option><option value="shipped">Shipped</option></select></div>
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

const ProductModal = ({ isOpen, onClose, product, onBook }) => {
    if(!isOpen || !product) return null;
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-4xl h-[80vh] md:h-auto md:max-h-[90vh] relative z-10 shadow-2xl rounded-sm flex flex-col md:flex-row overflow-hidden animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-black z-20 bg-white/50 p-2 rounded-full"><X size={24}/></button>
                <div className="w-full md:w-1/2 bg-neutral-100 relative"><ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" /></div>
                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                    <div className="mb-6"><span className="text-[#C5A059] text-xs uppercase tracking-widest font-bold">{product.style} Collection</span><h2 className="font-serif text-4xl text-neutral-900 mt-2 mb-4">{product.name}</h2><p className="text-neutral-500 font-light leading-relaxed">{product.description}</p></div>
                    <div className="space-y-4 mb-8 border-y border-neutral-100 py-6"><div className="flex justify-between text-sm"><span className="text-neutral-400">Fabrication</span><span className="font-serif">{product.fabric}</span></div><div className="flex justify-between text-sm"><span className="text-neutral-400">Starting Price</span><span className="font-serif text-xl">${product.price.toLocaleString()}</span></div></div>
                    <div className="flex flex-col gap-3"><Button variant="gold" fullWidth onClick={() => { onClose(); onBook(product); }}>Request Consultation</Button></div>
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

  // 1. CLIENT VIP LOGIN
  const handleVIPLogin = () => {
      setLoading(true);
      setTimeout(() => {
          setUser(VIP_USER); 
          addToast("Welcome Sophia", "VIP Client Access Granted.");
          setLoading(false);
          onClose();
      }, 800);
  };

  // 2. OWNER LOGIN (JOHN SWAHN)
  const handleOwnerLogin = () => {
      setLoading(true);
      setTimeout(() => {
          setUser(OWNER_USER);
          addToast("Welcome John", "Full Admin Access Granted.");
          setLoading(false);
          onClose();
      }, 800);
  };

  // 3. REAL AUTHENTICATION (FALLBACK SAFE)
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        setUser({ ...result.user, displayName: name }); 
        addToast("Success", `Account created for ${name}`);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        setUser(result.user);
        addToast("Success", "Signed in.");
      }
      onClose();
    } catch (err) {
        // Smart Fallback for Preview Environment
        if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/unauthorized-domain') {
             const res = await signInAnonymously(auth);
             // Mimic the requested user
             const simulatedUser = { ...res.user, displayName: name || 'Client', email: email };
             setUser(simulatedUser);
             addToast("Success", "Logged in (Simulated for Preview)");
             onClose();
        } else {
            addToast("Error", "Authentication failed.", 'error');
        }
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-md p-10 relative z-10 shadow-2xl rounded-sm text-center animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900"><X size={24}/></button>
        <h3 className="font-serif text-3xl mb-2">The Atelier</h3>
        <p className="text-neutral-500 text-sm mb-6">{mode === 'signin' ? 'Access your profile' : 'Create bespoke account'}</p>
        
        {/* SPECIAL ACCESS BUTTONS */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#FDFBF7] border border-[#C5A059] p-3 rounded-sm cursor-pointer hover:bg-[#F0E6D2] transition-colors group" onClick={handleVIPLogin}>
                <div className="flex justify-center text-[#C5A059] mb-1 group-hover:scale-110 transition-transform"><Gem size={20}/></div>
                <div className="text-[10px] uppercase font-bold text-[#C5A059]">Client VIP Login</div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-sm cursor-pointer hover:bg-black transition-colors group" onClick={handleOwnerLogin}>
                <div className="flex justify-center text-white mb-1 group-hover:scale-110 transition-transform"><LayoutDashboard size={20}/></div>
                <div className="text-[10px] uppercase font-bold text-white">Owner Login</div>
            </div>
        </div>

        <div className="flex items-center gap-4 mb-6"><div className="h-px bg-neutral-200 flex-1"></div><span className="text-[10px] uppercase text-neutral-400">Or Standard Email</span><div className="h-px bg-neutral-200 flex-1"></div></div>

        <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
            {mode === 'signup' && (<div><label className="text-[10px] uppercase font-bold text-neutral-500">Name</label><input type="text" required className="w-full border-b border-neutral-300 py-2 outline-none focus:border-[#C5A059]" value={name} onChange={(e) => setName(e.target.value)} /></div>)}
            <div><label className="text-[10px] uppercase font-bold text-neutral-500">Email</label><input type="email" required className="w-full border-b border-neutral-300 py-2 outline-none focus:border-[#C5A059]" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><label className="text-[10px] uppercase font-bold text-neutral-500">Password</label><input type="password" required className="w-full border-b border-neutral-300 py-2 outline-none focus:border-[#C5A059]" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button variant="primary" fullWidth type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : (mode === 'signin' ? 'Sign In' : 'Create Account')}</Button>
        </form>
        <div className="mt-6 text-xs text-neutral-500"><button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="font-bold underline hover:text-[#C5A059]">{mode === 'signin' ? 'Create New Account' : 'Back to Login'}</button></div>
      </div>
    </div>
  );
};

const ProfileDashboard = ({ isOpen, onClose, user, auth, db, appId, addToast }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [profileData, setProfileData] = useState({});
    const [orders, setOrders] = useState([]);
    const [membership, setMembership] = useState(null);

    useEffect(() => {
        if(!user || !db || !isOpen) return;
        // If VIP User, show mock data for demo purposes, else load real data
        if (user.isVIP) {
            setProfileData({ bust: 34, waist: 26, hips: 36, heightFt: 5, heightIn: 9 });
            setOrders([{id: 'ORD-9921', total: 3200, status: 'Processing', createdAt: { seconds: Date.now()/1000 }}]);
            setMembership({ status: 'active', tier: 'Gold' });
        } else {
            const uP = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile'), d => setProfileData(d.data() || {}));
            const uO = onSnapshot(query(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), orderBy('createdAt', 'desc')), s => setOrders(s.docs.map(d => ({id: d.id, ...d.data()}))));
            return () => { uP(); uO(); };
        }
    }, [user, db, isOpen]);

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white w-full max-w-4xl h-[85vh] relative z-10 shadow-2xl rounded-sm flex flex-col overflow-hidden animate-fade-in-up">
                <div className="bg-neutral-900 text-white p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">{user.photoURL && <img src={user.photoURL} className="w-12 h-12 rounded-full border-2 border-[#C5A059]" alt="User"/>}<div><h3 className="font-serif text-xl">{user.displayName}</h3><p className="text-[10px] uppercase tracking-widest text-[#C5A059]">{membership ? 'Bridal Society Member' : 'Standard Client'}</p></div></div>
                    <div className="flex gap-4"><button onClick={() => user.isVIP || user.isAdmin ? onClose() : signOut(auth).then(onClose)} className="text-xs text-neutral-400 hover:text-white flex items-center gap-2"><LogOut size={14}/> Sign Out</button><button onClick={onClose}><X size={24}/></button></div>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-48 bg-neutral-50 border-r border-neutral-100 p-4 space-y-2 hidden md:block">
                        {['overview', 'measurements', 'orders'].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest font-bold rounded transition-colors ${activeTab === tab ? 'bg-white shadow-sm text-[#C5A059]' : 'text-neutral-500 hover:bg-neutral-100'}`}>{tab}</button>)}
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                        {activeTab === 'overview' && <div className="space-y-8"><h2 className="font-serif text-3xl text-neutral-800">Welcome Back, {user.displayName?.split(' ')[0]}</h2><div className="bg-[#FDFBF7] p-6 border border-[#C5A059]/20 rounded-sm"><h4 className="text-[#C5A059] font-bold uppercase text-xs mb-2">Active Order</h4><p className="font-serif text-2xl">{orders.length > 0 ? 'Processing' : 'No active orders'}</p></div></div>}
                        {activeTab === 'measurements' && <div className="max-w-lg"><h4 className="font-serif text-2xl mb-6">My Measurements</h4><div className="grid grid-cols-2 gap-6">{Object.entries(profileData).map(([k, v]) => (<div key={k} className="border-b border-neutral-200 py-2 flex justify-between"><span className="text-neutral-500 uppercase text-xs">{k}</span><span className="font-serif">{v}</span></div>))}</div></div>}
                         {activeTab === 'orders' && <div className="space-y-4"><h4 className="font-serif text-2xl mb-6">Order History</h4>{orders.map(o => (<div key={o.id} className="border p-4 flex justify-between items-center"><div><p className="font-bold text-sm">Order #{o.id.slice(0,8).toUpperCase()}</p><p className="text-xs text-neutral-500">{o.status}</p></div><span className="text-[#C5A059] font-serif">${o.total}</span></div>))}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const BookingModal = ({ isOpen, onClose, addToast, db, userId, appId, existingBooking, type="consultation" }) => {
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', date: '', location: 'virtual', details: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault(); setStep('submitting');
    try {
      if (userId && db) {
        const collectionName = type === 'coaching' ? 'coaching_sessions' : 'consultations';
        const bookingData = { ...formData, type, userEmail: 'client@email.com', createdAt: serverTimestamp(), status: 'confirmed' };
        // Dual Write for Admin and User
        await addDoc(collection(db, 'artifacts', appId, 'users', userId, collectionName), bookingData);
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'all_consultations'), bookingData);
      }
      setTimeout(() => { setStep('success'); addToast("Confirmed", "Booking request sent."); }, 1000);
    } catch (error) { setStep('form'); addToast("Error", "Booking failed."); }
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

const Customizer = ({ onAddToCart, addToast, checkPremium }) => {
  const [silhouette, setSilhouette] = useState(SILHOUETTES[0]);
  const [fabric, setFabric] = useState(FABRICS[0]);
  const [selections, setSelections] = useState({ sleeves: 'Strapless', neckline: 'Sweetheart', train: 'Chapel' });
  const [isZoomed, setIsZoomed] = useState(false);
  const totalPrice = 3000 + fabric.priceMod;

  const handleAddToPortfolio = () => {
    checkPremium(() => {
        onAddToCart({
            name: `Custom ${silhouette.name}`,
            price: totalPrice,
            image: silhouette.baseImage,
            fabric: fabric.name,
            details: selections
        });
    });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[85vh] bg-zinc-50">
      <div className="lg:w-1/2 bg-[#E8E6E1] relative flex items-center justify-center p-6 lg:p-12 order-1 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/flower-trail.png')]"></div>
        <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md p-6 shadow-2xl rounded-sm transition-transform duration-500">
          <div className="flex justify-between items-start mb-4">
            <div><span className="uppercase tracking-widest text-[10px] text-zinc-500 mb-1 block">Configuration</span><h3 className="font-serif text-2xl text-zinc-800">The {silhouette.name}</h3></div>
            <div className="text-right"><span className="block text-[10px] uppercase text-zinc-400">Est. Investment</span><span className="text-xl font-serif text-zinc-900">${totalPrice.toLocaleString()}</span></div>
          </div>
          <div className="aspect-[3/4] mb-6 relative shadow-inner bg-zinc-200 group overflow-hidden">
             <ImageWithFallback src={silhouette.baseImage} alt="Dress Preview" className={`w-full h-full mix-blend-multiply transition-transform duration-700 ${isZoomed ? 'scale-150' : 'scale-100'}`} />
             <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url(${fabric.image})`, backgroundSize: '200px' }}></div>
             <button className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md hover:bg-white text-zinc-600 z-20" onClick={() => setIsZoomed(!isZoomed)}>{isZoomed ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}</button>
             <div className="absolute bottom-4 right-4 bg-white/95 px-3 py-2 text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 rounded-sm z-20 border border-zinc-100"><div className="w-5 h-5 rounded-full border border-zinc-200 shadow-sm overflow-hidden"><img src={fabric.image} className="w-full h-full object-cover" alt="Fabric" /></div><span className="font-bold">{fabric.name}</span></div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">{Object.entries(selections).map(([key, value]) => (<span key={key} className="bg-zinc-100 text-zinc-600 px-3 py-1 text-[9px] uppercase tracking-wide border border-zinc-200 rounded-full">{value}</span>))}</div>
        </div>
      </div>
      <div className="lg:w-1/2 p-6 lg:p-12 overflow-y-auto bg-white order-2 pb-32 lg:pb-12">
        <div className="max-w-lg mx-auto">
          <h3 className="font-serif text-3xl mb-2">The Atelier</h3>
          <p className="text-zinc-500 mb-8 font-light text-sm">Design your bespoke gown. Handcrafted to your exact specifications.</p>
          <div className="mb-8"><h4 className="uppercase text-[10px] font-bold tracking-widest mb-3 text-[#C5A059]">1. Silhouette</h4><div className="grid grid-cols-2 gap-3">{SILHOUETTES.map((sil) => (<button key={sil.id} onClick={() => setSilhouette(sil)} className={`p-3 border text-left transition-all ${silhouette.id === sil.id ? 'border-neutral-900 bg-zinc-50 ring-1 ring-neutral-900' : 'border-zinc-200 hover:border-zinc-400'}`}><span className="block font-serif text-base mb-1">{sil.name}</span><span className="text-[10px] opacity-60 font-light block">{sil.description}</span></button>))}</div></div>
          <div className="mb-8"><h4 className="uppercase text-[10px] font-bold tracking-widest mb-3 text-[#C5A059]">2. Fabrication</h4><div className="grid grid-cols-2 gap-3">{FABRICS.map((fab) => (<button key={fab.id} onClick={() => setFabric(fab)} className={`flex items-center gap-3 p-2 border transition-all ${fabric.id === fab.id ? 'border-neutral-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'}`}><div className="w-12 h-12 shrink-0 bg-zinc-200 overflow-hidden relative rounded-sm"><ImageWithFallback src={fab.image} alt={fab.name} className="w-full h-full object-cover" /></div><div className="text-left"><div className="text-xs font-bold">{fab.name}</div><div className="text-[10px] text-zinc-500">{fab.priceMod > 0 ? `+$${fab.priceMod}` : 'Included'}</div></div></button>))}</div></div>
          <div className="hidden lg:block pt-6 border-t border-zinc-100"><Button variant="gold" icon={Plus} onClick={handleAddToPortfolio} className="w-full shadow-xl">Save to Portfolio</Button></div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-200 lg:hidden z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]"><div className="flex items-center justify-between gap-4"><div><span className="text-[10px] uppercase text-zinc-500 block">Total Est.</span><div className="font-serif text-lg font-bold">${totalPrice.toLocaleString()}</div></div><Button variant="gold" icon={Plus} onClick={handleAddToPortfolio} className="flex-1 shadow-lg">Save & Book</Button></div></div>
    </div>
  );
};

const CartDrawer = ({ isOpen, onClose, items, onRemove, db, user, appId, addToast, clearCart }) => {
    const [isPayOpen, setIsPayOpen] = useState(false);
    const subtotal = items.reduce((acc, item) => acc + item.price, 0);

    const handleCheckoutSuccess = async () => {
        if(db && user) {
            const orderData = { items, total: subtotal, status: 'paid', createdAt: serverTimestamp(), userEmail: user.email || 'client@email.com' };
            // Dual Write for Admin
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), orderData);
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'all_orders'), orderData);
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

const VirtualFittingRoom = ({ addToast, user, db, appId }) => {
  const [bgImage, setBgImage] = useState(null);
  const [dressImage, setDressImage] = useState(null);
  const canvasRef = useRef(null);
  const [dressPos, setDressPos] = useState({ x: 100, y: 100, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgImage) { const img = new Image(); img.src = bgImage; ctx.drawImage(img, 0, 0, canvas.width, canvas.height); }
    if (dressImage) {
        const img = new Image(); img.src = dressImage; const w = 200 * dressPos.scale; const h = 300 * dressPos.scale;
        ctx.drawImage(img, dressPos.x, dressPos.y, w, h); ctx.strokeStyle = "#C5A059"; ctx.lineWidth = 2; ctx.strokeRect(dressPos.x, dressPos.y, w, h);
    }
  }, [bgImage, dressImage, dressPos]);

  const handleFileChange = (e) => { const file = e.target.files[0]; if (file) { const r = new FileReader(); r.onload = (ev) => setBgImage(ev.target.result); r.readAsDataURL(file); } };
  const handleMouseDown = (e) => { const r = canvasRef.current.getBoundingClientRect(); const x = e.clientX - r.left; const y = e.clientY - r.top; if (x > dressPos.x && x < dressPos.x + (200*dressPos.scale) && y > dressPos.y) { setIsDragging(true); setDragStart({ x: x - dressPos.x, y: y - dressPos.y }); } };
  const handleMouseMove = (e) => { if (isDragging) { const r = canvasRef.current.getBoundingClientRect(); setDressPos(prev => ({ ...prev, x: e.clientX - r.left - dragStart.x, y: e.clientY - r.top - dragStart.y })); } };
  const saveLook = async () => { if (!user) return addToast("Sign In", "Required to save."); if(db) await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'looks'), { img: canvasRef.current.toDataURL(), createdAt: serverTimestamp() }); addToast("Success", "Look Saved"); };

  return (
    <div className="py-12 bg-zinc-50 min-h-screen">
        <SectionTitle title="Virtual Atelier" subtitle="Interactive Fitting" />
        <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-8">
            <div className="flex-1 bg-white p-6 shadow-xl rounded-sm">
                <div className="flex justify-between items-center mb-4"><h3 className="font-serif text-xl">Canvas</h3><div className="flex gap-2"><label className="cursor-pointer bg-neutral-900 text-white px-4 py-2 text-xs uppercase font-bold flex items-center gap-2 hover:bg-neutral-700"><Upload size={14}/> Upload <input type="file" className="hidden" onChange={handleFileChange} accept="image/*"/></label><Button variant="gold" onClick={saveLook} icon={Camera}>Save</Button></div></div>
                <div className="border-2 border-dashed border-zinc-300 bg-zinc-100 relative aspect-[3/4] overflow-hidden cursor-move"><canvas ref={canvasRef} width={600} height={800} className="w-full h-full object-contain" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)}/></div>
                <div className="mt-4 flex items-center gap-4"><span className="text-xs uppercase font-bold text-zinc-500">Scale</span><input type="range" min="0.5" max="2" step="0.1" value={dressPos.scale} onChange={(e) => setDressPos({...dressPos, scale: parseFloat(e.target.value)})} className="flex-1 accent-[#C5A059]" /></div>
            </div>
            <div className="w-full lg:w-80 bg-white p-6 shadow-xl h-fit"><h3 className="font-serif text-xl mb-4">Select Gown</h3><div className="grid grid-cols-2 gap-4">{['https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=300', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=300'].map((src, i) => (<img key={i} src={src} className="w-full aspect-[3/4] object-cover border border-zinc-200 hover:border-[#C5A059] cursor-pointer" onClick={() => setDressImage(src)} crossOrigin="anonymous" />))}</div></div>
        </div>
    </div>
  );
};

const TravelSection = ({ onView }) => (
    <div className="py-24 bg-white border-t border-neutral-100">
        <SectionTitle title="Honeymoon Escapes" subtitle="Affiliate Travel" />
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">{[{ loc: "Amalfi Coast", price: "$3,200" }, { loc: "Santorini", price: "$2,800" }, { loc: "Maldives", price: "$4,500" }].map((trip, i) => (
            <div key={i} className="group cursor-pointer" onClick={() => onView(trip)}><div className="overflow-hidden relative aspect-video mb-4"><ImageWithFallback src={ASSETS.travel} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Travel" /><div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div><div className="absolute bottom-4 left-4 text-white font-serif text-xl">{trip.loc}</div></div><div className="flex justify-between items-center"><span className="text-xs uppercase tracking-widest text-neutral-500">Starting at {trip.price}</span><span className="text-[#C5A059] text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">View Package <ArrowRight size={12}/></span></div></div>
        ))}</div>
    </div>
);

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
                    <div className="text-center text-[10px] text-neutral-400 flex items-center justify-center gap-1 mt-4"><ShieldCheck size={10}/> 256-bit SSL Encrypted Payment</div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN APP ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [bookingType, setBookingType] = useState(null); 
  const [selectedProduct, setSelectedProduct] = useState(null); 
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
      // If user is authenticated (including VIP/Admin), allow action
      if (user) action();
      else setIsAuthOpen(true);
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
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} onNavigate={handleNavClick} activeTab={activeTab} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onRemove={(i) => {const n=[...cartItems]; n.splice(i,1); setCartItems(n)}} db={db} user={user} appId={appId} addToast={addToast} clearCart={() => setCartItems([])} />
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(p => p.filter(t => t.id !== id))} />
    </div>
  );
}
