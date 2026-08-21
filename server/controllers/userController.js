const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('[Get Profile Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error fetching profile' });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const {
      name,
      profileImage,
      bio,
      skills,
      interests,
      preferredRoles,
      availability,
      experienceLevel,
      portfolio,
    } = req.body;

    if (name !== undefined) user.name = name;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (interests !== undefined) user.interests = interests;
    if (preferredRoles !== undefined) user.preferredRoles = preferredRoles;
    if (availability !== undefined) user.availability = Number(availability);
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    if (portfolio !== undefined) user.portfolio = portfolio;

    const updatedUser = await user.save();
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('[Update Profile Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating profile' });
  }
};

// @desc    Get all students (with optional query filters)
// @route   GET /api/users
// @access  Public or Private
const getAllUsers = async (req, res) => {
  try {
    const { skill, interest, role, availability, search } = req.query;
    const filter = {};

    // Filter by skill
    if (skill) {
      filter.skills = { $regex: new RegExp(skill, 'i') };
    }

    // Filter by interest
    if (interest) {
      filter.interests = { $regex: new RegExp(interest, 'i') };
    }

    // Filter by role
    if (role) {
      filter.preferredRoles = { $regex: new RegExp(role, 'i') };
    }

    // Filter by availability
    if (availability) {
      filter.availability = { $gte: Number(availability) };
    }

    // General search text
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
        { preferredRoles: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('[Get All Users Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error fetching students' });
  }
};

// @desc    Get student by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('[Get User By ID Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error fetching student' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
};
