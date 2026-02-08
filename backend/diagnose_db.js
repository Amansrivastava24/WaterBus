const mongoose = require('mongoose');
const User = require('./models/User');
const Business = require('./models/Business');
const fs = require('fs');
require('dotenv').config();

const diagnose = async () => {
    let output = '';
    const log = (msg) => { output += msg + '\n'; console.log(msg); };

    try {
        await mongoose.connect(process.env.MONGO_URI);
        log('Connected to DB');

        const users = await User.find({});
        log('--- USERS ---');
        users.forEach(u => log(`Email: ${u.email}, ID: ${u._id}, BusinessID: ${u.businessId}`));

        const businesses = await Business.find({});
        log('--- BUSINESSES ---');
        businesses.forEach(b => log(`Name: ${b.name}, ID: ${b._id}, OwnerID: ${b.ownerId}`));

        fs.writeFileSync('diagnose_log.txt', output);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('diagnose_log.txt', err.stack);
        process.exit(1);
    }
};

diagnose();
