import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  ArrowRight, 
  Star, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Globe, 
  Terminal, 
  Mail, 
  Cpu, 
  Briefcase, 
  Activity, 
  Zap, 
  Leaf, 
  Lock, 
  Check, 
  Menu, 
  X, 
  Info, 
  SlidersHorizontal, 
  TrendingUp, 
  User, 
  CheckCircle,
  FileText,
  BookmarkCheck,
  ShieldAlert,
  ArrowUpRight,
  Share2,
  Trash,
  RefreshCw,
  Factory,
  ShoppingBag,
  ShoppingBasket,
  Building,
  Layers,
  Wrench,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { REPORTS, TEAM, SECTORS } from "./data";
import { Report } from "./types";

export interface AppProps {
  initialTab?: "home" | "library" | "about" | "admin";
  initialReportId?: string;
}

export default function App({ initialTab, initialReportId }: AppProps = {}) {
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<"home" | "library" | "about" | "admin">(() => {
    if (initialTab) return initialTab;
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path.includes("research-library") || path.includes("library")) return "library";
      if (path.includes("about")) return "about";
      if (path.includes("admin")) return "admin";
    }
    return "home";
  });
  
  // Library filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"Most Recent" | "Alphabetical" | "High Conviction">("Most Recent");
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 12;

  // Bookmarks state (saved to localStorage)
  const [savedReportIds, setSavedReportIds] = useState<string[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem("asterion_saved_reports");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [subscribedEmailAddress, setSubscribedEmailAddress] = useState("");
  const [emailConfirmationStatus, setEmailConfirmationStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribers, setSubscribers] = useState<string[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem("asterion_subscribers");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Access requests state
  const [requestName, setRequestName] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestOrg, setRequestOrg] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Admin section state
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("asterion_admin_auth") === "true";
    }
    return false;
  });
  const [adminSubscribers, setAdminSubscribers] = useState<string[]>([]);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminIsLoading, setAdminIsLoading] = useState(false);
  const [adminIsDeleting, setAdminIsDeleting] = useState<string | null>(null);
  const [emailServiceInfo, setEmailServiceInfo] = useState<{
    hasSmtp?: boolean;
    hasResend?: boolean;
    activeProvider?: string;
    fromAddress?: string;
  } | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // Modals state
  const [selectedReport, setSelectedReport] = useState<Report | null>(() => {
    if (initialReportId) {
      return REPORTS.find(r => r.id === initialReportId) || null;
    }
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const match = path.match(/\/reports\/([^\/]+)/);
      if (match) {
        return REPORTS.find(r => r.id === match[1]) || null;
      }
    }
    return null;
  });
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Sync bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem("asterion_saved_reports", JSON.stringify(savedReportIds));
  }, [savedReportIds]);

  // Sync subscribers to localStorage
  useEffect(() => {
    localStorage.setItem("asterion_subscribers", JSON.stringify(subscribers));
  }, [subscribers]);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  // Dynamic SEO Head metadata & Structured Data updater for search engine indexing
  useEffect(() => {
    let title = "Asterion Research | Institutional-Quality Student Equity Research";
    let metaDescription = "Asterion Research is a premier student-founded institutional equity research group at Baldwin Wallace University, delivering professional-grade financial analysis and investment reports.";
    let pageUrl = "https://asterion-research-980127554307.us-west1.run.app/";

    if (selectedReport) {
      title = `${selectedReport.companyName} (${selectedReport.ticker}) Equity Report - ${selectedReport.title} | Asterion Research`;
      metaDescription = selectedReport.summary;
      pageUrl = `https://asterion-research-980127554307.us-west1.run.app/reports/${selectedReport.id}`;
    } else if (currentTab === "library") {
      title = "Research Library | Institutional Equity Reports | Asterion Research";
      metaDescription = "Explore Asterion Research's institutional equity research library featuring in-depth valuation analysis on SoFi Technologies, Meta Platforms, TransMedics, Netflix, Arista Networks, Vertiv, and First Solar.";
      pageUrl = "https://asterion-research-980127554307.us-west1.run.app/research-library";
    } else if (currentTab === "about") {
      title = "About Asterion Research | Baldwin Wallace Equity Research Group";
      metaDescription = "Learn about Asterion Research Group, founded by Baldwin Wallace University finance leaders Ian Palmer and Josh Mullenax, delivering institutional-grade equity analysis.";
      pageUrl = "https://asterion-research-980127554307.us-west1.run.app/about";
    }

    document.title = title;

    // Update Meta Description
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute("content", metaDescription);
    }

    // Update OG & Twitter Meta Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", metaDescription);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", pageUrl);

    const twTitle = document.querySelector('meta[property="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", title);
    const twDesc = document.querySelector('meta[property="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", metaDescription);

    // Update Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", pageUrl);
    }

    // Inject dynamic Report Schema.org JSON-LD if a report is selected
    const existingDynamicScript = document.getElementById("dynamic-seo-schema");
    if (existingDynamicScript) {
      existingDynamicScript.remove();
    }

    if (selectedReport) {
      const script = document.createElement("script");
      script.id = "dynamic-seo-schema";
      script.type = "application/ld+json";
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Report",
        "@id": `${pageUrl}#report`,
        "headline": `${selectedReport.companyName} (${selectedReport.ticker}): ${selectedReport.title}`,
        "name": selectedReport.title,
        "description": selectedReport.summary,
        "datePublished": selectedReport.date,
        "inLanguage": "en-US",
        "author": {
          "@type": "Person",
          "name": selectedReport.author.name,
          "jobTitle": selectedReport.author.role
        },
        "publisher": {
          "@type": "Organization",
          "name": "Asterion Research Group",
          "url": "https://asterion-research-980127554307.us-west1.run.app/"
        },
        "about": {
          "@type": "Corporation",
          "name": selectedReport.companyName,
          "tickerSymbol": selectedReport.ticker
        },
        "mainEntityOfPage": pageUrl
      });
      document.head.appendChild(script);
    }
  }, [selectedReport, currentTab]);

  const handleEmailSignUpClick = () => {
    setCurrentTab("home");
    setTimeout(() => {
      const newsletterSection = document.getElementById("newsletter-email-input");
      if (newsletterSection) {
        newsletterSection.scrollIntoView({ behavior: "smooth", block: "center" });
        newsletterSection.focus();
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }
    }, 150);
  };



  // Show a notification briefly
  const triggerNotification = (message: string) => {
    setShowNotification(message);
    setTimeout(() => {
      setShowNotification(null);
    }, 4000);
  };

  // Toggle bookmark
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (savedReportIds.includes(id)) {
      setSavedReportIds(savedReportIds.filter(savedId => savedId !== id));
      triggerNotification("Report removed from your Library.");
    } else {
      setSavedReportIds([...savedReportIds, id]);
      triggerNotification("Report saved securely to your personal Library.");
    }
  };

  // Subscription submit
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      triggerNotification("Please enter a valid professional email address.");
      return;
    }

    setIsSubmitting(true);
    const targetEmail = newsletterEmail;
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        triggerNotification(data.error || "Subscription failed. Please try again.");
        if (response.status === 409) {
          if (!subscribers.includes(targetEmail)) {
            setSubscribers([...subscribers, targetEmail]);
          }
          setNewsletterSubscribed(true);
          setSubscribedEmailAddress(targetEmail);
          setNewsletterEmail("");
        }
        return;
      }

      const updated = [...subscribers, targetEmail];
      setSubscribers(updated);
      setNewsletterSubscribed(true);
      setSubscribedEmailAddress(targetEmail);
      setEmailConfirmationStatus(data.emailSent ? "sent" : "dispatched");
      setNewsletterEmail("");
      triggerNotification(data.message || `Confirmation email dispatched to ${targetEmail}.`);
    } catch (err) {
      console.error(err);
      // Fallback to offline local behavior
      const updated = [...subscribers, targetEmail];
      setSubscribers(updated);
      setNewsletterSubscribed(true);
      setSubscribedEmailAddress(targetEmail);
      setNewsletterEmail("");
      triggerNotification(`Confirmation email dispatched to ${targetEmail}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Request Access submit
  const handleRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestName || !requestEmail || !requestOrg) {
      triggerNotification("Please fill in all required fields to submit your request.");
      return;
    }
    setRequestSuccess(true);
    triggerNotification("Access request received. An Asterion onboarding director will reach out within 24 hours.");
  };

  // Fetch subscribers list (Admin only)
  const fetchSubscribersList = async (pass = adminPassword) => {
    setAdminIsLoading(true);
    setAdminError(null);
    try {
      const response = await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: pass }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch subscribers list.");
      }
      setAdminSubscribers(data.subscribers || []);
      setIsAdminAuthorized(true);
      localStorage.setItem("asterion_admin_auth", "true");
      localStorage.setItem("asterion_admin_pass", pass);

      // Also check email configuration status
      try {
        const emailStatusRes = await fetch("/api/admin/email-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pass }),
        });
        if (emailStatusRes.ok) {
          const statusData = await emailStatusRes.json();
          setEmailServiceInfo(statusData);
        }
      } catch (e) {
        console.error(e);
      }
    } catch (err: any) {
      setAdminError(err.message || "Failed to fetch subscribers list.");
      setIsAdminAuthorized(false);
      localStorage.removeItem("asterion_admin_auth");
    } finally {
      setAdminIsLoading(false);
    }
  };

  // Attempt login with input password
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubscribersList(adminPassword);
  };

  // Delete a subscriber from server
  const handleDeleteSubscriber = async (emailToDelete: string) => {
    const pass = localStorage.getItem("asterion_admin_pass") || adminPassword;
    if (!pass) return;

    if (!window.confirm(`Are you sure you want to remove ${emailToDelete} from the newsletter database?`)) {
      return;
    }

    setAdminIsDeleting(emailToDelete);
    try {
      const response = await fetch("/api/admin/subscribers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: pass, email: emailToDelete }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete subscriber.");
      }
      setAdminSubscribers(data.subscribers || []);
      triggerNotification("Subscriber successfully removed from database.");
    } catch (err: any) {
      triggerNotification(err.message || "Deletion failed.");
    } finally {
      setAdminIsDeleting(null);
    }
  };

  // Send test confirmation email
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const pass = localStorage.getItem("asterion_admin_pass") || adminPassword;
    if (!pass) return;

    if (!testEmailRecipient || !testEmailRecipient.includes("@")) {
      triggerNotification("Please enter a valid email address for test delivery.");
      return;
    }

    setIsSendingTestEmail(true);
    try {
      const response = await fetch("/api/admin/send-test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass, targetEmail: testEmailRecipient }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to dispatch test email.");
      }
      if (data.result?.sent) {
        triggerNotification(`Test confirmation email successfully sent to ${testEmailRecipient} via ${data.result.service}!`);
      } else {
        triggerNotification(`Email prepared for ${testEmailRecipient}: ${data.result?.service || "No network SMTP configured"}.`);
      }
      setTestEmailRecipient("");
    } catch (err: any) {
      triggerNotification(err.message || "Test dispatch failed.");
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Logout of Admin
  const handleAdminLogout = () => {
    setIsAdminAuthorized(false);
    setAdminPassword("");
    setAdminSubscribers([]);
    localStorage.removeItem("asterion_admin_auth");
    localStorage.removeItem("asterion_admin_pass");
    setCurrentTab("home");
    triggerNotification("Logged out of the administration console.");
  };

  // If already authorized, load on page mount or admin tab entry
  useEffect(() => {
    if (currentTab === "admin" && isAdminAuthorized) {
      const savedPass = localStorage.getItem("asterion_admin_pass");
      if (savedPass) {
        fetchSubscribersList(savedPass);
      }
    }
  }, [currentTab]);



  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let result = [...REPORTS];

    // Search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        r => 
          r.ticker.toLowerCase().includes(query) ||
          r.companyName.toLowerCase().includes(query) ||
          r.title.toLowerCase().includes(query) ||
          r.summary.toLowerCase().includes(query)
      );
    }

    // Saved reports filter
    if (showSavedOnly) {
      result = result.filter(r => savedReportIds.includes(r.id));
    }

    // Sector filter
    if (selectedSector) {
      result = result.filter(r => r.sector.toLowerCase() === selectedSector.toLowerCase() || 
                                 (selectedSector === "Technology" && r.sector === "Information Technology") ||
                                 (selectedSector === "Technology" && r.sector === "Communication Services"));
    }

    // Region filter
    if (selectedRegions.length > 0) {
      result = result.filter(r => selectedRegions.includes(r.region));
    }

    // Rating status filter
    if (selectedRatings.length > 0) {
      result = result.filter(r => selectedRatings.includes(r.ratingStatus));
    }

    // Sorting
    if (sortBy === "Alphabetical") {
      result.sort((a, b) => a.companyName.localeCompare(b.companyName));
    } else if (sortBy === "High Conviction") {
      // Put BUY at top, then HOLD, then SELL
      const weight = { "BUY": 3, "HOLD": 2, "SELL": 1 };
      result.sort((a, b) => weight[b.rating] - weight[a.rating]);
    } else {
      // Most Recent (Default) - sorted by date descending (we use date string logic or custom weights here)
      // Since our dataset has exact dates, we can just map them
      const dateWeight = (dateStr: string) => {
        return new Date(dateStr).getTime() || 0;
      };
      result.sort((a, b) => dateWeight(b.date) - dateWeight(a.date));
    }

    return result;
  }, [searchQuery, selectedSector, selectedRegions, selectedRatings, sortBy, showSavedOnly, savedReportIds]);

  // Paginated reports
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * reportsPerPage;
    return filteredReports.slice(startIndex, startIndex + reportsPerPage);
  }, [filteredReports, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / reportsPerPage));

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSector, selectedRegions, selectedRatings, sortBy, showSavedOnly]);

  // Toggle Region Filter
  const toggleRegion = (region: string) => {
    if (selectedRegions.includes(region)) {
      setSelectedRegions(selectedRegions.filter(r => r !== region));
    } else {
      setSelectedRegions([...selectedRegions, region]);
    }
  };

  // Toggle Rating Filter
  const toggleRating = (rating: string) => {
    if (selectedRatings.includes(rating)) {
      setSelectedRatings(selectedRatings.filter(r => r !== rating));
    } else {
      setSelectedRatings([...selectedRatings, rating]);
    }
  };

  // Actual CSV export trigger
  const downloadCSV = () => {
    const headers = "Ticker,Company,Title,Rating,RatingStatus,Sector,Region,Date,Author,Summary\n";
    const rows = filteredReports.map(r => {
      const escapedCompany = r.companyName.replace(/"/g, '""');
      const escapedTitle = r.title.replace(/"/g, '""');
      const escapedSummary = r.summary.replace(/"/g, '""');
      return `"${r.ticker}","${escapedCompany}","${escapedTitle}","${r.rating}","${r.ratingStatus}","${r.sector}","${r.region}","${r.date}","${r.author.name}","${escapedSummary}"`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Asterion_Research_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification("CSV spreadsheet successfully exported to your local device.");
  };

  // Pre-fill search when header search triggers
  const handleHeaderSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentTab("library");
  };

  // Filter admin subscribers based on search query
  const filteredAdminSubscribers = useMemo(() => {
    if (!adminSubscribers) return [];
    if (!adminSearchQuery.trim()) return adminSubscribers;
    const q = adminSearchQuery.toLowerCase();
    return adminSubscribers.filter(email => email.toLowerCase().includes(q));
  }, [adminSubscribers, adminSearchQuery]);

  // Export subscribers to CSV
  const downloadSubscribersCSV = () => {
    const headers = "EmailAddress\n";
    const rows = adminSubscribers.map(email => `"${email}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Asterion_Subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification("Subscribers list exported as CSV.");
  };

  const openReportOrDrive = (report: Report) => {
    if (report.isComingSoon) {
      setSelectedReport(report);
    } else if (report.driveUrl) {
      window.open(report.driveUrl, "_blank");
    } else {
      setSelectedReport(report);
    }
  };

  // Specific report lookups for the broadsheet front page
  const tmdxEarnings = REPORTS.find(r => r.id === "transmedics-q126-earnings") || REPORTS[0];
  const tmdxMain = REPORTS.find(r => r.id === "transmedics-2024") || REPORTS[1];
  const tmdxDeck = REPORTS.find(r => r.id === "transmedics-presentation") || REPORTS[2];
  const metaReport = REPORTS.find(r => r.id === "meta-presentation-2026") || REPORTS[6];
  const nflxReport = REPORTS.find(r => r.id === "netflix-2024") || REPORTS[3];
  const anetReport = REPORTS.find(r => r.id === "arista-2024") || REPORTS[4];
  const vrtReport = REPORTS.find(r => r.id === "vertiv-2024") || REPORTS[5];
  const fslrReport = REPORTS.find(r => r.id === "first-solar-2024") || REPORTS[6];
  const sofiReport = REPORTS.find(r => r.id === "sofi-equity-report-2026") || REPORTS[7];

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans selection:bg-[#e5e7eb] selection:text-black">
      
      {/* Real-time Status Alert / Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.18 }}
            className="fixed top-16 right-6 z-[100] max-w-sm bg-[#111111] text-white px-4 py-3 border border-[#333333] shadow-lg flex items-center gap-3"
            id="toast-notification"
          >
            <BookmarkCheck className="text-[#a17f3b] shrink-0" size={18} />
            <div className="text-xs font-sans tracking-wide leading-snug">
              {showNotification}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WSJ-Inspired Top Bar (Follows 3-Zone Top Bar Contract) */}
      <header className="sticky top-0 z-50 w-full flex items-center justify-between gap-8 px-6 md:px-12 py-3 bg-[#111111] text-white border-b border-[#2a2a2a]">
        {/* Zone 1: Brand Title (Single text element, one line) */}
        <a
          href="#top"
          onClick={(e) => { e.preventDefault(); setCurrentTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="font-serif text-base md:text-lg font-bold tracking-[0.14em] uppercase text-white whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
          id="nav-logo"
        >
          Asterion Research
        </a>

        {/* Zone 2: 4–5 concise single-line text links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-sans font-medium text-neutral-300">
          <button
            onClick={() => { setCurrentTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className={`whitespace-nowrap shrink-0 transition-colors py-0.5 border-b ${currentTab === "home" ? "text-white border-white font-semibold" : "border-transparent hover:text-white"}`}
            id="tab-home-btn"
          >
            Front Page
          </button>
          <button
            onClick={() => { setCurrentTab("library"); setShowSavedOnly(false); setSelectedSector(null); }}
            className={`whitespace-nowrap shrink-0 transition-colors py-0.5 border-b ${currentTab === "library" && !showSavedOnly ? "text-white border-white font-semibold" : "border-transparent hover:text-white"}`}
            id="tab-library-btn"
          >
            Research Library
          </button>
          <button
            onClick={() => { setCurrentTab("library"); setShowSavedOnly(true); }}
            className={`whitespace-nowrap shrink-0 transition-colors py-0.5 border-b ${currentTab === "library" && showSavedOnly ? "text-white border-white font-semibold" : "border-transparent hover:text-white"}`}
            id="tab-saved-btn"
          >
            Saved ({savedReportIds.length})
          </button>
          <button
            onClick={() => setCurrentTab("about")}
            className={`whitespace-nowrap shrink-0 transition-colors py-0.5 border-b ${currentTab === "about" ? "text-white border-white font-semibold" : "border-transparent hover:text-white"}`}
            id="tab-about-btn"
          >
            About Us
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleEmailSignUpClick}
            className="px-4 py-1.5 bg-white text-[#111111] hover:bg-neutral-200 transition-colors text-[11px] font-sans uppercase tracking-widest font-bold whitespace-nowrap shrink-0"
            id="header-email-signup-btn"
          >
            Subscriber Updates
          </button>
        </div>
      </header>

      {/* WSJ Centerpiece Masthead */}
      <div className="max-w-[1360px] mx-auto px-4 md:px-12 pt-6 pb-4 border-b border-[#111111]">
        <div className="text-center space-y-2">
          <button
            onClick={() => { setCurrentTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#111111] uppercase hover:opacity-90 transition-opacity block mx-auto"
          >
            ASTERION RESEARCH.
          </button>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-sans text-[#555555]">
            <button onClick={() => { setCurrentTab("library"); setShowSavedOnly(false); }} className="hover:text-[#111111] hover:underline">
              Print &amp; PDF Archive
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => setCurrentTab("about")} className="hover:text-[#111111] hover:underline">
              Founders &amp; Analysts
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={downloadCSV} className="hover:text-[#111111] hover:underline">
              CSV Coverage Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <AnimatePresence mode="wait">
        <motion.main 
          key={currentTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="max-w-[1360px] mx-auto px-4 md:px-12 pb-20"
        >
          {/* ========================================================= */}
          {/* TAB 1: HOME PAGE (WSJ FRONT-PAGE BROADSHEET ARCHITECTURE) */}
          {/* ========================================================= */}
          {currentTab === "home" && (
            <div className="pt-4 space-y-12">

              {/* Sub-bar (Mirrors WSJ Topic Bar + Preferred Source Strip) */}
              <div className="border-b border-[#e2e2e2] pb-3 flex items-center justify-between gap-6 text-xs overflow-x-auto no-scrollbar">
                <div className="flex items-center justify-between flex-1 gap-x-4 whitespace-nowrap">
                  <span className="font-sans font-extrabold tracking-tight text-sm uppercase text-[#111111] shrink-0">
                    COVERAGE<span className="text-[#0274B6]">2026</span>
                  </span>
                  <button onClick={() => openReportOrDrive(tmdxEarnings)} className="text-[#333333] hover:text-black hover:underline whitespace-nowrap">
                    TransMedics Q1 Earnings
                  </button>
                  <button onClick={() => openReportOrDrive(tmdxMain)} className="text-[#333333] hover:text-black hover:underline whitespace-nowrap">
                    Organ Care System (OCS)
                  </button>
                  <button onClick={() => openReportOrDrive(metaReport)} className="text-[#333333] hover:text-black hover:underline whitespace-nowrap">
                    Meta Platforms Pitch
                  </button>
                  <button onClick={() => openReportOrDrive(nflxReport)} className="text-[#333333] hover:text-black hover:underline whitespace-nowrap">
                    Netflix Ad-Tier
                  </button>
                  <button onClick={() => openReportOrDrive(sofiReport)} className="text-[#333333] hover:text-black hover:underline whitespace-nowrap">
                    SoFi Technologies (Oct 2026)
                  </button>
                  <button onClick={handleEmailSignUpClick} className="text-[#333333] hover:text-black hover:underline whitespace-nowrap">
                    Newsletter
                  </button>
                </div>

                <button
                  onClick={handleEmailSignUpClick}
                  className="border border-[#111111] px-2.5 py-0.5 text-[11px] text-[#111111] font-semibold hover:bg-[#111111] hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  + Subscribe
                </button>
              </div>

              {/* PRIMARY 3-COLUMN WSJ BROADSHEET FRONT PAGE GRID */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                {/* LEFT COLUMN: Dispatches & Sector Coverage (3 cols) */}
                <div className="lg:col-span-3 lg:border-r lg:border-[#e2e2e2] lg:pr-6 space-y-5 text-left divide-y divide-[#e2e2e2]">
                  
                  {/* Story 1: TransMedics Q1 2026 Earnings */}
                  <article className="pt-0 space-y-2.5">
                    {tmdxEarnings.image && (
                      <div
                        onClick={() => openReportOrDrive(tmdxEarnings)}
                        className="h-16 bg-white border border-[#e2e2e2] px-4 py-2.5 flex items-center justify-center cursor-pointer group"
                      >
                        <img
                          src={tmdxEarnings.image}
                          alt={tmdxEarnings.companyName}
                          referrerPolicy="no-referrer"
                          className="max-h-9 max-w-[85%] w-auto object-contain group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="text-[10px] font-sans uppercase tracking-widest text-[#a17f3b] font-bold">
                      Featured · {tmdxEarnings.rating} / {tmdxEarnings.ratingStatus}
                    </div>
                    <h2
                      onClick={() => openReportOrDrive(tmdxEarnings)}
                      className="font-serif text-lg font-bold leading-snug text-[#111111] hover:text-[#0274B6] cursor-pointer transition-colors"
                    >
                      {tmdxEarnings.companyName} ({tmdxEarnings.ticker}): {tmdxEarnings.title}
                    </h2>
                    <p className="font-sans text-xs text-[#4a4a4a] leading-relaxed">
                      {tmdxEarnings.summary}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] font-sans text-[#737373]">
                      <span>{tmdxEarnings.author.name} · {tmdxEarnings.date}</span>
                      <button
                        onClick={(e) => toggleBookmark(tmdxEarnings.id, e)}
                        className="hover:text-black transition-colors"
                        title="Bookmark Report"
                      >
                        <Bookmark size={13} className={savedReportIds.includes(tmdxEarnings.id) ? "fill-current text-black" : ""} />
                      </button>
                    </div>
                  </article>

                  {/* Story 2: First Solar Pitch Deck */}
                  <article className="pt-5 space-y-2.5">
                    {fslrReport.image && (
                      <div
                        onClick={() => openReportOrDrive(fslrReport)}
                        className="h-16 bg-white border border-[#e2e2e2] px-4 py-2.5 flex items-center justify-center cursor-pointer group"
                      >
                        <img
                          src={fslrReport.image}
                          alt={fslrReport.companyName}
                          referrerPolicy="no-referrer"
                          className="max-h-9 max-w-[85%] w-auto object-contain group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="text-[10px] font-sans uppercase tracking-widest text-[#555555] font-semibold">
                      {fslrReport.sector} · {fslrReport.rating} · Target {fslrReport.targetPrice || "$258.17"}
                    </div>
                    <h2
                      onClick={() => openReportOrDrive(fslrReport)}
                      className="font-serif text-base font-bold leading-snug text-[#111111] hover:text-[#0274B6] cursor-pointer transition-colors"
                    >
                      {fslrReport.companyName} ({fslrReport.ticker}): {fslrReport.title}
                    </h2>
                    <p className="font-sans text-xs text-[#4a4a4a] leading-relaxed">
                      {fslrReport.summary}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] font-sans text-[#737373]">
                      <span>{fslrReport.author.name} · {fslrReport.date}</span>
                      <button
                        onClick={(e) => toggleBookmark(fslrReport.id, e)}
                        className="hover:text-black transition-colors"
                        title="Bookmark Report"
                      >
                        <Bookmark size={13} className={savedReportIds.includes(fslrReport.id) ? "fill-current text-black" : ""} />
                      </button>
                    </div>
                  </article>

                  {/* Story 3: Netflix */}
                  <article className="pt-5 space-y-2.5">
                    {nflxReport.image && (
                      <div
                        onClick={() => openReportOrDrive(nflxReport)}
                        className="h-16 bg-white border border-[#e2e2e2] px-4 py-2.5 flex items-center justify-center cursor-pointer group"
                      >
                        <img
                          src={nflxReport.image}
                          alt={nflxReport.companyName}
                          referrerPolicy="no-referrer"
                          className="max-h-8 max-w-[80%] w-auto object-contain group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="text-[10px] font-sans uppercase tracking-widest text-[#555555] font-semibold">
                      {nflxReport.sector} · {nflxReport.rating} / {nflxReport.ratingStatus}
                    </div>
                    <h2
                      onClick={() => openReportOrDrive(nflxReport)}
                      className="font-serif text-base font-bold leading-snug text-[#111111] hover:text-[#0274B6] cursor-pointer transition-colors"
                    >
                      {nflxReport.companyName} ({nflxReport.ticker}): {nflxReport.title}
                    </h2>
                    <p className="font-sans text-xs text-[#4a4a4a] leading-relaxed">
                      {nflxReport.summary}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] font-sans text-[#737373]">
                      <span>{nflxReport.author.name} · {nflxReport.date}</span>
                      <button
                        onClick={(e) => toggleBookmark(nflxReport.id, e)}
                        className="hover:text-black transition-colors"
                        title="Bookmark Report"
                      >
                        <Bookmark size={13} className={savedReportIds.includes(nflxReport.id) ? "fill-current text-black" : ""} />
                      </button>
                    </div>
                    <div className="pt-1">
                      <button
                        onClick={() => setSelectedReport(nflxReport)}
                        className="text-[11px] font-sans font-semibold text-[#111111] hover:underline flex items-center gap-1"
                      >
                        <span>• Read Executive Thesis &amp; Valuation</span>
                      </button>
                    </div>
                  </article>

                  {/* Story 4: Arista Networks */}
                  <article className="pt-5 space-y-2.5">
                    {anetReport.image && (
                      <div
                        onClick={() => openReportOrDrive(anetReport)}
                        className="h-16 bg-white border border-[#e2e2e2] px-4 py-2.5 flex items-center justify-center cursor-pointer group"
                      >
                        <img
                          src={anetReport.image}
                          alt={anetReport.companyName}
                          referrerPolicy="no-referrer"
                          className="max-h-7 max-w-[80%] w-auto object-contain group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="text-[10px] font-sans uppercase tracking-widest text-red-800 font-semibold">
                      {anetReport.sector} · {anetReport.rating} / {anetReport.ratingStatus}
                    </div>
                    <h2
                      onClick={() => openReportOrDrive(anetReport)}
                      className="font-serif text-base font-bold leading-snug text-[#111111] hover:text-[#0274B6] cursor-pointer transition-colors"
                    >
                      {anetReport.companyName} ({anetReport.ticker}): {anetReport.title}
                    </h2>
                    <p className="font-sans text-xs text-[#4a4a4a] leading-relaxed">
                      {anetReport.summary}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] font-sans text-[#737373]">
                      <span>{anetReport.author.name} · {anetReport.date}</span>
                      <button
                        onClick={(e) => toggleBookmark(anetReport.id, e)}
                        className="hover:text-black transition-colors"
                        title="Bookmark Report"
                      >
                        <Bookmark size={13} className={savedReportIds.includes(anetReport.id) ? "fill-current text-black" : ""} />
                      </button>
                    </div>
                  </article>
                </div>

                {/* CENTER COLUMN: Lead Centerpiece Story & Secondary Split (6 cols) */}
                <div className="lg:col-span-6 lg:border-r lg:border-[#e2e2e2] lg:pr-6 space-y-8 text-left">
                  
                  {/* Lead Centerpiece: TransMedics Organ Care System */}
                  <article className="space-y-4 border-b border-[#e2e2e2] pb-8">
                    {/* Hero Image */}
                    <div
                      onClick={() => setSelectedReport(tmdxMain)}
                      className="w-full bg-white border border-[#e2e2e2] py-12 px-8 flex flex-col items-center justify-center cursor-pointer group"
                    >
                      <img
                        alt={tmdxMain.companyName}
                        referrerPolicy="no-referrer"
                        className="max-h-20 max-w-[80%] w-auto object-contain group-hover:scale-[1.02] transition-transform duration-300"
                        src={tmdxMain.image}
                      />
                    </div>

                    {/* Centered Lead Headline & Deck (Mirrors WSJ Centerpiece) */}
                    <div className="text-center space-y-3 px-2 pt-2">
                      <div className="text-[11px] font-sans uppercase tracking-widest text-[#a17f3b] font-bold">
                        Featured Report · {tmdxMain.sector} · BUY / OVERWEIGHT
                      </div>
                      <h1
                        onClick={() => setSelectedReport(tmdxMain)}
                        className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#111111] leading-tight hover:text-[#0274B6] cursor-pointer transition-colors"
                        style={{ textWrap: "balance" }}
                      >
                        TransMedics: Disrupting Organ Preservation and Logistics
                      </h1>
                      <p className="font-sans text-sm text-[#4a4a4a] leading-relaxed max-w-xl mx-auto">
                        We issue a high-conviction BUY rating for TransMedics (TMDX). Our investment thesis rests on: 1. Competitive Advantage, 2. OCS Kidney, and 3. Europe Expansion.
                      </p>
                      <div className="text-[11px] font-sans text-[#737373] pt-1">
                        By {tmdxMain.author.name} · {tmdxMain.date} · 12-Month Target: $100
                      </div>

                      {/* Primary Document Links (All 3 original TransMedics links preserved) */}
                      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
                        <button
                          onClick={() => window.open("https://drive.google.com/file/d/1eHssoOSVk_XEn9qUOklOVC3GVWBAEnYl/view?usp=sharing", "_blank")}
                          className="px-4 py-2 bg-[#111111] text-white hover:bg-[#333333] transition-colors text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0"
                          id="read-hero-earnings-btn"
                        >
                          Q1 2026 Earnings Review
                          <ArrowUpRight size={13} />
                        </button>
                        <button
                          onClick={() => window.open("https://drive.google.com/file/d/1QjG4TCxj8BbvkmQWPSPjl1CvtcnqhW-T/view?usp=drive_link", "_blank")}
                          className="px-4 py-2 border border-[#111111] text-[#111111] hover:bg-[#f5f5f5] transition-colors text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0"
                          id="read-hero-report-btn"
                        >
                          Full Research Report
                          <ArrowUpRight size={13} />
                        </button>
                        <button
                          onClick={() => window.open("https://drive.google.com/file/d/1-lxKjeh5pv2BhMC59nly47ECnmXKBbNi/view?usp=drive_link", "_blank")}
                          className="px-4 py-2 border border-[#a17f3b] text-[#a17f3b] hover:bg-[#faf6ef] transition-colors text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0"
                          id="read-hero-presentation-btn"
                        >
                          Presentation Deck
                          <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </div>
                  </article>

                  {/* Two-Column Sub-Feature Split Below Centerpiece (Mirrors WSJ Middle Row with 2 side-by-side images) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch border-b border-[#e2e2e2] pb-7">
                    {/* Left Sub-Feature: Meta Platforms */}
                    <article className="space-y-2.5 sm:border-r sm:border-[#e2e2e2] sm:pr-6 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        {metaReport.image && (
                          <div
                            onClick={() => openReportOrDrive(metaReport)}
                            className="h-32 bg-white border border-[#e2e2e2] p-6 flex items-center justify-center cursor-pointer group"
                          >
                            <img
                              src={metaReport.image}
                              alt={metaReport.companyName}
                              referrerPolicy="no-referrer"
                              className="max-h-14 max-w-[85%] w-auto object-contain group-hover:scale-[1.03] transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="text-[10px] font-sans uppercase tracking-widest text-[#555555] font-semibold">
                          Pitch Deck · {metaReport.ticker} · {metaReport.rating}
                        </div>
                        <h3
                          onClick={() => openReportOrDrive(metaReport)}
                          className="font-serif text-lg font-bold leading-snug text-[#111111] hover:text-[#0274B6] cursor-pointer transition-colors"
                        >
                          {metaReport.companyName}: {metaReport.title}
                        </h3>
                        <p className="font-sans text-xs text-[#4a4a4a] leading-relaxed">
                          {metaReport.summary}
                        </p>
                      </div>
                      <div className="pt-2 flex items-center justify-between text-[11px] text-[#737373] tabular-nums">
                        <span>Target: {metaReport.targetPrice} ({metaReport.impliedUpside})</span>
                        <button
                          onClick={() => setSelectedReport(metaReport)}
                          className="text-[#111111] font-semibold hover:underline"
                        >
                          Summary →
                        </button>
                      </div>
                    </article>

                    {/* Right Sub-Feature: SoFi Technologies Coming October 2026 */}
                    <article
                      onClick={() => setSelectedReport(sofiReport)}
                      className="space-y-2.5 flex flex-col justify-between cursor-pointer group"
                    >
                      <div className="space-y-2.5 flex-1 flex flex-col">
                        {sofiReport.image && (
                          <div className="h-32 bg-white border border-[#e2e2e2] p-6 flex items-center justify-center">
                            <img
                              src={sofiReport.image}
                              alt={sofiReport.companyName}
                              referrerPolicy="no-referrer"
                              className="max-h-14 max-w-[85%] w-auto object-contain group-hover:scale-[1.03] transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-sans uppercase tracking-widest text-[#a17f3b] font-bold">
                            {sofiReport.sector} · {sofiReport.ticker}
                          </span>
                          <span className="text-[10px] font-mono text-[#737373]">
                            {sofiReport.date}
                          </span>
                        </div>
                        <h3 className="font-serif text-lg font-bold leading-snug text-[#111111] group-hover:text-[#0274B6] transition-colors">
                          {sofiReport.companyName} ({sofiReport.ticker})
                        </h3>
                        <div className="my-1 py-6 px-4 text-center border border-dashed border-[#c5c6cd] bg-[#fafafa] flex-1 flex flex-col items-center justify-center">
                          <strong className="font-serif text-base text-[#111111]">Coming October 2026</strong>
                          <span className="text-[11px] font-sans text-[#737373] mt-1">
                            Financial Institutions &amp; Fintech Coverage Initiation
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] font-sans text-[#737373] flex items-center justify-between pt-2">
                        <span>{sofiReport.author.name}</span>
                        <span className="text-[#111111] font-semibold group-hover:underline">Notify Me →</span>
                      </div>
                    </article>
                  </div>

                  {/* WSJ-Style Institutional Coverage & Valuation Ledger (Fills lower center broadsheet column) */}
                  <div className="pt-1 space-y-3">
                    <div className="flex items-baseline justify-between border-b border-[#111111] pb-2">
                      <h2 className="font-serif text-xl font-bold text-[#111111]">
                        Active Coverage &amp; Price Target Ledger
                      </h2>
                      <button
                        onClick={() => { setCurrentTab("library"); setShowSavedOnly(false); setSelectedSector(null); }}
                        className="text-[11px] font-sans font-semibold text-[#111111] hover:text-[#0274B6] hover:underline transition-colors"
                      >
                        Full Archive →
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse font-sans text-xs">
                        <thead>
                          <tr className="border-b border-[#e2e2e2] text-[10px] font-sans uppercase tracking-widest text-[#737373] font-bold">
                            <th className="py-2">Company / Ticker</th>
                            <th className="py-2">Sector</th>
                            <th className="py-2">Conviction</th>
                            <th className="py-2 text-right">Target / Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e2e2] tabular-nums">
                          <tr
                            onClick={() => openReportOrDrive(tmdxMain)}
                            className="hover:bg-[#fafafa] cursor-pointer transition-colors group"
                          >
                            <td className="py-2.5 font-serif text-sm font-bold text-[#111111] group-hover:text-[#0274B6] transition-colors">
                              TransMedics Group (TMDX)
                            </td>
                            <td className="py-2.5 font-sans text-xs text-[#4a4a4a]">Healthcare</td>
                            <td className="py-2.5">
                              <span className="text-[10px] font-sans uppercase tracking-widest text-emerald-800 font-bold">
                                BUY · Overweight
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-sans text-xs font-semibold text-[#111111]">
                              $100
                            </td>
                          </tr>
                          <tr
                            onClick={() => openReportOrDrive(metaReport)}
                            className="hover:bg-[#fafafa] cursor-pointer transition-colors group"
                          >
                            <td className="py-2.5 font-serif text-sm font-bold text-[#111111] group-hover:text-[#0274B6] transition-colors">
                              Meta Platforms (META)
                            </td>
                            <td className="py-2.5 font-sans text-xs text-[#4a4a4a]">Technology</td>
                            <td className="py-2.5">
                              <span className="text-[10px] font-sans uppercase tracking-widest text-emerald-800 font-bold">
                                BUY · Overweight
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-sans text-xs font-semibold text-[#111111]">
                              $820.48
                            </td>
                          </tr>
                          <tr
                            onClick={() => openReportOrDrive(nflxReport)}
                            className="hover:bg-[#fafafa] cursor-pointer transition-colors group"
                          >
                            <td className="py-2.5 font-serif text-sm font-bold text-[#111111] group-hover:text-[#0274B6] transition-colors">
                              Netflix, Inc. (NFLX)
                            </td>
                            <td className="py-2.5 font-sans text-xs text-[#4a4a4a]">Technology</td>
                            <td className="py-2.5">
                              <span className="text-[10px] font-sans uppercase tracking-widest text-emerald-800 font-bold">
                                BUY · Overweight
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-sans text-xs font-semibold text-[#111111]">
                              $102.91
                            </td>
                          </tr>
                          <tr
                            onClick={() => openReportOrDrive(fslrReport)}
                            className="hover:bg-[#fafafa] cursor-pointer transition-colors group"
                          >
                            <td className="py-2.5 font-serif text-sm font-bold text-[#111111] group-hover:text-[#0274B6] transition-colors">
                              First Solar, Inc. (FSLR)
                            </td>
                            <td className="py-2.5 font-sans text-xs text-[#4a4a4a]">Energy</td>
                            <td className="py-2.5">
                              <span className="text-[10px] font-sans uppercase tracking-widest text-emerald-800 font-bold">
                                BUY · Overweight
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-sans text-xs font-semibold text-[#111111]">
                              $258.17
                            </td>
                          </tr>
                          <tr
                            onClick={() => setSelectedReport(sofiReport)}
                            className="hover:bg-[#fafafa] cursor-pointer transition-colors group"
                          >
                            <td className="py-2.5 font-serif text-sm font-bold text-[#111111] group-hover:text-[#0274B6] transition-colors">
                              SoFi Technologies (SOFI)
                            </td>
                            <td className="py-2.5 font-sans text-xs text-[#4a4a4a]">Financials</td>
                            <td className="py-2.5">
                              <span className="text-[10px] font-sans uppercase tracking-widest text-[#a17f3b] font-bold">
                                Coming Soon
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-sans text-xs text-[#737373]">
                              Oct 2026
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Opinion / Analyst Commentary & Founders Rail (3 cols) */}
                <div className="lg:col-span-3 space-y-6 text-left">
                  
                  {/* WSJ "Opinion" Style Header */}
                  <div className="border-t-2 border-[#111111] pt-2">
                    <h2 className="font-serif text-xl font-bold text-[#111111] mb-4">
                      Analyst Commentary
                    </h2>

                    <div className="divide-y divide-[#e2e2e2] space-y-4">
                      
                      {/* Opinion Item 1: Josh Mullenax on TransMedics */}
                      <article className="pt-0 pb-4 flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-sans uppercase tracking-widest text-[#a17f3b] font-bold">
                            {TEAM[1].name} · {TEAM[1].title}
                          </div>
                          <h3
                            onClick={() => setSelectedReport(tmdxMain)}
                            className="font-serif text-sm font-bold leading-snug text-[#111111] hover:text-[#0274B6] cursor-pointer transition-colors"
                          >
                            "TransMedics has established itself as a leader within the organ transplant technology market..."
                          </h3>
                          <p className="font-sans text-[11px] text-[#4a4a4a] leading-relaxed">
                            Looking ahead, several growth catalysts could further support upside in the stock, including the launch of OCS Kidney and continued expansion into Europe, assuming management executes effectively on these initiatives. We recommend a buy rating on TransMedics with a target price of $121.71.
                          </p>
                        </div>
                        <img
                          src={TEAM[1].avatar}
                          alt={TEAM[1].name}
                          referrerPolicy="no-referrer"
                          onClick={() => setCurrentTab("about")}
                          className="w-14 h-14 object-cover object-top border border-[#d4d4d4] shrink-0 cursor-pointer"
                        />
                      </article>

                      {/* Opinion Item 2: Ian Palmer on Arista Networks */}
                      <article className="pt-4 pb-4 flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-sans uppercase tracking-widest text-[#a17f3b] font-bold">
                            {TEAM[0].name} · {TEAM[0].title}
                          </div>
                          <h3
                            onClick={() => setSelectedReport(anetReport)}
                            className="font-serif text-sm font-bold leading-snug text-[#111111] hover:text-[#0274B6] cursor-pointer transition-colors"
                          >
                            Why Arista's 84% PVGO &amp; Circular AI Demand Signal Valuation Excess
                          </h3>
                          <p className="font-sans text-[11px] text-[#4a4a4a] leading-relaxed">
                            Trading 54% above historical EV/EBITDA with 84% of its share price tied to future growth expectations, Arista faces downside risk from AI revenue round-tripping, U.S. grid energy constraints, and hyperscaler concentration.
                          </p>
                        </div>
                        <img
                          src={TEAM[0].avatar}
                          alt={TEAM[0].name}
                          referrerPolicy="no-referrer"
                          onClick={() => setCurrentTab("about")}
                          className="w-14 h-14 object-cover object-top border border-[#d4d4d4] shrink-0 cursor-pointer"
                        />
                      </article>

                      {/* Opinion Item 3: Co-Founders on Meta */}
                      <article className="pt-4 pb-4 space-y-1.5">
                        <div className="text-[10px] font-sans uppercase tracking-widest text-[#737373] font-bold">
                          Ian Palmer &amp; Josh Mullenax
                        </div>
                        <h3
                          onClick={() => setSelectedReport(metaReport)}
                          className="font-serif text-sm font-bold leading-snug text-[#111111] hover:text-[#0274B6] cursor-pointer transition-colors"
                        >
                          Meta's Open-Source AI Strategy &amp; 82% Gross Margin Leadership
                        </h3>
                        <p className="font-sans text-[11px] text-[#4a4a4a] leading-relaxed">
                          Blended DCF and public comparables establish an $820.48 target price as Capex intensity peaks in 2026 and normalizes through 2030.
                        </p>
                      </article>

                      {/* Opinion Item 4: Co-Founders on Netflix */}
                      <article className="pt-4 pb-4 space-y-1.5">
                        <div className="text-[10px] font-sans uppercase tracking-widest text-[#737373] font-bold">
                          Ian Palmer &amp; Josh Mullenax
                        </div>
                        <h3
                          onClick={() => setSelectedReport(nflxReport)}
                          className="font-serif text-sm font-bold leading-snug text-[#111111] hover:text-[#0274B6] cursor-pointer transition-colors"
                        >
                          Netflix's 400% Ad-Tier Surge, WBD Win-Win &amp; Buying the Post-Bid Dip
                        </h3>
                        <p className="font-sans text-[11px] text-[#4a4a4a] leading-relaxed">
                          With 80M ad-tier users, an asymmetric win-win on the $82.7B Warner Bros. deal ($5B synergies or a $2.8B breakup fee), and 28% ROIC, we see +35.53% upside to $102.91.
                        </p>
                      </article>

                      {/* Opinion Item 5: Co-Founders on First Solar */}
                      <article className="pt-4 pb-2 space-y-1.5">
                        <div className="text-[10px] font-sans uppercase tracking-widest text-[#737373] font-bold">
                          Ian Palmer &amp; Josh Mullenax
                        </div>
                        <h3
                          onClick={() => setSelectedReport(fslrReport)}
                          className="font-serif text-sm font-bold leading-snug text-[#111111] hover:text-[#0274B6] cursor-pointer transition-colors"
                        >
                          First Solar's CdTe Margin Superiority, U.S. Utility Monopoly &amp; SE Asia Expansion
                        </h3>
                        <p className="font-sans text-[11px] text-[#4a4a4a] leading-relaxed">
                          Proprietary thin-film technology, IRA scale advantages, and tropical climate outperformance in India and Southeast Asia drive our $258.17 DCF target (+32.30% upside).
                        </p>
                      </article>
                    </div>
                  </div>

                  {/* Right Column Feature Card: Baldwin Wallace Campus (User's existing image) */}
                  <div className="border-t border-[#e2e2e2] pt-5 space-y-2.5">
                    <div
                      onClick={() => setCurrentTab("about")}
                      className="overflow-hidden border border-[#e2e2e2] cursor-pointer group"
                    >
                      <img
                        alt="Baldwin Wallace University West Gateway"
                        referrerPolicy="no-referrer"
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0iKe9NZn__BApIBqKEfXTFVJY0yHxVHQQr4IxXSBx3w556lLfD6Pih3MiPScNEd5-olDzTr-jCAykdFJ21jIQtIrHpK76jAmd3cUPAqOv1dEAz6xwIEFdv5SNtGmSdihwH6ykZGr0e-thK8iszI58sf58rxgRIyWgEfF9_rCRTcPVQJNaLwbJhDx-HGl7hmggNLH0ah4gQ_BWvqv_Z_dLNU6cvO9hvKzHW8xUzA2JpWNenSPdpYQDrF6SsyMEaFFiXY0cDWCLHXR8"
                      />
                    </div>
                    <h4
                      onClick={() => setCurrentTab("about")}
                      className="font-serif text-base font-bold leading-snug text-[#111111] hover:text-[#0274B6] cursor-pointer transition-colors"
                    >
                      Inside Asterion Research at Baldwin Wallace University
                    </h4>
                    <p className="font-sans text-xs text-[#4a4a4a] leading-relaxed">
                      Meet Co-Founders Ian Palmer and Josh Mullenax and explore our fundamental valuation methodology.
                    </p>
                  </div>
                </div>
              </section>

              {/* WSJ "Weekly Briefing" Style Newsletter Banner (Mirrors Page 2 Top Banner of PDF) */}
              <section className="border-y-2 border-[#111111] py-8 bg-[#fafafa] px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
                  <div className="lg:col-span-7 space-y-2">
                    <div className="text-[10px] font-sans uppercase tracking-widest text-[#0274B6] font-bold">
                      Your Equity Research Briefing
                    </div>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#111111] tracking-tight">
                      Sign up to receive notifications when we publish a new report
                    </h2>
                    <p className="font-sans text-xs md:text-sm text-[#4a4a4a] leading-relaxed max-w-2xl">
                      Get instant alerts, direct objective quantitative reviews, and conviction adjustments sent straight to your inbox.
                    </p>
                  </div>

                  <div className="lg:col-span-5">
                    {newsletterSubscribed ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-5 bg-white border border-[#111111] space-y-2 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="text-emerald-700" size={20} />
                          <h4 className="font-serif text-base font-bold text-[#111111]">Subscription Confirmed</h4>
                        </div>
                        <p className="font-sans text-xs text-[#4a4a4a] leading-relaxed">
                          A welcome confirmation email has been dispatched to <strong>{subscribedEmailAddress || "your inbox"}</strong>. Please check your inbox for coverage verification.
                        </p>
                        <div className="pt-2 border-t border-[#e2e2e2] flex items-center justify-between text-[11px] font-sans text-[#555555]">
                          <span className="text-emerald-800 font-semibold">Active in Subscriber Registry</span>
                          <button
                            onClick={() => {
                              setNewsletterSubscribed(false);
                              setSubscribedEmailAddress("");
                            }}
                            className="text-[#111111] underline cursor-pointer"
                          >
                            Register another email
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <form
                        onSubmit={handleSubscribe}
                        className="flex flex-col sm:flex-row gap-0 border border-[#111111] bg-white"
                      >
                        <input
                          type="email"
                          required
                          placeholder="Professional Email Address"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          disabled={isSubmitting}
                          className="flex-1 bg-white border-none focus:outline-none px-4 py-3.5 text-xs tracking-wide font-sans disabled:opacity-75"
                          id="newsletter-email-input"
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-[#0274B6] hover:bg-[#01578a] text-white transition-colors px-6 py-3.5 text-[11px] uppercase tracking-widest font-bold shrink-0 whitespace-nowrap disabled:opacity-60"
                          id="newsletter-subscribe-btn"
                        >
                          {isSubmitting ? "Subscribing..." : "Subscribe Now"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: RESEARCH LIBRARY (WSJ ARCHIVE & INDEX VIEW)        */}
          {/* ========================================================= */}
          {currentTab === "library" && (
            <section className="pt-8 text-left space-y-8">
              
              {/* Editorial Section Header */}
              <header className="border-b-2 border-[#111111] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="text-[11px] font-sans uppercase tracking-widest text-[#737373] mb-1">
                    Asterion Research · Institutional Archive
                  </div>
                  <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#111111]">
                    {showSavedOnly ? "My Saved Library" : "Research Library"}
                  </h1>
                  <p className="font-sans text-sm text-[#4a4a4a] max-w-2xl leading-relaxed mt-1">
                    {showSavedOnly 
                      ? "Your curated collection of sovereign reports and conviction insights, persisted locally."
                      : "Access institutional-grade financial intelligence, sector deep-dives, and proprietary equity ratings from our analyst team."}
                  </p>
                </div>

                <button 
                  onClick={downloadCSV}
                  disabled={filteredReports.length === 0}
                  className="px-4 py-2 border border-[#111111] hover:bg-[#111111] hover:text-white transition-colors font-sans text-xs uppercase tracking-wider font-bold flex items-center gap-2 self-start md:self-auto whitespace-nowrap shrink-0 disabled:opacity-40"
                  id="download-csv-btn"
                >
                  <Download size={14} />
                  Download Export (CSV)
                </button>
              </header>

              {/* Broadsheet Archive Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
                
                {/* Left Index Rail */}
                <aside className="space-y-8 lg:border-r lg:border-[#e2e2e2] lg:pr-6">
                  
                  {/* Scope Toggle */}
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-sans tracking-widest uppercase text-[#111111] font-bold border-b border-[#111111] pb-1">
                      Coverage Scope
                    </h3>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <button 
                        onClick={() => setShowSavedOnly(false)}
                        className={`text-left px-3 py-2 text-xs font-sans border transition-colors ${!showSavedOnly ? "bg-[#111111] text-white border-[#111111] font-semibold" : "bg-white text-[#333333] border-[#d4d4d4] hover:border-[#111111]"}`}
                        id="library-scope-all"
                      >
                        All Coverage ({REPORTS.length})
                      </button>
                      <button 
                        onClick={() => {
                          setShowSavedOnly(true);
                          if (savedReportIds.length === 0) {
                            triggerNotification("Bookmark any report to view it here.");
                          }
                        }}
                        className={`text-left px-3 py-2 text-xs font-sans border transition-colors flex items-center justify-between ${showSavedOnly ? "bg-[#111111] text-white border-[#111111] font-semibold" : "bg-white text-[#333333] border-[#d4d4d4] hover:border-[#111111]"}`}
                        id="library-scope-saved"
                      >
                        <span>My Saved Library</span>
                        <span className="tabular-nums font-bold">{savedReportIds.length}</span>
                      </button>
                    </div>
                  </div>

                  {/* Sector Filter */}
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-sans tracking-widest uppercase text-[#111111] font-bold border-b border-[#111111] pb-1">
                      Sector
                    </h3>
                    <ul className="space-y-1.5 font-sans text-xs pt-1">
                      <li>
                        <button 
                          onClick={() => setSelectedSector(null)}
                          className={`flex items-center justify-between w-full text-left py-1 transition-colors ${!selectedSector ? "text-[#111111] font-bold underline underline-offset-4" : "text-[#555555] hover:text-[#111111]"}`}
                        >
                          <span>All Sectors</span>
                          <span className="tabular-nums text-[#737373]">{REPORTS.length}</span>
                        </button>
                      </li>
                      {SECTORS.map(sec => {
                        const liveCount = REPORTS.filter(r => 
                          r.sector.toLowerCase() === sec.name.toLowerCase() || 
                          (sec.name === "Technology" && (r.sector === "Information Technology" || r.sector === "Communication Services"))
                        ).length;

                        return (
                          <li key={sec.name}>
                            <button 
                              onClick={() => setSelectedSector(sec.name)}
                              className={`flex items-center justify-between w-full text-left py-1 transition-colors ${selectedSector === sec.name ? "text-[#111111] font-bold underline underline-offset-4" : "text-[#555555] hover:text-[#111111]"}`}
                            >
                              <span>{sec.name}</span>
                              <span className="tabular-nums text-[#737373]">{liveCount}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Region Filter */}
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-sans tracking-widest uppercase text-[#111111] font-bold border-b border-[#111111] pb-1">
                      Region
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["Americas", "EMEA", "APAC"].map(reg => (
                        <button 
                          key={reg}
                          onClick={() => toggleRegion(reg)}
                          className={`px-2.5 py-1 border text-xs font-sans transition-colors ${selectedRegions.includes(reg) ? "border-[#111111] bg-[#111111] text-white font-semibold" : "border-[#d4d4d4] text-[#555555] hover:border-[#111111]"}`}
                        >
                          {reg}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-sans tracking-widest uppercase text-[#111111] font-bold border-b border-[#111111] pb-1">
                      Current Rating
                    </h3>
                    <div className="space-y-2 pt-1">
                      {["Overweight", "Neutral", "Underweight"].map(label => (
                        <label key={label} className="flex items-center gap-2.5 cursor-pointer font-sans text-xs">
                          <input 
                            type="checkbox"
                            checked={selectedRatings.includes(label)}
                            onChange={() => toggleRating(label)}
                            className="w-3.5 h-3.5 border-[#d4d4d4] text-[#111111] focus:ring-black cursor-pointer"
                          />
                          <span className={selectedRatings.includes(label) ? "font-bold text-[#111111]" : "text-[#333333]"}>
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </aside>

                {/* Main Archive Column */}
                <div className="space-y-6">
                  
                  {/* Filter Status & Sort Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between pb-3 border-b border-[#e2e2e2] text-xs font-sans text-[#555555]">
                    <div className="tabular-nums">
                      Displaying <strong className="text-[#111111]">{filteredReports.length}</strong> of <strong className="text-[#111111]">{REPORTS.length}</strong> institutional reports
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span>Sort By:</span>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-transparent border border-[#d4d4d4] px-2 py-1 text-xs font-sans font-bold text-[#111111] focus:outline-none cursor-pointer"
                        id="sort-select"
                      >
                        <option value="Most Recent">Most Recent</option>
                        <option value="Alphabetical">Alphabetical</option>
                        <option value="High Conviction">High Conviction</option>
                      </select>
                    </div>
                  </div>

                  {/* Broadsheet Report List / Grid */}
                  {paginatedReports.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-[#d4d4d4] space-y-3">
                      <h3 className="font-serif text-xl font-bold text-[#111111]">No Reports Match Your Search</h3>
                      <p className="font-sans text-xs text-[#555555] max-w-sm mx-auto">
                        We could not find any active coverage matches. Try removing some filters or updating your search query.
                      </p>
                      <button 
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedSector(null);
                          setSelectedRegions([]);
                          setSelectedRatings([]);
                          setShowSavedOnly(false);
                        }}
                        className="px-4 py-2 border border-[#111111] hover:bg-[#111111] hover:text-white transition-colors text-xs uppercase font-bold tracking-widest"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-8">
                      {paginatedReports.map((report) => (
                        <article 
                          key={report.id}
                          onClick={() => openReportOrDrive(report)}
                          className="border-t border-[#111111] pt-4 flex flex-col justify-between group cursor-pointer"
                        >
                          <div>
                            {/* Company Visual Banner on Library Cards */}
                            {report.image && (
                              <div className="mb-3 border border-[#e2e2e2] overflow-hidden h-36 flex items-center justify-center bg-white p-5">
                                <img
                                  src={report.image}
                                  alt={report.companyName}
                                  referrerPolicy="no-referrer"
                                  className="max-h-24 max-w-[85%] w-auto h-auto object-contain group-hover:scale-[1.03] transition-transform duration-300"
                                />
                              </div>
                            )}

                            {/* Clean unboxed editorial metadata with · separators */}
                            <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-widest text-[#555555] mb-2">
                              <span className={
                                report.isComingSoon ? "text-[#a17f3b] font-bold" :
                                report.rating === "BUY" ? "text-emerald-800 font-bold" :
                                report.rating === "SELL" ? "text-red-800 font-bold" : "text-[#555555] font-bold"
                              }>
                                {report.isComingSoon ? "COMING OCTOBER 2026" : `${report.rating} · ${report.ratingStatus}`}
                              </span>
                              <span>{report.sector}</span>
                            </div>

                            <h2 className="font-serif text-lg font-bold mb-2 text-[#111111] group-hover:text-[#0274B6] transition-colors leading-snug">
                              {report.isComingSoon 
                                ? `${report.companyName} (${report.ticker})` 
                                : `${report.companyName} (${report.ticker}): ${report.title}`}
                            </h2>
                            
                            {report.isComingSoon ? (
                              <div className="my-3 py-6 text-center border border-dashed border-[#c5c6cd] bg-[#fafafa] flex flex-col items-center justify-center">
                                <strong className="font-serif text-base text-[#111111]">Coming October 2026</strong>
                              </div>
                            ) : (
                              <p className="font-sans text-xs text-[#4a4a4a] mb-5 line-clamp-3 leading-relaxed">
                                {report.summary}
                              </p>
                            )}
                          </div>

                          <div className="pt-3 border-t border-[#e2e2e2] flex items-center justify-between text-[11px] font-sans text-[#737373]">
                            <span>{report.author.name} · {report.date}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReport(report);
                                }}
                                className="text-[11px] font-semibold text-[#111111] hover:underline"
                              >
                                Thesis
                              </button>
                              <button 
                                onClick={(e) => toggleBookmark(report.id, e)}
                                className={`p-1 transition-colors ${savedReportIds.includes(report.id) ? "text-[#111111]" : "text-[#737373] hover:text-[#111111]"}`}
                                title="Save to library"
                              >
                                <Bookmark size={14} className={savedReportIds.includes(report.id) ? "fill-current" : ""} />
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="flex items-center justify-center gap-2 pt-8 border-t border-[#e2e2e2]">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="w-9 h-9 flex items-center justify-center border border-[#d4d4d4] hover:border-[#111111] disabled:opacity-35"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                        <button 
                          key={num}
                          onClick={() => setCurrentPage(num)}
                          className={`w-9 h-9 flex items-center justify-center border font-sans text-xs font-bold tabular-nums ${
                            currentPage === num 
                              ? "bg-[#111111] border-[#111111] text-white" 
                              : "border-[#d4d4d4] hover:border-[#111111] text-[#111111]"
                          }`}
                        >
                          {num}
                        </button>
                      ))}

                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="w-9 h-9 flex items-center justify-center border border-[#d4d4d4] hover:border-[#111111] disabled:opacity-35"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </nav>
                  )}

                </div>
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* TAB 3: ABOUT US (WSJ MASTHEAD & EDITORIAL FEATURE LAYOUT) */}
          {/* ========================================================= */}
          {currentTab === "about" && (
            <div className="pt-8 text-left space-y-14">
              
              {/* Editorial Feature: Our Story */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start border-b border-[#e2e2e2] pb-12">
                <div className="lg:col-span-6 space-y-5">
                  <div className="text-[11px] font-sans uppercase tracking-widest text-[#a17f3b] font-bold">
                    Our Roots · Baldwin Wallace University
                  </div>
                  <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#111111] leading-tight">
                    Our Story
                  </h1>
                  <div className="space-y-4 font-sans text-base text-[#333333] leading-relaxed">
                    <p>
                      Asterion Research was founded by a group of ambitious finance students at Baldwin Wallace University who recognized the gap between academic learning and practical application in financial analysis.
                    </p>
                    <p>
                      Through our participation in numerous equity research competitions and leadership roles in the Investment Club, we developed a true passion for equity research.
                    </p>
                    <p>
                      Today, we are dedicated to providing high quality due diligence of fundamentally undervalued companies through our equity research reports.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-2">
                  <div className="border border-[#d4d4d4] p-2 bg-white">
                    <img 
                      alt="Baldwin Wallace University West Gateway" 
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0iKe9NZn__BApIBqKEfXTFVJY0yHxVHQQr4IxXSBx3w556lLfD6Pih3MiPScNEd5-olDzTr-jCAykdFJ21jIQtIrHpK76jAmd3cUPAqOv1dEAz6xwIEFdv5SNtGmSdihwH6ykZGr0e-thK8iszI58sf58rxgRIyWgEfF9_rCRTcPVQJNaLwbJhDx-HGl7hmggNLH0ah4gQ_BWvqv_Z_dLNU6cvO9hvKzHW8xUzA2JpWNenSPdpYQDrF6SsyMEaFFiXY0cDWCLHXR8" 
                    />
                  </div>
                  <p className="text-xs font-serif italic text-[#737373]">
                    Baldwin Wallace University campus
                  </p>
                </div>
              </section>

              {/* Leadership & Analysts (Mirrors WSJ "People to Know" Editorial Profiles) */}
              <section className="space-y-8">
                <div className="border-t-2 border-[#111111] pt-3">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#111111]">Our Team</h2>
                  <p className="font-sans text-xs text-[#555555] mt-1">
                    The leadership driving our vision for independent, institutional-grade research.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-2">
                  {TEAM.map((member) => (
                    <div key={member.name} className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start border-t border-[#e2e2e2] pt-6">
                      <div className="sm:col-span-5">
                        <div className="aspect-[4/5] overflow-hidden border border-[#d4d4d4] bg-[#fafafa]">
                          <img 
                            alt={member.name} 
                            referrerPolicy="no-referrer"
                            className={`w-full h-full object-cover object-top ${
                              member.name.toLowerCase().includes("josh") ? "scale-[1.06]" : ""
                            }`} 
                            src={member.avatar} 
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-7 space-y-3">
                        <div className="text-[10px] font-sans uppercase tracking-widest text-[#a17f3b] font-bold">
                          {member.role}
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-[#111111]">{member.name}</h3>
                        <p className="font-sans text-xs md:text-sm text-[#333333] leading-relaxed">
                          {member.bio}
                        </p>
                        <div className="pt-2 border-t border-[#e2e2e2]">
                          <a 
                            href={`mailto:${member.email}`} 
                            className="text-xs font-mono text-[#0274B6] hover:underline"
                          >
                            {member.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: ADMIN CONSOLE                                      */}
          {/* ========================================================= */}
          {currentTab === "admin" && (
            <section className="pt-8 text-left space-y-10">
              <header className="border-b-2 border-[#111111] pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <span className="text-[11px] font-sans uppercase tracking-widest text-[#a17f3b] font-bold block mb-1">
                    System Administration
                  </span>
                  <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#111111]">
                    Subscriber Database
                  </h1>
                  <p className="font-sans text-xs md:text-sm text-[#555555] max-w-2xl leading-relaxed mt-1">
                    Access and manage active client subscription registries, email newsletters, and connection hooks.
                  </p>
                </div>
                {isAdminAuthorized && (
                  <button 
                    onClick={handleAdminLogout}
                    className="px-4 py-2 bg-[#111111] text-white hover:bg-[#333333] text-xs font-sans uppercase tracking-widest font-bold shrink-0"
                  >
                    Logout Admin
                  </button>
                )}
              </header>

              {!isAdminAuthorized ? (
                <div className="max-w-md mx-auto bg-white border border-[#d4d4d4] p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-10 h-10 bg-[#111111] text-white flex items-center justify-center mx-auto">
                      <Lock size={18} />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#111111]">Authentication Required</h3>
                    <p className="font-sans text-xs text-[#555555] leading-relaxed">
                      Enter your admin credentials to unlock the institutional subscriber registry.
                    </p>
                  </div>

                  <form onSubmit={handleAdminLogin} className="space-y-4 font-sans">
                    <div>
                      <label className="block text-[10px] font-sans uppercase tracking-widest text-[#555555] font-bold mb-1.5">
                        Admin Password
                      </label>
                      <input 
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••••••••"
                        className="w-full bg-[#fafafa] border border-[#d4d4d4] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#111111]"
                      />
                    </div>

                    {adminError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                        {adminError}
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={adminIsLoading}
                      className="w-full bg-[#111111] hover:bg-[#333333] text-white font-sans text-xs uppercase tracking-widest font-bold py-3 transition-colors disabled:opacity-50"
                    >
                      {adminIsLoading ? "Authenticating..." : "Unlock Registry"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white border border-[#d4d4d4] p-5 text-left">
                      <span className="text-[10px] font-sans uppercase tracking-widest text-[#737373] font-bold block mb-1">
                        Active Subscribers
                      </span>
                      <h4 className="font-serif text-3xl font-bold text-[#111111] tabular-nums">
                        {adminSubscribers.length}
                      </h4>
                      <p className="text-[11px] font-sans text-emerald-700 mt-2">
                        Synchronized with server registry
                      </p>
                    </div>

                    <div className="bg-white border border-[#d4d4d4] p-5 text-left">
                      <span className="text-[10px] font-sans uppercase tracking-widest text-[#737373] font-bold block mb-1">
                        Storage Engine
                      </span>
                      <h4 className="font-serif text-lg font-bold text-[#111111] mt-1 truncate">
                        subscribers.json
                      </h4>
                      <p className="text-[11px] font-sans text-[#555555] mt-3">
                        Root Directory Persistence
                      </p>
                    </div>

                    <div className="bg-white border border-[#d4d4d4] p-5 text-left">
                      <span className="text-[10px] font-sans uppercase tracking-widest text-[#737373] font-bold block mb-1">
                        Confirmation Email Service
                      </span>
                      <h4 className="font-serif text-lg font-bold text-[#111111] mt-1">
                        {emailServiceInfo?.activeProvider || (emailServiceInfo?.hasSmtp ? "SMTP Configured" : emailServiceInfo?.hasResend ? "Resend API" : "Simulated Delivery")}
                      </h4>
                      <p className="text-[11px] font-sans text-emerald-700 mt-3">
                        Automatic welcome &amp; confirmation on signup
                      </p>
                    </div>
                  </div>

                  {/* Test Email Dispatch Panel */}
                  <div className="bg-[#fafafa] border border-[#d4d4d4] p-5 text-left space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#111111] flex items-center gap-2">
                          <Send size={15} className="text-[#a17f3b]" />
                          Test Welcome &amp; Confirmation Email Dispatch
                        </h4>
                        <p className="font-sans text-xs text-[#555555]">
                          Send an instant sample welcome confirmation to verify formatting and deliverability.
                        </p>
                      </div>
                      <span className="font-mono text-[10px] text-[#555555] border border-[#d4d4d4] px-2 py-1 bg-white">
                        From: {emailServiceInfo?.fromAddress || "research@asterion-research.com"}
                      </span>
                    </div>

                    <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                      <input 
                        type="email"
                        required
                        placeholder="Enter recipient email..."
                        value={testEmailRecipient}
                        onChange={(e) => setTestEmailRecipient(e.target.value)}
                        disabled={isSendingTestEmail}
                        className="flex-1 px-3.5 py-2 bg-white border border-[#d4d4d4] text-xs font-sans focus:outline-none focus:border-[#111111]"
                      />
                      <button
                        type="submit"
                        disabled={isSendingTestEmail}
                        className="px-5 py-2 bg-[#111111] hover:bg-[#333333] text-white font-sans text-xs uppercase tracking-wider font-bold shrink-0 disabled:opacity-50"
                      >
                        {isSendingTestEmail ? "Sending..." : "Send Test Brief"}
                      </button>
                    </form>
                  </div>

                  {/* Actions Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#e2e2e2] pb-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" size={15} />
                      <input 
                        type="text"
                        placeholder="Search subscribers by email..."
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-[#d4d4d4] text-xs focus:outline-none focus:border-[#111111]"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => fetchSubscribersList()}
                        disabled={adminIsLoading}
                        className="px-4 py-2 border border-[#d4d4d4] hover:border-[#111111] bg-white text-[#111111] text-xs font-sans uppercase tracking-wider font-bold flex items-center gap-2 disabled:opacity-50"
                      >
                        <RefreshCw size={13} className={adminIsLoading ? "animate-spin" : ""} />
                        Refresh
                      </button>
                      <button 
                        onClick={downloadSubscribersCSV}
                        disabled={adminSubscribers.length === 0}
                        className="px-4 py-2 bg-[#111111] hover:bg-[#333333] text-white text-xs font-sans uppercase tracking-wider font-bold flex items-center gap-2 disabled:opacity-50"
                      >
                        <Download size={13} />
                        Export (CSV)
                      </button>
                    </div>
                  </div>

                  {/* List Container */}
                  {filteredAdminSubscribers.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-[#d4d4d4] space-y-2 bg-white">
                      <h3 className="font-serif text-lg font-bold text-[#111111]">No Subscribers Registered</h3>
                      <p className="font-sans text-xs text-[#555555] max-w-sm mx-auto">
                        There are no emails matching your search or registered on this database yet.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white border border-[#d4d4d4] overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#fafafa] border-b border-[#d4d4d4] text-[10px] font-sans uppercase tracking-widest text-[#555555] font-bold">
                            <th className="px-5 py-3.5">Client Subscriber Email</th>
                            <th className="px-5 py-3.5">Subscription Source</th>
                            <th className="px-5 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e2e2] font-sans text-xs">
                          {filteredAdminSubscribers.map((email) => (
                            <tr key={email} className="hover:bg-[#fafafa]">
                              <td className="px-5 py-3.5 font-medium text-[#111111]">
                                {email}
                              </td>
                              <td className="px-5 py-3.5 text-[#737373]">
                                Newsletter Registration
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <button 
                                  onClick={() => handleDeleteSubscriber(email)}
                                  disabled={adminIsDeleting === email}
                                  className="p-1.5 text-[#737373] hover:text-red-700 transition-colors inline-flex items-center"
                                  title={`Unsubscribe ${email}`}
                                >
                                  <Trash size={14} />
                                  <span className="sr-only">Delete</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

        </motion.main>
      </AnimatePresence>

      {/* WSJ-Inspired Editorial Broadsheet Footer */}
      <footer className="w-full border-t-2 border-[#111111] bg-[#fafafa] px-4 md:px-12 py-10 mt-12 text-left">
        <div className="max-w-[1360px] mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#e2e2e2] pb-6">
            <button
              onClick={() => { setCurrentTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="font-serif text-2xl font-bold tracking-tight text-[#111111] uppercase"
            >
              ASTERION RESEARCH.
            </button>
            <div className="flex flex-wrap gap-6 text-xs font-sans text-[#555555]">
              <button onClick={() => setCurrentTab("home")} className="hover:text-[#111111] hover:underline">Front Page</button>
              <button onClick={() => { setCurrentTab("library"); setShowSavedOnly(false); }} className="hover:text-[#111111] hover:underline">Research Library</button>
              <button onClick={() => setCurrentTab("about")} className="hover:text-[#111111] hover:underline">Our Founders</button>
              <button onClick={() => setCurrentTab("about")} className="hover:text-[#111111] hover:underline">Baldwin Wallace Roots</button>
              <button onClick={handleEmailSignUpClick} className="hover:text-[#111111] hover:underline">Newsletter</button>
              <button onClick={() => setCurrentTab("admin")} className="hover:text-[#111111] hover:underline">Staff Portal</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-sans text-[#737373]">
            <p>© 2026 Asterion Research Group. All rights reserved. Student-founded institutional equity research at Baldwin Wallace University.</p>
            <p className="text-[11px]">For informational &amp; academic purposes only.</p>
          </div>
        </div>
      </footer>

      {/* MODAL: REPORT DETAILED VIEW */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex justify-center items-start p-4 sm:p-10"
            id="report-detail-modal"
          >
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-white border border-[#111111] max-w-4xl w-full p-8 md:p-12 relative text-left shadow-2xl space-y-6 my-8"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedReport(null)}
                className="absolute top-6 right-6 p-2 text-[#737373] hover:text-[#111111] transition-colors"
                id="close-report-modal"
              >
                <X size={20} />
              </button>

              {/* Unboxed Editorial Kicker */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#555555]">
                <span className="font-bold text-[#111111]">
                  {selectedReport.isComingSoon ? "COMING OCTOBER 2026" : `${selectedReport.rating} / ${selectedReport.ratingStatus}`}
                </span>
                <span aria-hidden="true">·</span>
                <span>{selectedReport.sector}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {selectedReport.isComingSoon ? "Target Release: October 2026" : `Published ${selectedReport.date}`}
                </span>
              </div>

              {/* Title & Issuer */}
              <div className="space-y-1.5 border-b-2 border-[#111111] pb-5">
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#111111] leading-tight">
                  {selectedReport.companyName} ({selectedReport.ticker})
                </h2>
                {!selectedReport.isComingSoon && (
                  <h3 className="text-base sm:text-lg font-serif text-[#555555] italic">
                    {selectedReport.title}
                  </h3>
                )}
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Report Prose or Minimalist Coming October 2026 Box */}
                <div className="lg:col-span-8 space-y-5 font-sans text-sm sm:text-base text-[#111111] leading-relaxed">
                  {selectedReport.image && (
                    <div className="border border-[#e2e2e2] overflow-hidden bg-white p-6 flex items-center justify-center">
                      <img
                        src={selectedReport.image}
                        alt={selectedReport.companyName}
                        referrerPolicy="no-referrer"
                        className="max-h-44 max-w-[85%] w-auto h-auto object-contain"
                      />
                    </div>
                  )}
                  {selectedReport.isComingSoon ? (
                    <div className="py-12 px-8 text-center border border-dashed border-[#c5c6cd] bg-[#fafafa] flex flex-col items-center justify-center">
                      <h3 className="text-2xl font-serif font-bold text-[#111111]">Coming October 2026</h3>
                    </div>
                  ) : (
                    <>
                      {selectedReport.fullContent ? (
                        selectedReport.fullContent.map((para, i) => (
                          <p key={i} className={i === 0 ? "first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:leading-none" : ""}>
                            {para}
                          </p>
                        ))
                      ) : (
                        <p>{selectedReport.summary}</p>
                      )}

                      {/* Quantitative Metric Callout */}
                      <div className="bg-[#fafafa] border-y border-[#111111] py-4 px-5 space-y-3 font-sans">
                        <h4 className="text-[10px] font-sans uppercase tracking-widest text-[#111111] font-bold">
                          Valuation &amp; Target Summary
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-center tabular-nums">
                          <div className="border-r border-[#e2e2e2] pr-2">
                            <span className="block text-[10px] font-sans text-[#737373] uppercase">Target Price</span>
                            <strong className="text-lg font-serif text-[#111111]">
                              {selectedReport.targetPrice || (
                                selectedReport.ticker === "TMDX" ? "$100" :
                                selectedReport.ticker === "NFLX" ? "$102.91" :
                                selectedReport.ticker === "FSLR" ? "$258.17" :
                                selectedReport.ticker === "ANET" ? "$86.23" :
                                selectedReport.ticker === "VRT" ? "$196.44" :
                                selectedReport.ticker === "META" ? "$820.48" : "$258.17"
                              )}
                            </strong>
                          </div>
                          <div className="border-r border-[#e2e2e2] pr-2">
                            <span className="block text-[10px] font-sans text-[#737373] uppercase">
                              Implied Upside
                            </span>
                            <strong className={`text-lg font-serif ${selectedReport.rating === "SELL" ? "text-red-700" : "text-emerald-700"}`}>
                              {selectedReport.impliedUpside || (
                                selectedReport.ticker === "TMDX" ? "+38%" :
                                selectedReport.ticker === "NFLX" ? "+35.53%" :
                                selectedReport.ticker === "FSLR" ? "+32.30%" :
                                selectedReport.ticker === "ANET" ? "-32.9%" :
                                selectedReport.ticker === "VRT" ? "Wait for $164 Entry" :
                                selectedReport.ticker === "META" ? "+21.55%" : "+32.30%"
                              )}
                            </strong>
                          </div>
                          <div>
                            <span className="block text-[10px] font-sans text-[#737373] uppercase">Horizon</span>
                            <strong className="text-lg font-serif text-[#111111]">
                              12 Months
                            </strong>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Right: Issuing Analyst & Actions */}
                <div className="lg:col-span-4 bg-[#fafafa] border border-[#d4d4d4] p-5 space-y-5">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-sans uppercase tracking-widest text-[#737373] font-bold border-b border-[#e2e2e2] pb-1.5">
                      Issuing Analyst
                    </h4>
                    <div className="flex items-center gap-3">
                      {selectedReport.author.avatar ? (
                        <img 
                          src={selectedReport.author.avatar} 
                          alt={selectedReport.author.name} 
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 object-cover border border-[#d4d4d4]"
                        />
                      ) : (
                        <div className="w-11 h-11 bg-[#111111] text-white flex items-center justify-center font-serif text-sm font-bold">
                          {selectedReport.author.name.split("&").map(n => n.trim().charAt(0)).join("").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h5 className="font-sans text-xs font-bold text-[#111111]">{selectedReport.author.name}</h5>
                        <p className="text-[10px] font-sans text-[#555555] uppercase tracking-wider">{selectedReport.author.role}</p>
                      </div>
                    </div>
                    <p className="text-xs font-sans text-[#4a4a4a] leading-relaxed">
                      {selectedReport.author.bio}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#e2e2e2]">
                    {selectedReport.driveUrl && (
                      <a 
                        href={selectedReport.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#111111] text-white hover:bg-[#333333] transition-colors text-xs font-sans uppercase tracking-wider font-bold text-center"
                      >
                        <ArrowUpRight size={14} />
                        Open Full PDF / Deck
                      </a>
                    )}
                    {selectedReport.isComingSoon && (
                      <button 
                        onClick={() => {
                          setSelectedReport(null);
                          handleEmailSignUpClick();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0274B6] text-white hover:bg-[#01578a] transition-colors text-xs font-sans uppercase tracking-wider font-bold text-center"
                      >
                        <Mail size={14} />
                        Notify Me When Published
                      </button>
                    )}
                    <button 
                      onClick={() => toggleBookmark(selectedReport.id)}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 border text-xs font-sans uppercase tracking-wider font-bold transition-colors ${
                        savedReportIds.includes(selectedReport.id) 
                          ? "bg-[#111111] border-[#111111] text-white" 
                          : "border-[#111111] text-[#111111] hover:bg-neutral-100"
                      }`}
                    >
                      <Bookmark size={13} className={savedReportIds.includes(selectedReport.id) ? "fill-current" : ""} />
                      {savedReportIds.includes(selectedReport.id) ? "Saved in Library" : "Bookmark Report"}
                    </button>

                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        triggerNotification("Report link copied to clipboard.");
                      }}
                      className="w-full py-2.5 border border-[#d4d4d4] hover:border-[#111111] transition-colors text-xs font-sans uppercase tracking-wider text-[#111111] font-bold bg-white flex items-center justify-center gap-2"
                    >
                      <Share2 size={13} />
                      Share Link
                    </button>
                  </div>
                </div>

              </div>

              {/* Disclaimer */}
              <div className="text-[11px] font-sans text-[#737373] border-t border-[#e2e2e2] pt-4 leading-relaxed">
                DISCLOSURE: All reports are for informational and academic purposes only and do not constitute investment advice or trading orders. Asterion Research Group is a student-founded equity research organization at Baldwin Wallace University.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

