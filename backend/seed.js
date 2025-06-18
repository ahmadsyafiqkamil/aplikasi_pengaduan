
const sequelize = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcrypt');

async function seed() {
    await sequelize.sync({ force: true });

    const users = [
        { username: 'admin1', password: 'adminpass', role: 'admin' },
        { username: 'super1', password: 'superpass', role: 'supervisor' },
        { username: 'agent1', password: 'agentpass', role: 'agent' },
        { username: 'manajer1', password: 'manpass', role: 'manajemen' }
    ];

    for (let user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await User.create({ username: user.username, password: hashedPassword, role: user.role });
    }

    console.log('Database seeded successfully.');
    process.exit();
}

seed();
