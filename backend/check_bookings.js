const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');
const Equipment = require('./src/models/Equipment');
const dotenv = require('dotenv');

dotenv.config();

const checkBookings = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const equipmentId = '696bdfdbf013fb2cda45c830'; // The equipment ID from previous context

        const bookings = await Booking.find({ equipmentId });
        console.log(`Found ${bookings.length} bookings for equipment ${equipmentId}:`);
        
        bookings.forEach(b => {
            console.log(`- ID: ${b._id}`);
            console.log(`  Status: ${b.status}`);
            console.log(`  Start: ${b.requestedStartTime}`);
            console.log(`  End:   ${b.requestedEndTime}`);
            console.log(`  Blocked Start: ${b.blockedStartTime}`);
            console.log(`  Blocked End:   ${b.blockedEndTime}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkBookings();
