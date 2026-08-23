const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Opportunity = require('./models/Opportunity');
const Team = require('./models/Team');
const Connection = require('./models/Connection');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing collections
    await User.deleteMany({});
    await Opportunity.deleteMany({});
    await Team.deleteMany({});
    await Connection.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    console.log('[Seed] Cleared old data');

    // Create Demo Students
    const users = await User.create([
      {
        name: 'Shaswat Kumar',
        email: 'shaswat@example.com',
        password: 'password123',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        bio: 'Fullstack enthusiast looking to build next-gen collaborative AI tools and hackathon winners.',
        skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Express', 'Tailwind CSS'],
        interests: ['AI', 'Web Development', 'Hackathons', 'SaaS'],
        preferredRoles: ['Fullstack Developer', 'Backend Developer', 'Team Lead'],
        availability: 10,
        experienceLevel: 'Intermediate',
        portfolio: [
          { title: 'DevConnect Platform', link: 'https://github.com/shaswat/devconnect', description: 'Social network for developers built with MERN' },
          { title: 'TaskFlow AI', link: 'https://taskflow.demo.app', description: 'Automated workflow management with AI task routing' },
        ],
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: 'password123',
        profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
        bio: 'Machine Learning researcher passionate about Computer Vision, NLP, and intelligent agents.',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Computer Vision', 'OpenCV'],
        interests: ['AI', 'Deep Learning', 'Computer Vision', 'Robotics'],
        preferredRoles: ['ML Developer', 'Data Scientist', 'AI Researcher'],
        availability: 12,
        experienceLevel: 'Advanced',
        portfolio: [
          { title: 'VisionTrack AI', link: 'https://github.com/rahul/vision-track', description: 'Real-time multi-object tracking system with YOLOv8' },
        ],
      },
      {
        name: 'Aman Gupta',
        email: 'aman@example.com',
        password: 'password123',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        bio: 'Frontend specialist crafting pixel-perfect, accessible, and high-performance user interfaces.',
        skills: ['React', 'JavaScript', 'Tailwind CSS', 'Next.js', 'Figma', 'Redux'],
        interests: ['Web Development', 'UI/UX Design', 'Design Systems', 'Fintech'],
        preferredRoles: ['Frontend Developer', 'UI Engineer'],
        availability: 15,
        experienceLevel: 'Intermediate',
        portfolio: [
          { title: 'Aura UI Kit', link: 'https://aura-ui.design', description: 'Open-source accessible component library' },
        ],
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: 'password123',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        bio: 'Backend architect focused on scalable microservices, resilient APIs, and cloud infrastructure.',
        skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'AWS', 'MongoDB', 'Redis'],
        interests: ['Cloud Architecture', 'Backend Development', 'DevOps', 'Distributed Systems'],
        preferredRoles: ['Backend Developer', 'DevOps Engineer'],
        availability: 10,
        experienceLevel: 'Advanced',
        portfolio: [
          { title: 'HighScale Gateway', link: 'https://github.com/priya/api-gateway', description: 'Distributed API gateway handling 10k req/sec' },
        ],
      },
      {
        name: 'Ananya Sen',
        email: 'ananya@example.com',
        password: 'password123',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        bio: 'Product and UI/UX Designer turning complex product requirements into simple, delightful experiences.',
        skills: ['UI/UX Design', 'Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
        interests: ['Product Design', 'UI/UX Design', 'EdTech', 'Accessibility'],
        preferredRoles: ['UI/UX Designer', 'Product Designer'],
        availability: 8,
        experienceLevel: 'Intermediate',
        portfolio: [
          { title: 'EduFlow Case Study', link: 'https://behance.net/ananya/eduflow', description: 'End-to-end UX study for student engagement' },
        ],
      },
      {
        name: 'Rohan Verma',
        email: 'rohan@example.com',
        password: 'password123',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        bio: 'Cross-platform mobile developer building smooth 60fps applications for iOS & Android.',
        skills: ['Flutter', 'React Native', 'Dart', 'Firebase', 'JavaScript', 'Mobile Development'],
        interests: ['Mobile Apps', 'FinTech', 'HealthTech', 'IoT'],
        preferredRoles: ['Mobile Developer', 'Frontend Developer'],
        availability: 14,
        experienceLevel: 'Intermediate',
        portfolio: [
          { title: 'FitSync Mobile', link: 'https://github.com/rohan/fitsync-app', description: 'Cross-platform fitness tracker with Bluetooth sync' },
        ],
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha@example.com',
        password: 'password123',
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
        bio: 'Data scientist and analyst unearthing insights from complex datasets with statistical rigor.',
        skills: ['Python', 'Data Analysis', 'Pandas', 'Scikit-learn', 'SQL', 'PowerBI', 'Machine Learning'],
        interests: ['Data Science', 'HealthTech', 'AI', 'Predictive Modeling'],
        preferredRoles: ['Data Scientist', 'ML Developer'],
        availability: 10,
        experienceLevel: 'Intermediate',
        portfolio: [
          { title: 'HealthPredict Engine', link: 'https://github.com/sneha/health-predict', description: 'Early disease risk forecasting with ML models' },
        ],
      },
    ]);

    console.log(`[Seed] Created ${users.length} student profiles`);

    const shaswat = users[0];
    const rahul = users[1];
    const aman = users[2];
    const priya = users[3];
    const ananya = users[4];
    const rohan = users[5];
    const sneha = users[6];

    // Create Opportunities
    const opportunities = await Opportunity.create([
      {
        title: 'AI Campus Assistant',
        description: 'An intelligent real-time conversational campus assistant that helps university students navigate schedules, exam prep, dining menus, and library resources with localized LLM integration.',
        type: 'Project',
        requiredSkills: ['React', 'Node.js', 'Python', 'Machine Learning'],
        requiredRoles: ['Frontend Developer', 'Backend Developer', 'ML Developer', 'UI/UX Designer'],
        duration: '4 weeks',
        requiredHours: 10,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        createdBy: shaswat._id,
        applicants: [
          {
            user: priya._id,
            role: 'Backend Developer',
            message: 'I can build high-performance APIs and PostgreSQL/Redis caching for fast response times.',
            status: 'accepted',
            appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            user: rohan._id,
            role: 'Mobile Developer',
            message: 'Would love to contribute on the mobile companion app with Flutter!',
            status: 'pending',
            appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        title: 'FinTech Micro-Savings Platform',
        description: 'Gamified micro-investing and automated round-up savings web application for collegiate students. Competing in the National FinTech Hackathon 2026.',
        type: 'Hackathon',
        requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
        requiredRoles: ['Frontend Developer', 'Backend Developer', 'UI/UX Designer'],
        duration: '2 weeks',
        requiredHours: 15,
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        createdBy: aman._id,
        applicants: [
          {
            user: shaswat._id,
            role: 'Backend Developer',
            message: 'I have experience integrating Stripe and secure transaction webhooks.',
            status: 'pending',
            appliedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          },
        ],
      },
      {
        title: 'HealthTech Medical Image Diagnostics',
        description: 'Deep-learning assisted classification system for chest X-rays and dermatological image screening. Participating in the Global Health AI Challenge.',
        type: 'Competition',
        requiredSkills: ['Python', 'Machine Learning', 'Computer Vision', 'React'],
        requiredRoles: ['ML Developer', 'Frontend Developer', 'Data Scientist'],
        duration: '6 weeks',
        requiredHours: 12,
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        createdBy: rahul._id,
        applicants: [],
      },
      {
        title: 'Open Source Cloud Developer Portal',
        description: 'Building an enterprise-ready developer documentation and API playground portal for student builders with interactive sandboxes and WebAssembly runtimes.',
        type: 'Internship',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'Docker', 'AWS'],
        requiredRoles: ['Backend Developer', 'Frontend Developer', 'DevOps Engineer'],
        duration: '8 weeks',
        requiredHours: 20,
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        createdBy: priya._id,
        applicants: [],
      },
    ]);

    console.log(`[Seed] Created ${opportunities.length} opportunities`);

    // Create Teams
    const aiProject = opportunities[0];
    const fintechHackathon = opportunities[1];

    const teams = await Team.create([
      {
        name: 'AI Campus Assistant Team',
        description: 'Core development squad for the AI Campus Assistant. Working on vector embeddings and real-time frontend chat.',
        opportunity: aiProject._id,
        owner: shaswat._id,
        requiredRoles: ['Frontend Developer', 'Backend Developer', 'ML Developer', 'UI/UX Designer'],
        members: [
          {
            user: shaswat._id,
            role: 'Frontend Developer',
            status: 'accepted',
            joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            user: rahul._id,
            role: 'ML Developer',
            status: 'accepted',
            joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            user: priya._id,
            role: 'Backend Developer',
            status: 'accepted',
            joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            user: ananya._id,
            role: 'UI/UX Designer',
            status: 'pending',
            joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        name: 'FinTech Innovators Squad',
        description: 'Aiming for 1st place in the National FinTech Hackathon with our round-up micro savings engine.',
        opportunity: fintechHackathon._id,
        owner: aman._id,
        requiredRoles: ['Frontend Developer', 'Backend Developer', 'UI/UX Designer'],
        members: [
          {
            user: aman._id,
            role: 'Frontend Developer',
            status: 'accepted',
            joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    ]);

    console.log(`[Seed] Created ${teams.length} teams`);

    // Create Connections / Friendships
    await Connection.create([
      {
        requester: shaswat._id,
        recipient: rahul._id,
        status: 'accepted',
      },
      {
        requester: shaswat._id,
        recipient: priya._id,
        status: 'accepted',
      },
      {
        requester: aman._id,
        recipient: shaswat._id,
        status: 'pending',
      },
      {
        requester: sneha._id,
        recipient: shaswat._id,
        status: 'pending',
      },
    ]);

    console.log('[Seed] Created sample student connections');

    // Create 1-on-1 Direct Conversations
    const convShaswatRahul = await Conversation.create({
      type: 'direct',
      participants: [shaswat._id, rahul._id],
      unreadCounts: [
        { user: shaswat._id, count: 0 },
        { user: rahul._id, count: 0 },
      ],
      lastMessageAt: new Date(Date.now() - 10 * 60 * 1000),
    });

    const m1 = await Message.create({
      conversation: convShaswatRahul._id,
      sender: shaswat._id,
      text: 'Hey Rahul! I checked out your VisionTrack project. The multi-object tracking setup is super slick!',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      readBy: [{ user: shaswat._id }, { user: rahul._id }],
    });

    const m2 = await Message.create({
      conversation: convShaswatRahul._id,
      sender: rahul._id,
      text: 'Thanks Shaswat! I saw your AI Campus Assistant opportunity. I can train an embedding model for student queries.',
      createdAt: new Date(Date.now() - 20 * 60 * 1000),
      readBy: [{ user: shaswat._id }, { user: rahul._id }],
    });

    const m3 = await Message.create({
      conversation: convShaswatRahul._id,
      sender: shaswat._id,
      text: "That would be awesome! Let's sync up on the architecture tonight.",
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      readBy: [{ user: shaswat._id }, { user: rahul._id }],
    });

    convShaswatRahul.lastMessage = m3._id;
    await convShaswatRahul.save();

    // Direct Conversation between Shaswat & Priya
    const convShaswatPriya = await Conversation.create({
      type: 'direct',
      participants: [shaswat._id, priya._id],
      unreadCounts: [
        { user: shaswat._id, count: 1 },
        { user: priya._id, count: 0 },
      ],
      lastMessageAt: new Date(Date.now() - 5 * 60 * 1000),
    });

    const mp1 = await Message.create({
      conversation: convShaswatPriya._id,
      sender: priya._id,
      text: 'Hey Shaswat, I have set up the MongoDB schemas and Redis caching layer for the project!',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      readBy: [{ user: priya._id }],
    });

    convShaswatPriya.lastMessage = mp1._id;
    await convShaswatPriya.save();

    // Team Channel Conversation for AI Campus Assistant
    const aiTeam = teams[0];
    const convTeam = await Conversation.create({
      type: 'team',
      team: aiTeam._id,
      participants: [shaswat._id, rahul._id, priya._id],
      unreadCounts: [
        { user: shaswat._id, count: 0 },
        { user: rahul._id, count: 0 },
        { user: priya._id, count: 0 },
      ],
      lastMessageAt: new Date(Date.now() - 2 * 60 * 1000),
    });

    const mt1 = await Message.create({
      conversation: convTeam._id,
      sender: shaswat._id,
      text: 'Welcome to the AI Campus Assistant squad everyone! 🚀 Our goal is to complete the core prototype in 4 weeks.',
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      readBy: [{ user: shaswat._id }, { user: rahul._id }, { user: priya._id }],
    });

    const mt2 = await Message.create({
      conversation: convTeam._id,
      sender: priya._id,
      text: 'Database schemas are deployed! API docs are ready on Swagger.',
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      readBy: [{ user: shaswat._id }, { user: rahul._id }, { user: priya._id }],
    });

    const mt3 = await Message.create({
      conversation: convTeam._id,
      sender: rahul._id,
      text: 'Great progress. I am finalizing the embedding pipeline now.',
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
      readBy: [{ user: shaswat._id }, { user: rahul._id }, { user: priya._id }],
    });

    convTeam.lastMessage = mt3._id;
    await convTeam.save();

    console.log('[Seed] Created sample conversations & message threads');
    console.log('[Seed] Database seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
