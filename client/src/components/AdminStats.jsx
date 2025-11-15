import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminStats.css'; // Import the new, combined CSS file
import { IndianRupee, CalendarDays, Users, Building } from 'lucide-react';

// -- Helper component, now in the same file --
const StatCard = ({ title, value, icon, color }) => (
  <div className="stat-card" style={{ borderLeft: `5px solid ${color}` }}>
    <div className="stat-card-info">
      <p className="stat-card-title">{title}</p>
      <h3 className="stat-card-value">{value}</h3>
    </div>
    <div className="stat-card-icon" style={{ backgroundColor: color }}>
      {icon}
    </div>
  </div>
);

// -- Main component for the Admin Statistics Dashboard --
const AdminStats = ({ API_BASE_URL }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for filters
  const [filter, setFilter] = useState({
      period: 'all', // all, day, week, month, year, custom
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      startDate: '',
      endDate: ''
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (filter.period !== 'all') {
            params.append('period', filter.period);
        }
        if (filter.period === 'month' || filter.period === 'year') {
            params.append('year', filter.year);
        }
        if (filter.period === 'month') {
            params.append('month', filter.month);
        }
        if (filter.period === 'custom' && filter.startDate && filter.endDate) {
            params.append('startDate', filter.startDate);
            params.append('endDate', filter.endDate);
        }

        const response = await axios.get(`${API_BASE_URL}/stats?${params.toString()}`, {
          withCredentials: true // Relies on HttpOnly cookie
        });

        setStats(response.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch statistics.';
        setError(errorMessage);
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_BASE_URL, filter]);

  const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilter(prev => ({ ...prev, [name]: value }));
  };
  
  const renderContent = () => {
    if (loading) {
      return <div className="loading-spinner">Loading statistics...</div>;
    }
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    if (!stats) {
        return <div className="no-data">No statistics to display.</div>;
    }
      if (stats.totalBookings === 0 && stats.filter?.period !== 'all' ) {
      return <div className="no-data">No booking data found for the selected period.</div>;
    }

    return (
        <>
            <div className="stats-grid">
                <StatCard 
                  title="Total Revenue" 
                  value={`₹${stats.totalRevenue.toLocaleString()}`} 
                  icon={<IndianRupee size={24} />} 
                  color="var(--success)" 
                />
                <StatCard 
                  title="Bookings (Period)" 
                  value={stats.totalBookings} 
                  icon={<CalendarDays size={24} />} 
                  color="var(--accent)" 
                />
                <StatCard 
                  title="Total Users" 
                  value={stats.totalUsers} 
                  icon={<Users size={24} />} 
                  color="var(--secondary)" 
                />
                <StatCard 
                  title="Total Halls" 
                  value={stats.totalHalls} 
                  icon={<Building size={24} />} 
                  color="var(--primary-light)" 
                />
            </div>

            <div className="stats-details-grid">
                <div className="bookings-by-status">
                    <h3 className="detail-title">Bookings by Status</h3>
                    {stats.bookingsByStatus.length > 0 ? (
                        stats.bookingsByStatus.map(status => (
                            <div key={status._id} className="status-item">
                                <span className="status-name">{status._id}</span>
                                <span className="status-count">{status.count}</span>
                            </div>
                        ))
                    ) : (
                        <p>No booking data for this period.</p>
                    )}
                </div>

                <div className="recent-bookings">
                    <h3 className="detail-title">Recent Bookings</h3>
                    {stats.recentBookings.length > 0 ? (
                        <table className="recent-bookings-table">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>User</th>
                                    <th>Hall</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentBookings.map(booking => (
                                    <tr key={booking._id}>
                                        <td>{booking.booking_id}</td>
                                        <td>{booking.user_id ? booking.user_id.name : 'N/A'}</td>
                                        <td>{booking.hall_id ? booking.hall_id.hall_name : 'N/A'}</td>
                                        <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                         <p>No recent bookings for this period.</p>
                    )}
                </div>
            </div>
        </>
    )
  }

  return (
    <div className="admin-stats-container">
      <div className="stats-header">
          <h1>Admin Dashboard</h1>
      </div>

      <div className="filter-bar">
          <div className="filter-group">
              <label htmlFor="period">Filter by:</label>
              <select name="period" id="period" value={filter.period} onChange={handleFilterChange}>
                  <option value="all">All Time</option>
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                  <option value="custom">Custom</option>
              </select>
          </div>
          
          {filter.period === 'month' && (
              <div className="filter-group">
                  <input type="number" name="month" value={filter.month} onChange={handleFilterChange} min="1" max="12" placeholder="Month"/>
                  <input type="number" name="year" value={filter.year} onChange={handleFilterChange} min="2020" placeholder="Year"/>
              </div>
          )}

          {filter.period === 'year' && (
               <div className="filter-group">
                  <input type="number" name="year" value={filter.year} onChange={handleFilterChange} min="2020" placeholder="Year"/>
              </div>
          )}
          
          {filter.period === 'custom' && (
              <div className="filter-group">
                  <label>From:</label>
                  <input type="date" name="startDate" value={filter.startDate} onChange={handleFilterChange} />
                  <label>To:</label>
                  <input type="date" name="endDate" value={filter.endDate} onChange={handleFilterChange} />
              </div>
          )}
      </div>

      {renderContent()}
      
    </div>
  );
};

export default AdminStats;