const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an opportunity title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify the opportunity type'],
      enum: ['Project', 'Internship', 'Hackathon', 'Competition'],
      default: 'Project',
    },
    requiredSkills: {
      type: [String],
      required: [true, 'Please provide at least one required skill'],
      default: [],
    },
    requiredRoles: {
      type: [String],
      required: [true, 'Please provide at least one required role'],
      default: [],
    },
    duration: {
      type: String,
      default: '4 weeks',
      trim: true,
    },
    requiredHours: {
      type: Number,
      default: 10, // hours per week
    },
    deadline: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          default: 'Contributor',
        },
        message: {
          type: String,
          default: '',
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Opportunity', opportunitySchema);
