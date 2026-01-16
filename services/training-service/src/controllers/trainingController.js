exports.login = (req, res) => {
    res.status(200).json({ message: 'Login endpoint' });
};

exports.register = (req, res) => {
    res.status(200).json({ message: 'Register endpoint' });
};
