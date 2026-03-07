// migrate-event-type.js
// Run once: node migrate-event-type.js
// Patches all events in MongoDB that are missing the eventType field

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/valorous2k26';

const EventSchema = new mongoose.Schema({
    eventName: String,
    department: String,
    eventType: { type: String, default: 'Technical' },
}, { strict: false, timestamps: true });

const Event = mongoose.model('Event', EventSchema);

async function migrate() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all events where eventType is missing or null/empty
    const result = await Event.updateMany(
        { $or: [{ eventType: { $exists: false } }, { eventType: null }, { eventType: '' }] },
        { $set: { eventType: 'Technical' } }
    );

    console.log(`✅ Patched ${result.modifiedCount} events — eventType set to "Technical"`);
    await mongoose.disconnect();
    console.log('Done!');
}

migrate().catch(err => {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
});
