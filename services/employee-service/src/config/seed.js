import Position from '../models/Position.js';

async function seedPositions() {
    try {
        const positions = [
            { position_name: 'Director', description: 'Overall management and strategy' },
            { position_name: 'Team Leader', description: 'Leads a specific team and manages workflows' },
            { position_name: 'Employee', description: 'Standard staff member' }
        ];

        for (const pos of positions) {
            await Position.findOrCreate({
                where: { position_name: pos.position_name },
                defaults: pos
            });
        }

        console.log('Default positions seeded successfully.');
    } catch (error) {
        console.error('Error seeding positions:', error);
    }
}

export default seedPositions;
