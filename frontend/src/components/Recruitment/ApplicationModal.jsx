import React from 'react';

const ApplicationModal = ({ isOpen, onClose, application, onUpdateStage, onScheduleInterview }) => {
    if (!isOpen || !application) return null;

    const stages = ['applied', 'screened', 'interview', 'offer', 'rejected', 'hired'];

    const getStageColor = (stage) => {
        const colors = {
            'applied': 'bg-gray-100 text-gray-700',
            'screened': 'bg-blue-100 text-blue-700',
            'interview': 'bg-purple-100 text-purple-700',
            'offer': 'bg-yellow-100 text-yellow-700',
            'hired': 'bg-green-100 text-green-700',
            'rejected': 'bg-red-100 text-red-700'
        };
        return colors[stage] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{application.full_name}</h2>
                        <p className="text-sm text-gray-500">Applying for: <span className="font-semibold text-gray-700">{application.job?.title || 'N/A'}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address</label>
                                <p className="text-gray-800 font-medium">{application.email}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Number</label>
                                <p className="text-gray-800 font-medium">{application.phone || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Application Date</label>
                                <p className="text-gray-800 font-medium">{application.applied_date}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Current Stage</label>
                                <div className="mt-1">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStageColor(application.stage)}`}>
                                        {application.stage}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Resume Link</label>
                        {application.resume_url ? (
                            <a
                                href={application.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium break-all"
                            >
                                {application.resume_url}
                            </a>
                        ) : (
                            <span className="text-gray-400 italic">No resume provided</span>
                        )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <label className="text-sm font-bold text-gray-700 block mb-3">Update Recruitment Stage</label>
                        <div className="flex flex-wrap gap-2">
                            {stages.map((stage) => (
                                <button
                                    key={stage}
                                    onClick={() => onUpdateStage(application.id, stage)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${application.stage === stage
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                                        }`}
                                >
                                    {stage}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all font-medium shadow-sm"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => onScheduleInterview(application)}
                        className="ml-3 px-6 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all font-bold shadow-lg shadow-purple-100 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Schedule Interview
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplicationModal;
