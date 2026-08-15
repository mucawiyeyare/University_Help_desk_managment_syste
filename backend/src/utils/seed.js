require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const SLAPolicy = require('../models/SLAPolicy');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uhdms');
    console.log('🌱 Connected to MongoDB for seeding...');

    // 1. Admin User
    let admin = await User.findOne({ email: 'admin@uhdms.edu' });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@uhdms.edu',
        password: 'Admin@123456',
        role: 'admin',
        phone: '+1 800-555-0100',
      });
      console.log('✅ Created Admin user: admin@uhdms.edu / Admin@123456');
    }

    // 2. Departments
    const depts = [
      { name: 'IT Support Services', description: 'Technical, LMS, Network, and Software assistance' },
      { name: 'Academic & Registry', description: 'Registration, courses, transcripts, and student records' },
      { name: 'Finance & Student Accounts', description: 'Tuition, fees, refunds, and financial aid inquiries' },
      { name: 'Facilities & Campus Services', description: 'Maintenance, room bookings, hostel, and physical campus issues' },
    ];

    const deptMap = {};
    for (const d of depts) {
      let dept = await Department.findOne({ name: d.name });
      if (!dept) {
        dept = await Department.create(d);
      }
      deptMap[d.name] = dept;
    }
    console.log('✅ Created Departments');

    // 3. Demo Manager & Agents
    const usersToCreate = [
      { name: 'Dr. Sarah Connor', email: 'manager.it@uhdms.edu', role: 'manager', department: deptMap['IT Support Services']._id },
      { name: 'John Doe (IT Agent)', email: 'agent.it@uhdms.edu', role: 'agent', department: deptMap['IT Support Services']._id },
      { name: 'Alice Smith (Registry Agent)', email: 'agent.registry@uhdms.edu', role: 'agent', department: deptMap['Academic & Registry']._id },
      { name: 'Robert Johnson (Student)', email: 'student@uhdms.edu', role: 'requester', requesterType: 'student' },
      { name: 'Prof. Michael Brown', email: 'lecturer@uhdms.edu', role: 'requester', requesterType: 'lecturer' },
    ];

    for (const u of usersToCreate) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const newUser = await User.create({ ...u, password: 'Password@123' });
        if (u.role === 'agent' && u.department) {
          await Department.findByIdAndUpdate(u.department, { $addToSet: { agents: newUser._id } });
        }
        if (u.role === 'manager' && u.department) {
          await Department.findByIdAndUpdate(u.department, { manager: newUser._id });
        }
      }
    }
    console.log('✅ Created Demo Manager, Agents, and Requesters (password: Password@123)');

    // 4. Categories & Subcategories
    const categoryData = [
      {
        name: 'IT Support',
        icon: 'Monitor',
        department: deptMap['IT Support Services']._id,
        subs: ['LMS & Moodle', 'Campus WiFi & Network', 'Student Portal & Email', 'Printer & Hardware', 'Software Installation'],
      },
      {
        name: 'Academic Affairs',
        icon: 'BookOpen',
        department: deptMap['Academic & Registry']._id,
        subs: ['Course Registration', 'Grade Appeal', 'Transcript Request', 'Exam Timetable', 'Graduation Audit'],
      },
      {
        name: 'Finance & Tuition',
        icon: 'CreditCard',
        department: deptMap['Finance & Student Accounts']._id,
        subs: ['Fee Statement Clarification', 'Payment Receipt', 'Scholarship & Financial Aid', 'Late Payment Waiver'],
      },
      {
        name: 'Facilities Maintenance',
        icon: 'Wrench',
        department: deptMap['Facilities & Campus Services']._id,
        subs: ['Classroom Projector/AC', 'Hostel Repair', 'Electrical Issue', 'Key/Lock Replacement'],
      },
    ];

    for (const c of categoryData) {
      let cat = await Category.findOne({ name: c.name });
      if (!cat) {
        cat = await Category.create({ name: c.name, icon: c.icon, department: c.department });
      }
      for (const subName of c.subs) {
        const subExists = await Subcategory.findOne({ name: subName, category: cat._id });
        if (!subExists) {
          await Subcategory.create({ name: subName, category: cat._id, department: c.department });
        }
      }
    }
    console.log('✅ Created Categories & Subcategories');

    // 5. SLA Policies
    const slaDefaults = [
      { name: 'Critical SLA', priority: 'critical', responseTime: 15, resolutionTime: 120, isDefault: true },
      { name: 'High Priority SLA', priority: 'high', responseTime: 30, resolutionTime: 240, isDefault: true },
      { name: 'Medium Priority SLA', priority: 'medium', responseTime: 240, resolutionTime: 1440, isDefault: true },
      { name: 'Low Priority SLA', priority: 'low', responseTime: 480, resolutionTime: 4320, isDefault: true },
    ];

    for (const s of slaDefaults) {
      const exists = await SLAPolicy.findOne({ priority: s.priority });
      if (!exists) await SLAPolicy.create(s);
    }
    console.log('✅ Created SLA Policies');

    console.log('🎉 Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
