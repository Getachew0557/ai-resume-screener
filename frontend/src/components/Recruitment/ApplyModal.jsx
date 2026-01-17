import React, { useState } from 'react';

const ApplyModal = ({ isOpen, onClose, onApply, job }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        phone: '',
        resume_url: '',
        resume_file: null
    });
    const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !job) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setUploadProgress(0);

        // Prepare submission data
        let submissionData;

        // We need to use FormData if sending a file
        if (uploadType === 'file' && formData.resume_file) {
            const data = new FormData();
            data.append('full_name', formData.full_name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('job_id', job.id);
            data.append('resume', formData.resume_file);
            submissionData = data;
        } else {
            // Regular JSON for URL
            // Validate URL format
            const urlPattern = /^(https?:\/\/(?:www\.)?(?:drive\.google\.com\/file\/d\/[^\/]+\/view|.*?\.(?:pdf|docx?|jpe?g|png))(?:\?.*)?)$/i;

            if (!urlPattern.test(formData.resume_url)) {
                alert("Please enter a valid Resume URL (Google Drive link or direct .pdf/.doc/.docx/.jpg/.png link)");
                setIsSubmitting(false);
                return;
            }

            submissionData = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                job_id: job.id,
                resume_url: formData.resume_url
            };
        }

        try {
            await onApply(submissionData, (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            });
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'resume_file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-green-50 to-teal-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Apply for Position</h2>
                        <p className="text-sm text-gray-500 font-medium">{job.title}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Full Name</label>
                        <input
                            required
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="Your full name"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Email Address</label>
                        <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="+1 234 567 890"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Resume Format</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="uploadType"
                                    checked={uploadType === 'url'}
                                    onChange={() => setUploadType('url')}
                                    className="text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Link (URL)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="uploadType"
                                    checked={uploadType === 'file'}
                                    onChange={() => setUploadType('file')}
                                    className="text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Upload PDF</span>
                            </label>
                        </div>

                        {uploadType === 'url' ? (
                            <input
                                required
                                type="url"
                                name="resume_url"
                                value={formData.resume_url}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                placeholder="https://link-to-your-resume.pdf"
                            />
                        ) : (
                            <input
                                required
                                type="file"
                                name="resume_file"
                                accept=".pdf"
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            />
                        )}
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 transition-all font-medium shadow-md"
                        >
                            Submit Application
                        </button>
                    </div>

                    {isSubmitting && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                            <p className="text-xs text-center text-gray-500 mt-1">{uploadProgress}% Uploaded</p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ApplyModal;
