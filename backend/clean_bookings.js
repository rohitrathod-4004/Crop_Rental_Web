const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');
const dotenv = require('dotenv');

dotenv.config();

const cleanBookings = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const equipmentId = '696bdfdbf013fb2cda45c830'; 

        const bookings = await Booking.find({ equipmentId });
        console.log(`Found ${bookings.length} bookings BEFORE cleanup:`);
        
        bookings.forEach(b => {
            console.log(`- ID: ${b._id}`);
            console.log(`  Status: ${b.status}`);
            console.log(`  Start: ${b.requestedStartTime.toISOString()}`);
            console.log(`  End:   ${b.requestedEndTime.toISOString()}`);
            console.log('---');
        });

        // Delete pending bookings
        const result = await Booking.deleteMany({ 
            equipmentId, 
            status: 'PENDING' 
        });
        
        console.log(`Deleted ${result.deletedCount} PENDING bookings.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

cleanBookings();
