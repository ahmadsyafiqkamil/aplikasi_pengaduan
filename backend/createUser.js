const { sequelize } = require('./config/database');
const { User } = require('./models');

const usersToCreate = [
  {
    username: 'admin1',
    password: 'adminpass',
    name: 'Administrator',
    email: 'admin@example.com',
    role: 'admin',
    is_active: true
  },
  {
    username: 'super1',
    password: 'superpass',
    name: 'Supervisor',
    email: 'supervisor@example.com',
    role: 'supervisor',
    is_active: true
  },
  {
    username: 'agent1',
    password: 'agentpass',
    name: 'Agent',
    email: 'agent@example.com',
    role: 'agent',
    is_active: true
  },
  {
    username: 'manajer1',
    password: 'manpass',
    name: 'Manajemen',
    email: 'manajemen@example.com',
    role: 'manajemen',
    is_active: true
  }
];

async function createSeedUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    for (const newUser of usersToCreate) {
      const existingUser = await User.findOne({ where: { username: newUser.username } });
      if (existingUser) {
        await existingUser.update({ password: newUser.password, is_active: true });
        console.log(`🔄 Updated password for user: ${newUser.username}`);
      } else {
        await User.create(newUser);
        console.log(`✅ Created user: ${newUser.username}`);
      }
      // Verify
      const createdUser = await User.findOne({ where: { username: newUser.username } });
      const isValid = await createdUser.comparePassword(newUser.password);
      console.log(`   Password verification for ${newUser.username}: ${isValid ? 'PASSED' : 'FAILED'}`);
    }

    console.log('\n🎉 All seed users created/updated!');
    console.log('\n📝 Login Credentials:');
    usersToCreate.forEach(u => {
      console.log(`Username: ${u.username} | Password: ${u.password} | Role: ${u.role}`);
    });
  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

createSeedUsers(); 