const Skill = require('../models/skillModel');
const UserSkill = require('../models/userSkillModel');
const CourseSkill = require('../models/courseSkillModel');
const Course = require('../models/courseModel');
const { Op } = require('sequelize');

exports.getSkills = async (req, res) => {
    try {
        const skills = await Skill.findAll({
            order: [['category', 'ASC'], ['name', 'ASC']]
        });

        res.status(200).json({ skills });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMySkillGaps = async (req, res) => {
    try {
        const user_id = req.user.id;

        const userSkills = await UserSkill.findAll({
            where: { user_id },
            include: [{ model: Skill, as: 'skill' }]
        });

        const userSkillIds = userSkills.map(us => us.skill_id);

        const missingSkills = await Skill.findAll({
            where: {
                id: { [Op.notIn]: userSkillIds.length > 0 ? userSkillIds : [0] }
            }
        });

        res.status(200).json({
            currentSkills: userSkills,
            skillGaps: missingSkills
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getRecommendedCourses = async (req, res) => {
    try {
        const user_id = req.user.id;

        const userSkills = await UserSkill.findAll({
            where: { user_id },
            attributes: ['skill_id']
        });

        const userSkillIds = userSkills.map(us => us.skill_id);

        const courseSkills = await CourseSkill.findAll({
            where: {
                skill_id: { [Op.notIn]: userSkillIds.length > 0 ? userSkillIds : [0] }
            },
            include: [
                { model: Course, as: 'course', where: { is_active: true } },
                { model: Skill, as: 'skill' }
            ]
        });

        const recommendedCourses = courseSkills.reduce((acc, cs) => {
            const existing = acc.find(c => c.id === cs.course.id);
            if (existing) {
                existing.skills.push(cs.skill);
            } else {
                acc.push({
                    ...cs.course.toJSON(),
                    skills: [cs.skill]
                });
            }
            return acc;
        }, []);

        res.status(200).json({ recommendedCourses });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
