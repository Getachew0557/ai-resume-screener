import express from 'express';
import { getPositions, createPosition, updatePosition, deletePosition } from '../controllers/position.controller.js';

const router = express.Router();

router.get('/', getPositions);
router.post('/', createPosition);
router.put('/:id', updatePosition);
router.delete('/:id', deletePosition);

export default router;
