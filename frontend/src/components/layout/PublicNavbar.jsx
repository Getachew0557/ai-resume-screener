import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const PublicNavbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we're on a page that needs white navbar (not landing page)
    const needsWhiteNavbar = location.pathname !== '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '/#home' },
        { name: 'About', href: '/#about' },
        { name: 'Features', href: '/#features' },
        { name: 'Jobs', href: '/jobs' },
        { name: 'Contact', href: '/#contact' },
    ];

    // Determine navbar styling based on scroll state and current route
    const isNavbarSolid = isScrolled || isMobileMenuOpen || needsWhiteNavbar;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isNavbarSolid ? 'bg-white shadow-sm py-4' : 'bg-transparent py-6'
            }`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className={`text-lg font-extrabold tracking-tight ${isNavbarSolid ? 'text-gray-900' : 'text-white'
                            }`}>
                            INNOVATION <span className="text-blue-500">&</span> SERVICE
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isNavbarSolid ? 'text-gray-400' : 'text-blue-200'
                            }`}>
                            HR Management
                        </span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        link.href.includes('#') ? (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isNavbarSolid ? 'text-gray-600 hover:text-blue-600' : 'text-blue-100 hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </a>
                        ) : (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isNavbarSolid ? 'text-gray-600 hover:text-blue-600' : 'text-blue-100 hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        )
                    ))}
                    <Link
                        to="/login"
                        className={`px-6 py-2 bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-gray-200`}
                    >
                        Login
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`lg:hidden p-2 rounded-xl transition-colors ${isNavbarSolid ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                        }`}
                >
                    {isMobileMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu Content */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 mt-4 px-6 py-8 flex flex-col gap-6 animate-fade-in">
                    {navLinks.map((link) => (
                        link.href.includes('#') ? (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-sm font-black text-gray-900 uppercase tracking-widest hover:text-blue-600"
                            >
                                {link.name}
                            </a>
                        ) : (
                            <Link
                                key={link.name}
                                to={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-sm font-black text-gray-900 uppercase tracking-widest hover:text-blue-600"
                            >
                                {link.name}
                            </Link>
                        )
                    ))}
                    <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-4 bg-blue-600 text-white text-center font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-100"
                    >
                        Employee Login
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default PublicNavbar;
