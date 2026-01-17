import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recruitmentAPI } from '../../services/api';
import ApplyModal from '../../components/Recruitment/ApplyModal';
import PublicNavbar from '../../components/layout/PublicNavbar';

const JobBoard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    const fetchOpenJobs = async () => {
        setLoading(true);
        try {
            const res = await recruitmentAPI.getJobs();
            setJobs(res.data.filter(job => job.status === 'open'));
        } catch (err) {
            setError('System link currently unavailable. Node reconnection in progress.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpenJobs();
    }, []);

    const handleApply = async (applicationData, onUploadProgress) => {
        try {
            await recruitmentAPI.createApplication(applicationData, {
                onUploadProgress: onUploadProgress
            });
            alert('Application submitted successfully!');
            setIsApplyModalOpen(false);
        } catch (err) {
            alert('Failed to submit application: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <PublicNavbar />

            {/* Hero */}
            <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-950 text-white py-20 px-6 relative overflow-hidden mt-16 md:mt-20">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                </div>
                <div className="max-w-7xl mx-auto text-center space-y-4 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-300 text-[9px] font-black uppercase tracking-[0.3em]">
                        Career Opportunities
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase leading-tight">Join Our Team</h2>
                    <p className="text-base text-blue-100/70 max-w-xl mx-auto">
                        Discover opportunities to shape the future of work.
                    </p>
                </div>
            </div>

            {/* Jobs List */}
            <main className="max-w-5xl mx-auto w-full px-6 py-16 flex-1">
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-3xl mb-10 flex items-center gap-4 animate-fade-in">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[11px] font-black uppercase tracking-widest">{error}</span>
                    </div>
                )}

                {jobs.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.3em] italic">No active vectors at this node.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {jobs.map((job) => (
                            <div key={job.id} className="group bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md">
                                                Active
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{job.posted_date}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-tight mb-3">{job.title}</h3>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-[10px] text-gray-600 font-bold uppercase tracking-wide">
                                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                                                    </svg>
                                                    Department
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-[10px] text-gray-600 font-bold uppercase tracking-wide">
                                                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243" />
                                                    </svg>
                                                    Location
                                                </div>
                                            </div>
                                        </div>
                                        {job.description && (
                                            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed max-w-2xl">
                                                {job.description}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => { setSelectedJob(job); setIsApplyModalOpen(true); }}
                                        className="px-8 py-3 bg-gray-900 text-white text-[11px] rounded-xl font-black uppercase tracking-widest hover:bg-blue-600 hover:shadow-lg transition-all active:scale-95"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="bg-white border-t border-gray-100 py-20 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">© 2026 Innovation & Service HR Systems. All nodes operational.</p>
                    <div className="flex items-center gap-10">
                        {['Protocols', 'Encryptions', 'Neural Link'].map(item => (
                            <a key={item} href="#" className="text-[10px] font-black text-gray-300 hover:text-blue-500 transition-colors uppercase tracking-[0.3em]">
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>

            <ApplyModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                onApply={handleApply}
                job={selectedJob}
            />
        </div>
    );
};

export default JobBoard;
