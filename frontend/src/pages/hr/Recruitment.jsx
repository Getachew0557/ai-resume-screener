import React, { useState, useEffect, useCallback } from 'react';
import { recruitmentAPI } from '../../services/api';
import JobModal from '../../components/Recruitment/JobModal';
import ApplicationModal from '../../components/Recruitment/ApplicationModal';

const Recruitment = () => {
    const [activeTab, setActiveTab] = useState('jobs');
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [isAppModalOpen, setIsAppModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedApp, setSelectedApp] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [jobsRes, appsRes] = await Promise.all([
                recruitmentAPI.getJobs(),
                recruitmentAPI.getApplications()
            ]);
            setJobs(jobsRes.data);
            setApplications(appsRes.data);
        } catch (err) {
            setError('Failed to fetch recruitment data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveJob = async (formData) => {
        try {
            if (selectedJob) {
                await recruitmentAPI.updateJob(selectedJob.id, formData);
            } else {
                await recruitmentAPI.createJob(formData);
            }
            setIsJobModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Error saving job: ' + err.message);
        }
    };

    const handleDeleteJob = async (id) => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            try {
                await recruitmentAPI.deleteJob(id);
                fetchData();
            } catch (err) {
                alert('Error deleting job: ' + err.message);
            }
        }
    };

    const handleUpdateAppStage = async (id, stage) => {
        try {
            await recruitmentAPI.updateApplicationStage(id, { stage });
            setIsAppModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Error updating stage: ' + err.message);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recruitment Management</h1>
                    <p className="text-gray-500 mt-1">Manage your job postings and candidate applications</p>
                </div>
                <button
                    onClick={() => { setSelectedJob(null); setIsJobModalOpen(true); }}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Post New Job
                </button>
            </div>

            <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'jobs'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Job Postings ({jobs.length})
                </button>
                <button
                    onClick={() => setActiveTab('apps')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'apps'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Applications ({applications.length})
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl text-sm text-red-700 p-4">
                    {error}
                </div>
            )}

            {activeTab === 'jobs' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {jobs.map((job) => (
                        <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => { setSelectedJob(job); setIsJobModalOpen(true); }}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {job.status}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-800 mt-2">{job.title}</h3>
                                </div>
                                <div className="flex flex-col text-sm text-gray-500 space-y-1">
                                    <p>Posted: {job.posted_date || 'N/A'}</p>
                                    <p>Closing: {job.closing_date || 'N/A'}</p>
                                </div>
                                {job.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2 italic">
                                        {job.description}
                                    </p>
                                )}
                                <div className="pt-4 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50">
                                    <span className="font-bold text-gray-600 uppercase tracking-widest">{job.applications?.length || 0} Applicants</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Candidate</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Job Position</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Stage</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {applications.map((app) => (
                                <tr key={app.id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{app.full_name}</div>
                                        <div className="text-xs text-gray-500">{app.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-700">{app.job?.title || 'Unknown'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest capitalize ${app.stage === 'hired' ? 'bg-green-100 text-green-700' :
                                            app.stage === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {app.stage}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => { setSelectedApp(app); setIsAppModalOpen(true); }}
                                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
            }

            <JobModal
                isOpen={isJobModalOpen}
                onClose={() => setIsJobModalOpen(false)}
                onSave={handleSaveJob}
                job={selectedJob}
            />

            <ApplicationModal
                isOpen={isAppModalOpen}
                onClose={() => setIsAppModalOpen(false)}
                application={selectedApp}
                onUpdateStage={handleUpdateAppStage}
            />
        </div >
    );
};

export default Recruitment;
