const Unauthorized = () => {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
            <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
            <p className="text-xl text-gray-600 mb-8">Unauthorized Access</p>
            <p className="text-gray-500 mb-8">You don't have permission to access this page</p>
            <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Go Home
            </a>
        </div>
    );
};

export default Unauthorized;
