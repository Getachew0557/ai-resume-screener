/**
 * Calendar Service (Mock)
 * This service handles interview scheduling logic.
 * In a production environment, this would integrate with Google Calendar API or Microsoft Graph API.
 */

class CalendarService {
    /**
     * Schedules an interview
     * @param {Object} interviewDetails - Details of the interview
     * @param {string} interviewDetails.candidateEmail - Email of the candidate
     * @param {string} interviewDetails.candidateName - Name of the candidate
     * @param {string} interviewDetails.interviewerEmail - Email of the interviewer
     * @param {Date} interviewDetails.startTime - Start time of the interview
     * @param {number} interviewDetails.duration - Duration in minutes
     * @param {string} interviewDetails.location - Meeting link or physical location
     */
    async scheduleInterview({ candidateEmail, candidateName, interviewerEmail, startTime, duration = 30, location = 'Zoom' }) {
        console.log(`[CalendarService] Scheduling interview for ${candidateName} (${candidateEmail})`);
        console.log(`[CalendarService] Interviewer: ${interviewerEmail}`);
        console.log(`[CalendarService] Time: ${startTime.toLocaleString()}`);
        console.log(`[CalendarService] Location: ${location}`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In reality, you'd make an OAuth request here
        return {
            status: 'success',
            eventId: `evt_${Math.random().toString(36).substr(2, 9)}`,
            meetingLink: `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`,
            startTime: startTime,
            endTime: new Date(startTime.getTime() + duration * 60000)
        };
    }

    /**
     * Gets available slots (Mock)
     */
    async getAvailableSlots(date, interviewerEmail) {
        // Mock implementation returning some slots for the given date
        const baseDate = new Date(date);
        baseDate.setHours(9, 0, 0, 0);

        return [
            new Date(baseDate.getTime() + 1 * 3600000), // 10:00 AM
            new Date(baseDate.getTime() + 2 * 3600000), // 11:00 AM
            new Date(baseDate.getTime() + 5 * 3600000), // 2:00 PM
            new Date(baseDate.getTime() + 6 * 3600000)  // 3:00 PM
        ];
    }
}

module.exports = new CalendarService();
