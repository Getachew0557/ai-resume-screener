import Position from '../models/Position.js';

export const getPositions = async (req, res) => {
    try {
        const positions = await Position.findAll();
        res.json(positions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPosition = async (req, res) => {
    try {
        const position = await Position.create(req.body);
        res.status(201).json(position);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updatePosition = async (req, res) => {
    try {
        const position = await Position.findByPk(req.params.id);
        if (!position) return res.status(404).json({ message: 'Position not found' });

        await position.update(req.body);
        res.json(position);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deletePosition = async (req, res) => {
    try {
        const position = await Position.findByPk(req.params.id);
        if (!position) return res.status(404).json({ message: 'Position not found' });

        await position.destroy();
        res.json({ message: 'Position deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
