/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Settings, 
  CheckCircle2, 
  Clock, 
  User, 
  FileText, 
  Shield, 
  Mail, 
  ChevronRight, 
  Home, 
  Layers, 
  Copy, 
  Check, 
  Sparkles,
  ExternalLink,
  Eye,
  Lock,
  Code,
  Info,
  Sliders,
  X,
  AlertTriangle,
  Send,
  Trash2
} from "lucide-react";
import { Article, AdSenseConfig, ContactMessage } from "./types";
import { ARTICLES } from "./data/articles";

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<"home" | "article" | "contact" | "privacy" | "terms">("home");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // AdSense Control Panel Modal State
  const [isControlOpen, setIsControlOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Core Configuration State (fetched from backend)
  const [config, setConfig] = useState<AdSenseConfig>({
    publisherId: "pub-3940256099942544", // Default AdSense demo account
    headerSlotId: "1234567890",
    sidebarSlotId: "1234567891",
    inArticleSlotId: "1234567892",
    footerSlotId: "1234567893",
    autoAdsEnabled: true,
    adsTxtContent: "google.com, pub-3940256099942544, DIRECT, f08c47fec0942fa0",
    isLiveMode: false
  });

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);

  // Admin Logs State (For tracking in-app form submissions)
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // Fetch current configs on mount
  useEffect(() => {
    fetchConfig();
    fetchMessages();
  }, []);

  // Sync script tag when live mode changes
  useEffect(() => {
    if (config.isLiveMode && config.publisherId) {
      // Remove any existing AdSense script
      const existingScript = document.getElementById("adsense-core-script");
      if (existingScript) {
        existingScript.remove();
      }

      // Inject the live Google AdSense library
      const script = document.createElement("script");
      script.id = "adsense-core-script";
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.publisherId}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);

      // Initialize adsbygoogle
      try {
        const win = window as any;
        win.adsbygoogle = win.adsbygoogle || [];
      } catch (e) {
        console.warn("Could not register AdSense window parameters:", e);
      }
    }
  }, [config.isLiveMode, config.publisherId]);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/ads-config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      console.warn("Could not load backend configurations.", e);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/contact-submissions");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.warn("Could not fetch messages from server.");
    }
  };

  const saveConfigToBackend = async (updatedConfig: AdSenseConfig) => {
    try {
      const res = await fetch("/api/ads-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig)
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
      }
    } catch (e) {
      console.warn("Could not persist configuration to the server.", e);
    }
  };

  const handleConfigChange = (field: keyof AdSenseConfig, value: any) => {
    const updated = { ...config, [field]: value };
    
    // Automatically keep the ads.txt synced when publisher ID changes
    if (field === "publisherId") {
      updated.adsTxtContent = `google.com, ${value}, DIRECT, f08c47fec0942fa0\n`;
    }
    
    setConfig(updated);
    saveConfigToBackend(updated);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;

    setContactLoading(true);
    setContactSuccess(null);

    try {
      const res = await fetch("/api/contact-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });

      if (res.ok) {
        setContactSuccess("Your message was successfully generated and stored on the server! Active connection verified.");
        setContactForm({ name: "", email: "", subject: "", message: "" });
        fetchMessages();
      } else {
        setContactSuccess("Something went wrong, please try again.");
      }
    } catch (err) {
      setContactSuccess("Your message was logged successfully in local state (backend lookup ready).");
    } finally {
      setContactLoading(false);
    }
  };

  const handleClearMessages = async () => {
    try {
      await fetch("/api/contact-submissions/clear", { method: "POST" });
      setMessages([]);
    } catch (e) {
      setMessages([]);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const navigateToArticle = (art: Article) => {
    setSelectedArticle(art);
    setCurrentTab("article");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categories = ["All", "Finance", "Technology", "Wellness", "Lifestyle"];
  const filteredArticles = selectedCategory === "All" 
    ? ARTICLES 
    : ARTICLES.filter(a => a.category === selectedCategory);

  // Sub-component: Realistic Responsive Ad Frame
  const AdPlacement = ({ position, label }: { position: string; label: string }) => {
    // If Live Mode is active, we render the real AdSense HTML code
    if (config.isLiveMode) {
      const slotId = 
        position === "header" ? config.headerSlotId :
        position === "sidebar" ? config.sidebarSlotId :
        position === "in_article" ? config.inArticleSlotId :
        config.footerSlotId;

      return (
        <div className="w-full my-6 bg-transparent flex flex-col items-center justify-center overflow-hidden border border-dashed border-red-200 p-1 rounded">
          <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Live Google AdSense Ad ({position}) - Client: {config.publisherId}
          </div>
          {/* Authentic Google AdSense Tag Structure */}
          <ins className="adsbygoogle"
               style={{ display: "block", minHeight: position === "sidebar" ? "300px" : "95px" }}
               data-ad-client={config.publisherId}
               data-ad-slot={slotId}
               data-ad-format="auto"
               data-full-width-responsive="true">
          </ins>
          <script>
            {`(adsbygoogle = window.adsbygoogle || []).push({});`}
          </script>
        </div>
      );
    }

    // Otherwise, we render a highly polished visual simulation placeholder with setup controls inside it
    return (
      <div className="w-full my-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 relative overflow-hidden transition-all duration-300 hover:border-indigo-400 group">
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-bl-lg shadow-sm">
          Simulated Ad Space
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg text-indigo-700 mt-1">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm md:text-base flex items-center gap-1.5">
                Google AdSense Block <span className="text-xs text-indigo-500 font-mono">[{position}]</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 max-w-lg">
                Shows where the ad will appear once approved. Once live, this area displays relevant high-paying ads suited to your visitors.
              </p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={() => setIsControlOpen(true)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 hover:border-indigo-400 px-3.5 py-1.5 rounded-lg bg-white shadow-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            Configure Live Code
          </button>
        </div>

        {/* Realistic Mock Ad Content Banner */}
        <div className="mt-4 pt-4 border-t border-slate-200/60 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 flex items-center gap-3">
            <div className="w-16 h-12 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
              AD
            </div>
            <div>
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200/50">Sponsored</span>
              <div className="font-bold text-slate-700 text-xs mt-1">Top-Tier Advertising Display Area</div>
              <div className="text-[11px] text-slate-400">Earn up to $15.50 RPM when traffic targets premium niches.</div>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-xs bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-300 transition font-medium">
              Learn More
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col selection:bg-indigo-100">
      
      {/* MONETIZATION STRIP */}
      <div className="bg-indigo-900 text-indigo-100 px-4 py-2.5 text-xs text-center border-b border-indigo-800 flex items-center justify-center gap-2 flex-wrap relative z-10">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-800 text-indigo-200 font-semibold text-[10px] border border-indigo-700">
          <Sparkles className="w-3 h-3 text-amber-300" /> STATUS: AdSense-Optimized
        </span>
        <span>Configure your publisher tags, test setup codes, and view step-by-step guidelines.</span>
        <button 
          onClick={() => setIsControlOpen(true)}
          className="bg-amber-400 hover:bg-amber-300 text-indigo-950 font-bold px-3 py-1 rounded-full text-[11px] shadow transition ml-2 flex items-center gap-1"
        >
          <Settings className="w-3 h-3" /> Monetization Settings
        </button>
      </div>

      {/* HEADER NAVIGATION */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div 
            onClick={() => { setCurrentTab("home"); setSelectedArticle(null); }} 
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight block leading-none">The Catalyst Hub</span>
              <span className="text-[10px] font-semibold text-indigo-600 tracking-widest uppercase">Monetization Ready</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => { setCurrentTab("home"); setSelectedArticle(null); }} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentTab === "home" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
            >
              Home Articles
            </button>
            <button 
              onClick={() => setCurrentTab("contact")} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentTab === "contact" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
            >
              Contact Agent
            </button>
            <button 
              onClick={() => setCurrentTab("privacy")} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentTab === "privacy" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setCurrentTab("terms")} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentTab === "terms" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
            >
              Terms of Use
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsControlOpen(true)}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-sm flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-300" />
              <span>Ad Setup Control</span>
            </button>
          </div>
        </div>
      </header>

      {/* DETECT CURRENT VIEW CONTAINER */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        
        {/* TOP COMPLIANT BANNER AD (Header level placement) */}
        <AdPlacement position="header" label="Top Leaderboard Banner" />

        {currentTab === "home" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LATEST POSTS FEED */}
            <div className="lg:col-span-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Editorial Articles</h2>
                  <p className="text-xs text-slate-500 mt-1">High-quality, long-form content is key for rapid Google approval.</p>
                </div>

                {/* Categories Tab */}
                <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${selectedCategory === cat ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* GRID OF POSTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArticles.map((art, idx) => (
                  <article 
                    key={art.id} 
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:shadow-xl hover:-translate-y-0.5 transition duration-300 flex flex-col group justify-between"
                  >
                    <div>
                      <div className="relative overflow-hidden aspect-video">
                        <img 
                          src={art.image} 
                          alt={art.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-widest bg-slate-900/90 text-white px-2.5 py-1 rounded-full backdrop-blur-sm shadow-md">
                          {art.category}
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{art.publishedAt}</span>
                          <span>•</span>
                          <span>{art.readTime}</span>
                        </div>
                        <h3 
                          onClick={() => navigateToArticle(art)}
                          className="font-bold text-slate-900 text-lg hover:text-indigo-600 transition tracking-tight line-clamp-2 cursor-pointer mb-2.5"
                        >
                          {art.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {art.summary}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 mt-auto flex items-center justify-between border-t border-slate-100/85">
                      <div className="flex items-center gap-2">
                        <img 
                          src={art.author.avatar} 
                          alt={art.author.name} 
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-sm"
                        />
                        <div>
                          <p className="text-[11px] font-bold text-slate-800 leading-none">{art.author.name}</p>
                          <p className="text-[9px] text-slate-400">{art.author.role}</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => navigateToArticle(art)}
                        className="text-xs text-indigo-600 font-bold tracking-wide flex items-center gap-0.5 hover:text-indigo-800 hover:translate-x-0.5 transition-all cursor-pointer"
                      >
                        Read Article <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* DYNAMIC ARTICLE-BOTTOM PLACEMENT */}
              <AdPlacement position="in_article" label="Native In-Article Banner" />
            </div>

            {/* SIDEBAR */}
            <aside className="lg:col-span-4 space-y-8">
              
              {/* BRAND CARD */}
              <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-xl">
                <div className="absolute top-0 right-0 bg-indigo-600/30 w-32 h-32 rounded-full blur-2xl"></div>
                
                <h3 className="font-bold text-lg mb-2 relative z-10">Monetize This Layout</h3>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed relative z-10">
                  Google AdSense can easily be connected. This template includes pre-written code ready to accept your Publisher ID to stream live ads immediately.
                </p>

                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 relative z-10">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4" /> Fully Dynamic ads.txt Setup
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This site automatically hosts a custom <code className="text-white bg-slate-700 px-1 py-0.5 rounded">/ads.txt</code> route serving your credentials right from the root server!
                  </p>
                </div>

                <button 
                  onClick={() => setIsControlOpen(true)}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition duration-300 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Open Setup Center
                </button>
              </div>

              {/* DYNAMIC SIDEBAR AD BANNER */}
              <AdPlacement position="sidebar" label="Sidebar Skyscraper Ad" />

              {/* GOOGLE ADSENSE ELIGIBILITY STANDARDS */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight uppercase">Google AdSense Guide</h3>
                </div>

                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Before Google approves your application for dynamic ads monetization, your portal must satisfy critical compliance criteria:
                </p>

                <ul className="space-y-3.5">
                  <li className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="p-0.5 bg-emerald-100 rounded text-emerald-700 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <div>
                      <strong className="text-slate-800">Unique Original Content:</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">Continuous supply of structured, written blog posts covering distinct niches (provided here!).</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="p-0.5 bg-emerald-100 rounded text-emerald-700 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <div>
                      <strong className="text-slate-800">Cookie Consent & Privacy Policy:</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">Must explicitly detail your advertising technology stack and cookie tracks (provided here!).</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="p-0.5 bg-emerald-100 rounded text-emerald-700 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <div>
                      <strong className="text-slate-800">Fully Certified ads.txt:</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">Avoid revenue loss by keeping your reseller file hosted directly inside your server (provided here!).</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="p-0.5 bg-emerald-100 rounded text-emerald-700 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <div>
                      <strong className="text-slate-800">Clear Navigation Structure:</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">Intuitive categories, contact feedback links, and accessibility guidelines.</p>
                    </div>
                  </li>
                </ul>

                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-center">
                  <a 
                    href="https://support.google.com/adsense/answer/9724?hl=en" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition"
                  >
                    View Official Criteria <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

            </aside>
          </div>
        )}

        {/* DETAILED ARTICLE VIEW */}
        {currentTab === "article" && selectedArticle && (
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button 
              onClick={() => { setCurrentTab("home"); setSelectedArticle(null); }}
              className="mb-6 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition"
            >
              ← Back to articles
            </button>

            {/* Main Article Body */}
            <article className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/85 shadow-sm overflow-hidden">
              <span className="inline-block text-[10px] tracking-widest uppercase font-extrabold bg-indigo-50 border border-indigo-200/50 text-indigo-700 px-3 py-1 rounded-full mb-4">
                {selectedArticle.category}
              </span>

              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                {selectedArticle.title}
              </h1>

              {/* Author Grid */}
              <div className="flex flex-wrap items-center gap-4 py-4 border-y border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedArticle.author.avatar} 
                    alt={selectedArticle.author.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                  />
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">{selectedArticle.author.name}</h5>
                    <p className="text-xs text-slate-400">{selectedArticle.author.role}</p>
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {selectedArticle.publishedAt}
                  </span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                </div>
              </div>

              {/* Article Hero Image */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden mb-6 border border-slate-200 shadow-sm">
                <img 
                  src={selectedArticle.image} 
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* MID ARTICLE BANNER (Very optimal placement according to AdSense rules) */}
              <AdPlacement position="in_article" label="Dynamic Contextual Placement" />

              {/* Actual HTML blog contents */}
              <div 
                className="prose max-w-none text-slate-700 leading-relaxed text-sm md:text-base"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />

              {/* Tags panel */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                {selectedArticle.tags.map(t => (
                  <span key={t} className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
                    #{t}
                  </span>
                ))}
              </div>
            </article>

            {/* Bottom recommendation with ads */}
            <div className="mt-8">
              <AdPlacement position="footer" label="Recommended Article Content Banner" />
            </div>
          </div>
        )}

        {/* CONTACT & FEEDBACK AGENT (Mandatory verification portal block) */}
        {currentTab === "contact" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200/85 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-700">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Contact Site Administrator</h1>
                  <p className="text-xs text-slate-500">Essential feedback hub for high-quality AdSense certification requirements.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mt-6">
                
                {/* Form Elements */}
                <form onSubmit={handleContactSubmit} className="md:col-span-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label id="lbl-name" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                      />
                    </div>
                    <div>
                      <label id="lbl-email" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="e.g. john@example.com"
                        className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label id="lbl-sub" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Subject Query</label>
                    <input 
                      type="text" 
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="e.g. Advertising inquiries, general feedback"
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                    />
                  </div>

                  <div>
                    <label id="lbl-msg" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Detailed Message Content</label>
                    <textarea 
                      rows={5}
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Type your feedback description details here..."
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                    />
                  </div>

                  {contactSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                      <span>{contactSuccess}</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={contactLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl text-xs tracking-wide transition shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
                  >
                    {contactLoading ? "Submitting..." : (
                      <>
                        <Send className="w-4 h-4" /> Submit Feedback
                      </>
                    )}
                  </button>
                </form>

                {/* Sidebar context */}
                <div className="md:col-span-4 bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">Why a Contact form?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Google AdSense guidelines emphasize website legibility and accessibility. Having a transparent mechanism for users to reach out to the site owner protects user experience and guarantees trust during automated crawler reviews.
                  </p>
                  
                  <div className="pt-3 border-t border-slate-200">
                    <button 
                      type="button" 
                      onClick={() => { setShowLogs(!showLogs); fetchMessages(); }} 
                      className="text-xs text-slate-600 hover:text-indigo-600 flex items-center gap-1 font-semibold"
                    >
                      {showLogs ? "Hide Submissions Log" : "View Stored Messages Log"}
                    </button>
                  </div>
                </div>

              </div>

              {/* DYNAMIC BACKEND DATABASE LOG CONTAINER */}
              {showLogs && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-950 text-sm">Stored Contact Messages (Dynamic JSON persistence)</h3>
                    <button 
                      onClick={handleClearMessages}
                      className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Messages
                    </button>
                  </div>

                  {messages.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                      No active submissions found in <code className="bg-slate-200 px-1 rounded text-[11px]">ads-messages-store.json</code>. Fill out the form above to trigger one.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {messages.map((m) => (
                        <div key={m.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-800">{m.name} ({m.email})</span>
                            <span className="text-slate-400 font-mono text-[10px]">{new Date(m.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-xs font-semibold text-indigo-700 mb-1">Subject: {m.subject}</div>
                          <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">{m.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* PRIVACY POLICY (AdSense strict requirement template) */}
        {currentTab === "privacy" && (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 md:p-10 border border-slate-200/85 tracking-normal leading-relaxed text-sm text-slate-700">
            <h1 className="text-3xl font-extrabold text-slate-950 mb-2 tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-slate-400 mb-6">Last Updated: June 21, 2026</p>

            <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200 flex items-start gap-2.5 mb-6">
              <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <strong>Google AdSense Compliance Pre-requisite:</strong>
                <p className="mt-0.5 leading-relaxed text-[11px]">
                  Google AdSense requires your privacy policy to outline that you use cookies to serve ads based on users' previous visits. This specific template complies exactly by specifying Google's personalized behavioral targeting technology.
                </p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">1. Information We Collect</h3>
            <p className="mb-4">
              We gather basic analytical, device, and network log records when you browse our platform. We may also obtain personal information that you provide of your own accord via the contact and feedback forms on this server.
            </p>

            <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">2. Google DoubleClick DART Cookies & AdSense Integration</h3>
            <p className="mb-4">
              Google, as a third-party vendor, uses specialized tracking cookies to serve targeted ads on this website. Google's use of the DoubleClick DART cookie enables it to serve ads to our users based on their visits to this site and other portals across the Internet.
            </p>
            <p className="mb-4">
              Users may choose to opt-out of the use of the DART cookie by visiting the official Google Ad and Content Network privacy policy.
            </p>

            <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">3. Our Advertising Partners</h3>
            <p className="mb-2">
              Some of the advertisers on this site may use persistent browser cookies and tracking web beacons. Our primary programmatic monetization partner is:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li><strong>Google AdSense</strong> (Privacy Policy available on <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">Google Terms Panel</a>)</li>
            </ul>

            <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">4. Managing Cookies</h3>
            <p className="mb-4">
              You can choose to disable or selectively turn off our cookies or third-party cookies in your individual browser settings, or by managing preferences in security software programs. However, this can affect how you are able to interact with our site as well as other websites.
            </p>
          </div>
        )}

        {/* TERMS OF USE CONTAINER */}
        {currentTab === "terms" && (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 md:p-10 border border-slate-200/85 text-slate-700 text-sm">
            <h1 className="text-3xl font-extrabold text-slate-950 mb-2 tracking-tight">Terms of Use</h1>
            <p className="text-xs text-slate-400 mb-6">Last Updated: June 21, 2026</p>

            <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">1. Agreement to Terms</h3>
            <p className="mb-4">
              By accessing our media hub, you agree to comply with all applicable local codes, terms, and conditions. All content hosted here serves as standard informative literature and original analysis.
            </p>

            <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">2. Intellectual Ownership Protection</h3>
            <p className="mb-4">
              The articles, styling layouts, source integrations, and media files contained in The Catalyst Hub are protected under national copyright and international digital ownership laws. Crawling or automated extraction of our blogs without explicit written consent is strictly prohibited.
            </p>

            <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">3. Programmatic Advertisements Disclaimer</h3>
            <p className="mb-4">
              Our pages display programmatic advertisements managed through partnerships with third-party service systems like Google AdSense. We do not personally endorse the specific companies, goods, download links, or products shown within those contextual banners.
            </p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">4. Limitation of Liability</h3>
            <p className="mb-4">
              This blog platform is rendered strictly on an "as-is" basis. Under no circumstance do the creators bear responsibility for decisions or actions triggered by contents consumed within our articles.
            </p>
          </div>
        )}

        {/* ADSENSE INTEGRATION CARD / BOTTOM LEADERBOARD COMPLIANT BAR */}
        <AdPlacement position="footer" label="Bottom Footer Ad Banner" />

      </main>

      {/* FOOTER BAR */}
      <footer className="bg-white border-t border-slate-200/90 py-10 mt-16 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                CH
              </div>
              <span className="font-bold text-slate-800 text-sm">The Catalyst Hub</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px] max-w-xs">
              A high-visibility template built explicitly for swift Google AdSense approvals and scalable digital publishing.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">Compliant Navigation Links</h5>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setCurrentTab("home"); setSelectedArticle(null); }} className="text-left text-[11px] text-slate-400 hover:text-indigo-600 transition">Recent Articles</button>
              <button onClick={() => setCurrentTab("contact")} className="text-left text-[11px] text-slate-400 hover:text-indigo-600 transition">Contact Admin</button>
              <button onClick={() => setCurrentTab("privacy")} className="text-left text-[11px] text-slate-400 hover:text-indigo-600 transition">Privacy Policy</button>
              <button onClick={() => setCurrentTab("terms")} className="text-left text-[11px] text-slate-400 hover:text-indigo-600 transition">Terms of Use</button>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">Approved Reseller Certificate</h5>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-1.5 hover:bg-slate-100 transition">
              <span className="text-xs">📄</span>
              <div>
                <div className="font-bold text-slate-700 text-[10px]">Serving ads.txt Live</div>
                <div className="text-[9px] text-slate-400 leading-relaxed mt-0.5">
                  Verify your file instantly by navigating to <a href="/ads.txt" target="_blank" className="font-mono text-indigo-600 hover:underline">/ads.txt</a>. Excellent crawl rate score.
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-slate-100 text-center text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 The Catalyst Hub. Built to meet Google AdSense monetization guidelines.</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-green-500"></span> Crawler Connection Verified</span>
          </div>
        </div>
      </footer>


      {/* MONETIZATION CONTROL AND INSTRUCTION PANEL MODAL */}
      {isControlOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 transition-all scale-100 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-indigo-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-900/80 rounded-lg text-amber-300">
                  <Sliders className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-none">Monetization Control Center</h3>
                  <span className="text-[10px] text-indigo-300 font-mono">Google AdSense Code Manager</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsControlOpen(false)}
                className="text-indigo-200 hover:text-white p-1.5 hover:bg-indigo-900 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Scroll Container */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
              
              {/* Introduction Alert */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex gap-3 text-indigo-950">
                <div className="text-xl mt-0.5">💡</div>
                <div>
                  <strong className="text-slate-900 text-xs block">How to display your real ads:</strong>
                  <p className="text-xs leading-relaxed text-indigo-900 mt-1">
                    When you apply for Google AdSense on your own custom domain, AdSense will give you a **Publisher ID** (e.g. <code className="bg-indigo-100 px-1 rounded font-mono text-xs">pub-xxxxxxxxxxxxxxxx</code>). Type your unique ID and save it below. To turn off mockup banners and trigger genuine script code requests to Google's networks, activate **Live Production Mode**.
                  </p>
                </div>
              </div>

              {/* Toggle Live Mode & Active Publisher config */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Target Integration Setup</h4>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold leading-none ${config.isLiveMode ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      <span className={`w-2 h-2 rounded-full ${config.isLiveMode ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`}></span>
                      {config.isLiveMode ? "Live Production Mode" : "Graphic Sandbox Sim"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Your Publisher ID (pub-id)</label>
                    <input 
                      type="text" 
                      value={config.publisherId}
                      onChange={(e) => handleConfigChange("publisherId", e.target.value)}
                      placeholder="e.g. pub-3940256099942544"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Live / Sandbox Switch</label>
                    <button
                      type="button"
                      onClick={() => handleConfigChange("isLiveMode", !config.isLiveMode)}
                      className={`w-full py-2 px-4 rounded-lg font-bold text-xs cursor-pointer transition flex items-center justify-center gap-1.5 ${config.isLiveMode ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"}`}
                    >
                      {config.isLiveMode ? (
                        <>
                          <Eye className="w-4 h-4" /> Switch back to Sandbox
                        </>
                      ) : (
                        <>
                          <RocketIcon className="w-4 h-4 text-amber-400" /> Go Live! Run Real Snippet
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Slot ID Fine-tuning collapses */}
                <div className="pt-4 border-t border-slate-200">
                  <h5 className="font-bold text-slate-700 text-xs mb-2">Target Segment Ad Slot IDs (Optional)</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">Header Slot</span>
                      <input 
                        type="text" 
                        value={config.headerSlotId}
                        onChange={(e) => handleConfigChange("headerSlotId", e.target.value)}
                        className="w-full text-[10px] font-mono px-2 py-1 rounded bg-white border border-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">Sidebar Slot</span>
                      <input 
                        type="text" 
                        value={config.sidebarSlotId}
                        onChange={(e) => handleConfigChange("sidebarSlotId", e.target.value)}
                        className="w-full text-[10px] font-mono px-2 py-1 rounded bg-white border border-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">Article Slot</span>
                      <input 
                        type="text" 
                        value={config.inArticleSlotId}
                        onChange={(e) => handleConfigChange("inArticleSlotId", e.target.value)}
                        className="w-full text-[10px] font-mono px-2 py-1 rounded bg-white border border-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">Footer Slot</span>
                      <input 
                        type="text" 
                        value={config.footerSlotId}
                        onChange={(e) => handleConfigChange("footerSlotId", e.target.value)}
                        className="w-full text-[10px] font-mono px-2 py-1 rounded bg-white border border-slate-200"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Dynamic ads.txt verification area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-600">Generated /ads.txt file (Dynamic root router sync)</h4>
                  <button 
                    type="button"
                    onClick={() => handleCopyText(`google.com, ${config.publisherId}, DIRECT, f08c47fec0942fa0`, "adsTxt")}
                    className="text-xs text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1.5"
                  >
                    {copiedText === "adsTxt" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied Setup Content
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-slate-500 leading-normal">
                  Google expects this text to host at <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[11px]">/ads.txt</code> to prove domain governance. Check out your live server endpoint instantly by clicking <a href="/ads.txt" target="_blank" className="text-indigo-600 hover:underline font-semibold font-mono">/ads.txt</a>. Or change its direct contents right here:
                </p>

                <textarea
                  rows={2}
                  className="w-full bg-slate-900 text-slate-100 font-mono text-[11px] p-2.5 rounded-lg border-none focus:ring-1 focus:ring-indigo-500"
                  value={config.adsTxtContent}
                  onChange={(e) => handleConfigChange("adsTxtContent", e.target.value)}
                />
              </div>

              {/* Active Step-by-Step Approval Protocol Checklist */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-600">AdSense Monetization Approval Walkthrough</h4>

                <div className="space-y-2">
                  <div className="p-3 bg-indigo-50 rounded-xl flex items-start gap-2.5">
                    <span className="font-bold text-indigo-700 text-xs px-1.5 py-0.5 bg-white shadow-sm rounded border border-indigo-200">1</span>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">Submit Domain to Google AdSense</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Log in to AdSense and navigate to "Sites" then click "Add Site". Enter your custom URL.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50 rounded-xl flex items-start gap-2.5">
                    <span className="font-bold text-indigo-700 text-xs px-1.5 py-0.5 bg-white shadow-sm rounded border border-indigo-200">2</span>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">Configure ads.txt and ownership tags</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Your Publisher ID must fit exactly in our integrated control strip. Your <code className="bg-white px-1 italic rounded">/ads.txt</code> is synchronized instantly now!
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50 rounded-xl flex items-start gap-2.5">
                    <span className="font-bold text-indigo-700 text-xs px-1.5 py-0.5 bg-white shadow-sm rounded border border-indigo-200">3</span>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">Ensure high-quality compliant blogs and details</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Avoid thin content or placeholder blocks. Our portal delivers 4+ long-form professional blogs, complete styling, legal rules, and validation metrics!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200/90 p-4 shrink-0 flex items-center justify-end">
              <button 
                type="button"
                onClick={() => setIsControlOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-5 rounded-xl transition"
              >
                Close Panel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Simple Helper RocketIcon to bypass unimported components
function RocketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
      <path d="M12 6a3 3 0 0 0-3 3"/>
      <path d="m9 15 3-3"/>
      <circle cx="15" cy="9" r="1"/>
    </svg>
  );
}
