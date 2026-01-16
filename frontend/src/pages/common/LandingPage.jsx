import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/layout/PublicNavbar';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <PublicNavbar />

            {/* Hero Section */}
            <section id="home" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gray-900 py-20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/70 to-blue-900/90 z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-6 text-center space-y-8">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 text-blue-300 text-[9px] font-black uppercase tracking-[0.3em] animate-fade-in">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                        Intelligence @ Work
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight uppercase max-w-3xl mx-auto animate-slide-up">
                        Innovation <span className="text-blue-500">&</span> Service HR
                    </h1>
                    <p className="text-base md:text-lg text-blue-100/80 max-w-2xl mx-auto leading-relaxed animate-fade-in delay-200">
                        Experience the peak of workforce intelligence. A unified ecosystem for operational excellence.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-slide-up delay-300">
                        <Link
                            to="/jobs"
                            className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white hover:text-blue-600 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 flex items-center justify-center gap-3"
                        >
                            Explore Open Roles
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        {/* Removed Admin Access Link */}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto relative text-center">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50" />

                    <div className="text-center space-y-3 mb-16 relative z-10">
                        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Core Capabilities</h2>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight uppercase leading-tight">
                            Intelligent <span className="text-blue-600">Solutions</span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="group bg-gray-50 p-8 rounded-3xl border border-transparent hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color} shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="text-xl font-extrabold text-gray-900 mb-3 uppercase tracking-tight leading-tight">{feature.title}</h4>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 px-6 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">About Us</h2>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight uppercase leading-tight">
                            Excellence <span className="text-blue-600">Defined</span>
                        </h3>
                        <p className="text-base text-gray-600 leading-relaxed max-w-lg">
                            We synchronize human intuition with algorithmic precision to create an adaptive workplace environment.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {['Auto-Workflows', 'Global Scale', 'Deep Analytics', 'Cloud Native'].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-10 bg-blue-600 rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity" />
                        <img
                            src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80"
                            alt="Innovation"
                            className="relative rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(37,99,235,0.2)] border-[12px] border-white object-cover aspect-video lg:aspect-square"
                        />
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-6 bg-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-700 opacity-50" />
                <div className="relative z-10 max-w-5xl mx-auto text-center space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em]">Get In Touch</h2>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase leading-tight">
                            Ready For <span className="text-blue-100">Innovation</span>?
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: 'Location', val: 'Addis Ababa, ET' },
                            { label: 'Network', val: 'innovation@is-hr.com' },
                            { label: 'Support', val: '+251 HR INNOVATE' }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/20 hover:bg-white/20 transition-colors">
                                <h4 className="text-blue-200 font-bold uppercase text-[10px] tracking-[0.3em] mb-4">{item.label}</h4>
                                <p className="text-xl font-extrabold tracking-tight uppercase text-white">{item.val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12 pb-16 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-extrabold tracking-tight uppercase text-gray-900 leading-none">
                                    INNOVATION <span className="text-blue-600">&</span> SERVICE
                                </span>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mt-1">
                                    HR Management System
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-10">
                            {['Instagram', 'LinkedIn', 'Twitter'].map(item => (
                                <a key={item} href="#" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12">
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">
                            &copy; 2026 Innovation & Service HR Systems. Excellence as standard.
                        </p>
                        <div className="flex gap-8">
                            {['Data Protection', 'AI Ethics', 'Legal'].map(item => (
                                <a key={item} href="#" className="text-[10px] font-black text-gray-300 hover:text-blue-600 transition-colors uppercase tracking-[0.3em]">
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
};

const features = [
    {
        title: 'Talent Acquisition',
        desc: 'Advanced recruitment module featuring automated applicant tracking and public job boards.',
        color: 'from-blue-600 to-indigo-600',
        icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
        )
    },
    {
        title: 'Core Management',
        desc: 'Complete employee lifecycle management from onboarding to retirement with precision.',
        color: 'from-indigo-600 to-purple-600',
        icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354l1.1.63a2 2 0 001.81.012l1.39-.68a2 2 0 012.651.812l.68 1.39a2 2 0 00.916.916l1.39.68a2 2 0 01.812 2.651l-.68 1.39a2 2 0 00.012 1.81l.63 1.1a2 2 0 01-.812 2.651l-1.39.68a2 2 0 00-.916.916l-.68 1.39a2 2 0 01-2.651.812l-1.39-.68a2 2 0 00-1.81-.012l-1.1-.63a2 2 0 01-2.651-.812l-.68-1.39a2 2 0 00-.916-.916l-1.39-.68a2 2 0 01-.812-2.651l.68-1.39a2 2 0 00-.012-1.81l-.63-1.1a2 2 0 01.812-2.651l1.39-.68a2 2 0 00.916-.916l.68-1.39a2 2 0 012.651-.812z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01" />
            </svg>
        )
    },
    {
        title: 'Leave & Attendance',
        desc: 'Flexible tracking systems for attendance and seamless leave approval workflows.',
        color: 'from-purple-600 to-pink-600',
        icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }
];

export default LandingPage;
