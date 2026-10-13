import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  FileText, 
  RotateCcw, 
  Truck, 
  Printer, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ChevronRight,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  Lock,
  CreditCard,
  Package,
  Building2,
  ArrowRight,
  HeartHandshake,
  AlertTriangle,
  Scale
} from 'lucide-react';
import ClothDoodlesBackground from '../components/ui/ClothDoodlesBackground';

const TABS = [
  { 
    id: 'terms', 
    label: 'Terms & Services', 
    path: '/terms-conditions', 
    badge: 'Legal Agreement',
    color: '#D32F2F',
    icon: FileText,
    subtitle: 'Store usage, order contracts, size tolerances & court jurisdiction'
  },
  { 
    id: 'privacy', 
    label: 'Privacy Policy', 
    path: '/privacy-policy', 
    badge: 'DPDP Act 2023',
    color: '#00A3E0',
    icon: ShieldCheck,
    subtitle: 'Data protection, payment encryption, zero-spam & user rights'
  },
  { 
    id: 'refund', 
    label: 'Refund & Cancellation', 
    path: '/refund-policy', 
    badge: '7-Day Return',
    color: '#10B981',
    icon: RotateCcw,
    subtitle: 'Doorstep pickup, size exchanges, bank timelines & RQC process'
  },
  { 
    id: 'shipping', 
    label: 'Shipping & Delivery', 
    path: '/shipping-policy', 
    badge: '19,000+ Pincodes',
    color: '#FF6B00',
    icon: Truck,
    subtitle: 'Pan-India logistics, zone schedules, live tracking & RTO rules'
  },
];

const FAQS = {
  terms: [
    {
      q: 'Are all prices listed on the site inclusive of taxes?',
      a: 'Yes, all retail prices on Jog & Joy are quoted in Indian National Rupees (INR - ₹) and include all applicable Goods & Services Tax (GST) under Central and Gujarat State statutes.'
    },
    {
      q: 'Can I cancel or modify my order after placing it?',
      a: 'You can cancel your order free of charge at any point prior to warehouse courier dispatch by contacting our support desk via call or WhatsApp at +91 94299 05118.'
    },
    {
      q: 'Which jurisdiction applies to any legal disputes?',
      a: 'Any disputes arising out of purchases, contracts, or platform usage fall under the exclusive jurisdiction of the competent courts and consumer commissions in Ahmedabad, Gujarat, India.'
    },
    {
      q: 'What is the standard tolerance on kids garment measurements?',
      a: 'Because children grow rapidly and garments are handcrafted, an industry-standard sewing tolerance of ±0.5 inches (1.27 cm) across chest, length, and waist measurements is standard and normal.'
    }
  ],
  privacy: [
    {
      q: 'Do you store my Credit/Debit card numbers or UPI PIN?',
      a: 'Never. All online payments are handled directly by RBI-licensed payment aggregator Razorpay with 256-bit bank-grade SSL encryption. We never see, store, or log your card numbers, CVV, or UPI PINs.'
    },
    {
      q: 'Will my personal details or phone number be shared with telemarketers?',
      a: 'No. We enforce a strict zero-data-monetization policy. Your contact details are strictly used for order confirmations, courier delivery tracking alerts, and customer support.'
    },
    {
      q: 'How can I request deletion of my account or data?',
      a: 'You can email our Grievance Officer at jogjoy85@gmail.com with your registered email, and your profile data will be permanently purged within 48 hours.'
    },
    {
      q: 'Is my child’s personal information stored or used for profiling?',
      a: 'No. We do not knowingly collect personal data directly from children under 18. All purchases must be completed by a parent or legal guardian.'
    }
  ],
  refund: [
    {
      q: 'How long does the refund take to show in my bank account?',
      a: 'For online prepaid orders (UPI/Cards), refunds are processed via Razorpay and take 5 to 7 business days to reflect in your source account. For COD orders, transfers via NEFT/IMPS take 3 to 5 business days after bank details submission.'
    },
    {
      q: 'Do I have to pay for return shipping or reverse pickups?',
      a: 'No! For any defective, damaged, or incorrectly sized garment, we arrange free doorstep courier pickup at zero additional charge to you.'
    },
    {
      q: 'What if my child needs a size exchange instead of a refund?',
      a: 'We gladly offer hassle-free size exchanges within 7 days of delivery. Subject to stock availability, our team will dispatch the new size immediately upon reverse pickup.'
    },
    {
      q: 'What items cannot be returned for hygiene reasons?',
      a: 'Undergarments, innerwear, socks, stockings, and items with missing tags or visible signs of wear/wash cannot be returned.'
    }
  ],
  shipping: [
    {
      q: 'How soon will my order be dispatched?',
      a: 'All orders are quality-checked, steam-ironed, and dispatched from our Ahmedabad fulfillment facility within 24 to 48 business hours (Mon-Sat).'
    },
    {
      q: 'How do I track my active courier shipment?',
      a: 'As soon as your package is dispatched, we send an SMS and email with your AWB tracking link. You can also visit our Track Order page at any time to monitor your parcel in real time.'
    },
    {
      q: 'Do you ship to remote areas and North-Eastern states?',
      a: 'Yes, we cover over 19,000+ pincodes across all 28 states and union territories in India via premier partners like BlueDart, Delhivery, and India Post.'
    },
    {
      q: 'What happens if a parcel arrives damaged or tampered?',
      a: 'Do not accept the parcel, or note "Delivered in Damaged Condition" on the courier receipt and notify us within 24 hours. We will send an immediate fresh replacement parcel at zero cost.'
    }
  ]
};

