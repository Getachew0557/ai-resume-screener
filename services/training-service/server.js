const express = require('express');
const sequelize = require('./src/config/db');
const initDb = require('./src/config/initDb');
require('dotenv').config();

const Course = require('./src/models/courseModel');
const Lesson = require('./src/models/lessonModel');
const Quiz = require('./src/models/quizModel');
const Question = require('./src/models/questionModel');
const Enrollment = require('./src/models/enrollmentModel');
const Progress = require('./src/models/progressModel');
const QuizAttempt = require('./src/models/quizAttemptModel');
const Certificate = require('./src/models/certificateModel');
const Skill = require('./src/models/skillModel');
const CourseSkill = require('./src/models/courseSkillModel');
const UserSkill = require('./src/models/userSkillModel');

const courseRoutes = require('./src/routes/courseRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes');
const quizRoutes = require('./src/routes/quizRoutes');
const certificateRoutes = require('./src/routes/certificateRoutes');
const skillRoutes = require('./src/routes/skillRoutes');
const cors = require('cors');


const app = express();

app.use(express.json());
app.use(cors());

Course.hasMany(Lesson, { foreignKey: 'course_id', as: 'lessons' });
Lesson.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Course.hasOne(Quiz, { foreignKey: 'course_id', as: 'quiz' });
Quiz.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Quiz.hasMany(Question, { foreignKey: 'quiz_id', as: 'questions' });
Question.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Progress.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

QuizAttempt.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

Certificate.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Certificate.belongsTo(QuizAttempt, { foreignKey: 'quiz_attempt_id', as: 'attempt' });

Course.belongsToMany(Skill, { through: CourseSkill, foreignKey: 'course_id', as: 'skills' });
Skill.belongsToMany(Course, { through: CourseSkill, foreignKey: 'skill_id', as: 'courses' });

CourseSkill.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
CourseSkill.belongsTo(Skill, { foreignKey: 'skill_id', as: 'skill' });

UserSkill.belongsTo(Skill, { foreignKey: 'skill_id', as: 'skill' });

app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/skills', skillRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Training Service is running', timestamp: new Date() });
});

const PORT = process.env.PORT || 3007;

async function startServer() {
  try {
    await initDb();
    console.log('Database initialized');

    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');

    app.listen(PORT, () => {
      console.log(`Training Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
