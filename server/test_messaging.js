const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Team = require('./models/Team');
const Opportunity = require('./models/Opportunity');
const Connection = require('./models/Connection');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');


dotenv.config();

const runTest = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // 1. Verify Seed Users Exist
    const shaswat = await User.findOne({ email: 'shaswat@example.com' });
    const rahul = await User.findOne({ email: 'rahul@example.com' });
    const priya = await User.findOne({ email: 'priya@example.com' });

    if (!shaswat || !rahul || !priya) {
      throw new Error('Test users missing');
    }
    console.log(`✓ Found seed users: ${shaswat.name}, ${rahul.name}, ${priya.name}`);

    // 2. Check Connections
    const connections = await Connection.find({
      $or: [{ requester: shaswat._id }, { recipient: shaswat._id }],
    });
    console.log(`✓ Shaswat has ${connections.length} connection records`);

    // 3. Check Conversations
    const convs = await Conversation.find({
      participants: shaswat._id,
    }).populate('participants team lastMessage');
    console.log(`✓ Found ${convs.length} conversations for Shaswat`);

    for (const conv of convs) {
      const msgs = await Message.find({ conversation: conv._id });
      console.log(`  - Conversation type: ${conv.type} | Messages count: ${msgs.length}`);
    }

    // 4. Test creating a new direct message
    const testDirectConv = convs.find((c) => c.type === 'direct');
    if (testDirectConv) {
      const newMsg = await Message.create({
        conversation: testDirectConv._id,
        sender: shaswat._id,
        text: 'Automated test message at ' + new Date().toISOString(),
        readBy: [{ user: shaswat._id }],
      });
      console.log(`✓ Created test message ID: ${newMsg._id}`);

      testDirectConv.lastMessage = newMsg._id;
      testDirectConv.lastMessageAt = new Date();
      await testDirectConv.save();
      console.log(`✓ Updated conversation lastMessage`);
    }

    console.log('\n=============================================');
    console.log('🎉 ALL MESSAGING & CONNECTION TESTS PASSED!');
    console.log('=============================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
};

runTest();