export default function PoliciesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('terms');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('privacy')) setActiveTab('privacy');
    else if (path.includes('refund')) setActiveTab('refund');
    else if (path.includes('shipping')) setActiveTab('shipping');
    else setActiveTab('terms');
    setOpenFaq(null);
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab.id);
    navigate(tab.path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentTabObj = TABS.find(t => t.id === activeTab) || TABS[0];

  return (
    <div className="bg-[#FFFDF9] min-h-screen font-sans text-slate-800 relative overflow-hidden pb-24 selection:bg-[#FFECD1] selection:text-[#D32F2F]">
      
      {/* Background Playful Doodles */}
      <ClothDoodlesBackground />

      {/* Top Breadcrumb & Hero */}
      <section className="relative pt-28 sm:pt-32 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-200/70 bg-gradient-to-b from-[#FFF8EC] via-[#FFFDF9] to-[#FFFDF9]">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          
          {/* Clean Text Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-[#D32F2F] transition-colors">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">Store Policies</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">{currentTabObj.label}</span>
          </nav>

          <motion.div
            key={activeTab + "-title"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-3"
          >
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
              {activeTab === 'terms' && <>Terms & <span className="text-[#D32F2F]">Conditions</span></>}
              {activeTab === 'privacy' && <>Privacy & <span className="text-[#00A3E0]">Data Protection</span></>}
              {activeTab === 'refund' && <>Refund & <span className="text-emerald-600">Cancellation Policy</span></>}
              {activeTab === 'shipping' && <>Shipping & <span className="text-[#FF6B00]">Delivery Policy</span></>}
            </h1>
            
            <p className="text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
              {currentTabObj.subtitle}. Formulated under Indian E-Commerce laws, IT Act 2000, and Reserve Bank of India consumer security frameworks.
            </p>
          </motion.div>

        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">

        {/* 4 Interactive Tab Selector Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab)}
                className={`p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between cursor-pointer border ${
                  isActive
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    isActive ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-700'
                  }`}>
                    <Icon className="w-5 h-5" style={{ color: isActive ? '#fff' : tab.color }} />
                  </div>
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider ${
                    isActive ? 'text-amber-300' : 'text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                </div>
                <div>
                  <h3 className={`font-black text-xs sm:text-sm leading-snug ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {tab.label}
                  </h3>
                  <p className={`text-[11px] font-medium mt-0.5 line-clamp-1 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    Click to view full clauses
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/80">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">{currentTabObj.label}</h2>
            <p className="text-xs text-slate-500 font-medium">Comprehensive corporate policy document • Updated October 2026</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/policies/${
                activeTab === 'terms' ? 'Terms_and_Conditions_Jog_and_Joy.pdf' :
                activeTab === 'privacy' ? 'Privacy_Policy_Jog_and_Joy.pdf' :
                activeTab === 'refund' ? 'Refund_and_Cancellation_Policy_Jog_and_Joy.pdf' :
                'Shipping_and_Delivery_Policy_Jog_and_Joy.pdf'
              }`}
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-sm transition-all"
              title="Download official PDF file"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
            
            <a
              href="/policies/Jog_and_Joy_Complete_Store_Policies.pdf"
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-colors"
              title="Download all 4 policies in one complete PDF"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>All-In-One Master PDF</span>
            </a>
          </div>
        </div>

        {/* POLICY CONTENT CARD CONTAINER */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm border border-slate-200/90 relative overflow-hidden">

          <AnimatePresence mode="wait">

            {/* TAB 1: TERMS & SERVICES */}
            {activeTab === 'terms' && (
              <motion.div
                key="terms-content"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Visual Highlight Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-red-50/60 border border-red-100 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Official INR Pricing</h4>
                      <p className="text-xs text-slate-600 mt-1">All catalog prices inclusive of GST under Central & Gujarat State GST codes.</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#00A3E0] text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">JOG & JOY® Brand</h4>
                      <p className="text-xs text-slate-600 mt-1">Protected trademark of Jog & Joy (Jainam Products). Authentic designs and apparel.</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Ahmedabad Courts</h4>
                      <p className="text-xs text-slate-600 mt-1">Governed strictly under Indian legal codes and Ahmedabad jurisdiction.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      1. Introduction & Electronic Record Disclosure
                    </h3>
                    <p>
                      This electronic document is published in accordance with the provisions of Rule 3(1) of the <strong>Information Technology (Intermediaries Guidelines) Rules, 2011</strong>. This platform is owned and operated by <strong>Jainam Products</strong> (brand <strong>JOG & JOY®</strong>), having its registered operational headquarters at <strong>2488, Navo Vas, Swaminarayan Mandir, Kalupur, Ahmedabad, Gujarat-24, India</strong>.
                    </p>
                    <p>
                      By accessing or transacting on this storefront, you accept and agree to be bound by these Terms and Conditions along with our associated Privacy, Refund, and Shipping policies.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      2. User Eligibility & Contractual Competency
                    </h3>
                    <p>
                      Use of this platform is available solely to persons who can enter into legally binding contracts under the <strong>Indian Contract Act, 1872</strong>. Minors under 18 years of age may browse and select products only under the supervision of a parent or guardian who will execute the commercial transaction.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      3. Sizing Guides, Fabric Specifications & Sizing Tolerances
                    </h3>
                    <p>
                      We strive to display garment fabrics, GSM, color accuracy, and age-appropriate fit charts as accurately as technically feasible. Due to screen calibration differences, slight color tone variances may occur. Because garments are handcrafted, an industry-standard tolerance of <strong>±0.5 inches (1.27 cm)</strong> in sewing measurements is commercially standard.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      4. Pricing, GST Invoicing & Clerical Errors
                    </h3>
                    <p>
                      All prices are quoted in <strong>Indian National Rupees (INR - ₹)</strong> and include all applicable Goods & Services Tax (GST). If an item is listed at an incorrect price due to a technical error, the Company reserves the right to decline the order and issue an immediate 100% full refund of the amount debited.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      5. Order Acceptance, Reselling Restrictions & Fraud Safeguards
                    </h3>
                    <p>
                      The sales contract is concluded only when items are packed and handed over to our courier carrier. The Company reserves the right to cancel orders suspected of commercial bulk reselling, bot-assisted purchases, incomplete address details, or flagged by payment gateways as high-risk.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      6. Secure Digital Payments & RBI Tokenization
                    </h3>
                    <p>
                      All online payment transactions are processed securely through <strong>Razorpay Software Private Limited</strong> (RBI-authorized Payment Aggregator) with 256-bit SSL encryption. We never store credit/debit card numbers, CVVs, or UPI MPINs on our servers.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      7. Intellectual Property & Brand Trademark Protection
                    </h3>
                    <p>
                      The trademark <strong>JOG & JOY®</strong>, brand logos, graphic designs, garment illustrations, slogan (*"Love is in the wear"*), and web code are the exclusive intellectual property of Jog & Joy / Jainam Products under the Indian Trade Marks Act 1999 and Copyright Act 1957.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      8. Limitation of Liability & Force Majeure
                    </h3>
                    <p>
                      In no event shall Jog & Joy / Jainam Products' aggregate financial liability exceed the total purchase price paid for the specific item in dispute. Neither party shall be liable for delivery disruptions resulting from acts of God, transit strikes, lockdowns, or severe weather anomalies.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      9. Governing Law & Exclusive Court Jurisdiction
                    </h3>
                    <p>
                      These Terms are governed by and construed in accordance with the substantive laws of India. Any legal dispute, arbitration, or proceeding shall be subject to the exclusive jurisdiction of the competent courts in <strong>Ahmedabad, Gujarat, India</strong>.
                    </p>
                  </section>
                </div>
              </motion.div>
            )}

            {/* TAB 2: PRIVACY POLICY */}
            {activeTab === 'privacy' && (
              <motion.div
                key="privacy-content"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Visual Highlight Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#00A3E0] text-white flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Bank-Grade Encryption</h4>
                      <p className="text-xs text-slate-600 mt-1">256-bit SSL secure checkout. Zero storage of card CVV or UPI MPINs.</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Zero Data Selling</h4>
                      <p className="text-xs text-slate-600 mt-1">Strict zero-spam policy. We never rent or monetize customer numbers or emails.</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">DPDP Act 2023</h4>
                      <p className="text-xs text-slate-600 mt-1">Full compliance with Indian digital privacy and child data safeguards.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      1. Categories of Personal Data Collected
                    </h3>
                    <p>At <strong>Jog & Joy</strong> (operated by <strong>Jainam Products</strong>), to deliver quality activewear to your doorstep and keep you updated on shipments, we collect:</p>
                    <ul className="list-disc pl-6 space-y-1 text-slate-600">
                      <li><strong>Personal Identification:</strong> Full Name, Email Address, and Mobile/WhatsApp Contact.</li>
                      <li><strong>Delivery Destination:</strong> Complete Residential/Office Address, Landmark, City, State, and Pincode.</li>
                      <li><strong>Transaction Records:</strong> Ordered sizes, quantities, order totals, and payment method selected.</li>
                      <li><strong>Payment Security:</strong> All card credentials and UPI authentications are processed directly via Razorpay. We do not store your credit/debit card numbers, CVVs, or UPI PINs.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      2. Legal Grounds & Utilization of Information
                    </h3>
                    <p>Customer data is used strictly for legitimate contractual and service purposes:</p>
                    <ul className="list-disc pl-6 space-y-1 text-slate-600">
                      <li>Processing orders, packaging garments, and scheduling delivery via verified courier partners.</li>
                      <li>Transmitting automated SMS, WhatsApp, and Email alerts with live AWB tracking links.</li>
                      <li>Managing returns, doorstep pickups, and issuing timely refunds.</li>
                      <li>Complying with statutory GST tax invoice retention mandates under Indian law.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      3. Sharing with Logistics & Courier Carriers
                    </h3>
                    <p>
                      Your delivery address and phone number are shared solely with registered logistics carriers (Delhivery, BlueDart, Xpressbees, India Post) to enable doorstep delivery. We do not sell or monetize personal information.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      4. User Rights under the DPDP Act, 2023
                    </h3>
                    <p>
                      You are entitled to request access to your stored personal data, request correction of inaccurate details, withdraw consent, or request complete account erasure by contacting our support desk.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      5. Nodal Grievance Redressal Officer
                    </h3>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold space-y-1 text-slate-700">
                      <p><strong>Entity Name:</strong> Jog & Joy (Jainam Products)</p>
                      <p><strong>Grievance Officer:</strong> Customer Care & Compliance Desk, Jog & Joy (Jainam Products)</p>
                      <p><strong>Address:</strong> 2488, Navo Vas, Swaminarayan Mandir, Kalupur, Ahmedabad, Gujarat-24</p>
                      <p><strong>Email:</strong> jogjoy85@gmail.com &nbsp;|&nbsp; <strong>Phone:</strong> +91 94299 05118</p>
                      <p><strong>Resolution SLA:</strong> Acknowledged within 48 hours; resolved within 30 days.</p>
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {/* TAB 3: REFUND & CANCELLATION */}
            {activeTab === 'refund' && (
              <motion.div
                key="refund-content"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Visual 3-Step Timeline */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-4 text-center sm:text-left">
                    Our 3-Step Hassle-Free Return & Refund Guarantee
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
                      <span className="text-xs font-black text-emerald-700 tracking-wider">01</span>
                      <h5 className="font-extrabold text-slate-900 text-sm mt-1">Request within 7 Days</h5>
                      <p className="text-xs text-slate-500 mt-1 font-medium">WhatsApp or email us with your Order ID & reason (size swap or return).</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
                      <span className="text-xs font-black text-emerald-700 tracking-wider">02</span>
                      <h5 className="font-extrabold text-slate-900 text-sm mt-1">Free Doorstep Pickup</h5>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Our courier picks up the unused garment with original tags attached.</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
                      <span className="text-xs font-black text-emerald-700 tracking-wider">03</span>
                      <h5 className="font-extrabold text-slate-900 text-sm mt-1">Instant Refund (5-7 Days)</h5>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Razorpay initiates refund directly to your original payment source or UPI.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      1. Pre-Dispatch & Post-Dispatch Cancellation
                    </h3>
                    <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                      <li><strong>Pre-Dispatch Cancellation:</strong> If you cancel before your package is dispatched, contact us at <strong>+91 94299 05118</strong>. A <strong>100% full refund</strong> is initiated immediately.</li>
                      <li><strong>Post-Dispatch:</strong> Once a package is in transit with the courier, you may decline delivery at your doorstep. Upon return to our warehouse, a full refund will be processed.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      2. 7-Calendar-Day Return & Size Exchange Window
                    </h3>
                    <p>
                      Because children grow quickly, we offer a generous <strong>7-calendar-day return and exchange window</strong> from confirmed delivery:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-slate-600">
                      <li>Garments must be unworn, unwashed, and in original packaging with brand tags attached.</li>
                      <li>If you receive a defective, damaged, or incorrect item, we arrange free reverse pickup with zero extra cost.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      3. Refund Methods & Banking Timelines
                    </h3>
                    <div className="overflow-x-auto my-3">
                      <table className="w-full text-left text-xs sm:text-sm border border-slate-200 rounded-xl overflow-hidden">
                        <thead className="bg-slate-100 text-slate-900 font-black">
                          <tr>
                            <th className="p-3 border-b border-slate-200">Original Payment Mode</th>
                            <th className="p-3 border-b border-slate-200">Refund Destination</th>
                            <th className="p-3 border-b border-slate-200">Bank Timeline</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                          <tr>
                            <td className="p-3 font-bold text-slate-900">UPI (GPay / PhonePe / Paytm)</td>
                            <td className="p-3">Source Bank Account via Razorpay</td>
                            <td className="p-3 font-bold text-emerald-700">2 - 4 Business Days</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-bold text-slate-900">Credit / Debit Card</td>
                            <td className="p-3">Issuing Bank Account via Razorpay</td>
                            <td className="p-3 font-bold text-emerald-700">5 - 7 Business Days</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-bold text-slate-900">Cash on Delivery (COD)</td>
                            <td className="p-3">Direct Bank Transfer (NEFT/IMPS) or UPI ID</td>
                            <td className="p-3 font-bold text-emerald-700">3 - 5 Business Days</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {/* TAB 4: SHIPPING & DELIVERY */}
            {activeTab === 'shipping' && (
              <motion.div
                key="shipping-content"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Visual Highlight Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-orange-50/60 border border-orange-100 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">24-48 Hr Dispatch</h4>
                      <p className="text-xs text-slate-600 mt-1">Orders steam-pressed, checked, and dispatched from Ahmedabad.</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">19,000+ Pin Codes</h4>
                      <p className="text-xs text-slate-600 mt-1">Partnerships with BlueDart, Delhivery, Xpressbees & India Post.</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Live SMS/Email AWB</h4>
                      <p className="text-xs text-slate-600 mt-1">Real-time parcel tracking link transmitted immediately on handover.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      1. Origin Hub & Order Processing
                    </h3>
                    <p>
                      All activewear outfits are packaged and handed over to courier carriers within <strong>24 to 48 business hours</strong> from our central hub at <strong>2488, Navo Vas, Swaminarayan Mandir, Kalupur, Ahmedabad, Gujarat-24</strong> (operating Monday to Saturday).
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      2. Estimated Delivery Schedules Across India by Zones
                    </h3>
                    <div className="overflow-x-auto my-3">
                      <table className="w-full text-left text-xs sm:text-sm border border-slate-200 rounded-xl overflow-hidden">
                        <thead className="bg-slate-100 text-slate-900 font-black">
                          <tr>
                            <th className="p-3 border-b border-slate-200">Delivery Zone & Region</th>
                            <th className="p-3 border-b border-slate-200">Logistics Carrier</th>
                            <th className="p-3 border-b border-slate-200">Transit Timeline</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                          <tr>
                            <td className="p-3 font-bold text-slate-900">Zone A: Gujarat Intra-State (Surat, Vadodara, Rajkot, etc.)</td>
                            <td className="p-3">Surface Express</td>
                            <td className="p-3 font-bold text-[#FF6B00]">1 - 2 Business Days</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-bold text-slate-900">Zone B: Major Metro Hubs (Mumbai, Delhi-NCR, Bengaluru, etc.)</td>
                            <td className="p-3">BlueDart / Delhivery Surface/Air</td>
                            <td className="p-3 font-bold text-[#FF6B00]">2 - 3 Business Days</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-bold text-slate-900">Zone C: Tier-2 and Tier-3 State Hubs</td>
                            <td className="p-3">Xpressbees / Delhivery / DTDC</td>
                            <td className="p-3 font-bold text-[#FF6B00]">3 - 5 Business Days</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-bold text-slate-900">Zone D: Remote Areas (Northeast, J&K, Island Territories)</td>
                            <td className="p-3">India Post Speed Post / Air Cargo</td>
                            <td className="p-3 font-bold text-[#FF6B00]">5 - 7 Business Days</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      3. Priority Express Delivery Option
                    </h3>
                    <p>
                      Need sports day or event outfits urgently? Choose our expedited <strong>Priority Express Delivery (+₹149)</strong> option at checkout for select metro pincodes, delivering within 1 to 2 business days.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      4. Doorstep Attempts & Return to Origin (RTO)
                    </h3>
                    <p>
                      Couriers will make up to three (3) delivery attempts. If delivery fails due to incorrect address or customer unreachability, the parcel returns to our warehouse. For prepaid orders, refunds are issued minus applicable freight fees.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      5. Damaged or Tampered Parcels Protocol
                    </h3>
                    <p>
                      If a parcel box appears visibly torn or retaped upon arrival, do not accept it, or note "Delivered in Damaged Condition" on the courier sheet and notify us at <strong>+91 94299 05118</strong>. We will ship a brand-new replacement immediately at zero cost.
                    </p>
                  </section>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Interactive FAQ Section for Active Policy */}
          <div className="mt-12 pt-10 border-t border-slate-200/90">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-[#D32F2F]">Frequently Asked Questions</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Questions About This Policy?</h3>
            </div>

            <div className="space-y-3 max-w-3xl mx-auto">
              {(FAQS[activeTab] || []).map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-50 transition-colors overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-extrabold text-xs sm:text-sm text-slate-900 cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <HelpCircle className="w-4 h-4 text-[#D32F2F] shrink-0" />
                        {faq.q}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#D32F2F]' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-200/60 leading-relaxed font-medium"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Support & Direct Connect Banner */}
        <div className="mt-8 bg-gradient-to-r from-slate-900 via-[#1B475D] to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-slate-800">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-widest text-[#FAD564]">Customer Support Guarantee</span>
            <h4 className="text-2xl sm:text-3xl font-black">Still Have Questions or Need Help?</h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
              Our activewear support team in Kalupur, Ahmedabad is always here to assist with size consultation, returns, or order tracking.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href="tel:+919429905118"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-extrabold text-xs shadow-md hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#D32F2F]" />
              <span>+91 94299 05118</span>
            </a>
            <Link
              to="/contact-us"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#D32F2F] text-white font-extrabold text-xs shadow-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>Contact Form</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
