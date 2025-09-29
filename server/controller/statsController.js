const User = require('../models/userModel');
const Hall = require('../models/hallModel');
const Booking = require('../models/bookModel');

/**
 * @desc    Get application-wide statistics with optional date filtering
 * @route   GET /api/stats
 * @access  Private (Admin)
 */
const getStats = async (req, res) => {
    try {
        const { period, year, month, startDate, endDate } = req.query;

        let dateFilter = {};
        const now = new Date();

        // Construct date filter based on query parameters
        if (period) {
            let start, end;
            switch (period) {
                case 'day':
                    start = new Date(now.setHours(0, 0, 0, 0));
                    end = new Date(now.setHours(23, 59, 59, 999));
                    break;
                case 'week':
                    const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                    start = new Date(firstDayOfWeek.setHours(0, 0, 0, 0));
                    const lastDayOfWeek = new Date(firstDayOfWeek);
                    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
                    end = new Date(lastDayOfWeek.setHours(23, 59, 59, 999));
                    break;
                case 'month':
                    const y = year ? parseInt(year) : now.getFullYear();
                    const m = month ? parseInt(month) - 1 : now.getMonth();
                    start = new Date(y, m, 1);
                    end = new Date(y, m + 1, 0, 23, 59, 59, 999);
                    break;
                case 'year':
                     const currentYear = year ? parseInt(year) : now.getFullYear();
                    start = new Date(currentYear, 0, 1);
                    end = new Date(currentYear, 11, 31, 23, 59, 59, 999);
                    break;
                case 'custom':
                    if (startDate && endDate) {
                        start = new Date(startDate);
                        end = new Date(endDate);
                        end.setHours(23, 59, 59, 999); // Ensure end date includes the whole day
                    }
                    break;
            }
             if (start && end) {
                dateFilter = { createdAt: { $gte: start, $lte: end } };
            }
        }


        // 1. Get total counts for Users and Halls (these are not date-filtered)
        const totalUsers = await User.countDocuments();
        const totalHalls = await Hall.countDocuments();

        // 2. Get total bookings based on the date filter
        const totalBookings = await Booking.countDocuments(dateFilter);

        // 3. Calculate total revenue from confirmed bookings within the date filter
        const revenueResult = await Booking.aggregate([
            { $match: { ...dateFilter, booking_status: 'Confirmed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$booking_amount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // 4. Aggregate booking counts by their status within the date filter
        const bookingsByStatus = await Booking.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$booking_status', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // 5. Fetch the 5 most recent bookings within the date filter
        const recentBookings = await Booking.find(dateFilter)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user_id', 'name email')
            .populate('hall_id', 'hall_name');

        // 6. Combine all stats into a single response object
        const stats = {
            totalUsers,
            totalHalls,
            totalBookings,
            totalRevenue,
            bookingsByStatus,
            recentBookings,
            filter: { period, year, month, startDate, endDate }
        };

        res.json(stats);

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server Error while fetching stats' });
    }
};

module.exports = {
    getStats,
};

