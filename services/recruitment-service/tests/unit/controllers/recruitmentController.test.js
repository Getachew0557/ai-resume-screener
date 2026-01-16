describe('Recruitment Controller Utils', () => {
    describe('Data Sanitization', () => {
        // Helper function to sanitize data (same as in controller)
        const sanitizeData = (data) => {
            const sanitized = {};
            for (const key in data) {
                sanitized[key] = data[key] === '' ? null : data[key];
            }
            return sanitized;
        };

        it('should convert empty strings to null', () => {
            const input = {
                title: 'Software Engineer',
                department: '',
                location: 'Remote',
                salary_range: ''
            };

            const expected = {
                title: 'Software Engineer',
                department: null,
                location: 'Remote',
                salary_range: null
            };

            const result = sanitizeData(input);
            expect(result).toEqual(expected);
        });

        it('should preserve non-empty values', () => {
            const input = {
                title: 'DevOps Engineer',
                department: 'IT',
                location: 'Addis Ababa'
            };

            const result = sanitizeData(input);
            expect(result).toEqual(input);
        });

        it('should handle null and undefined values', () => {
            const input = {
                title: 'Data Analyst',
                department: null,
                location: undefined
            };

            const result = sanitizeData(input);
            expect(result.department).toBeNull();
            expect(result.location).toBeUndefined();
        });
    });
});
