import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Helper component for individual stat cards
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

// Main component for the Admin Statistics Dashboard
const AdminStats = ({ API_BASE_URL, getAuthToken }) => {
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
        const token = getAuthToken();
        if (!token) {
          setError('Authentication token not found.');
          return;
        }

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
          headers: { Authorization: `Bearer ${token}` },
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
  }, [API_BASE_URL, getAuthToken, filter]);

  const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilter(prev => ({ ...prev, [name]: value }));
  };

  // Inline styling using the provided color palette
  const styles = `
    :root {
      --primary: #800000;
      --primary-light: #a04040;
      --secondary: #e67e22;
      --accent: #3498db;
      --success: #27ae60;
      --danger: #e74c3c;
      --warning: #f39c12;
      --info: #3498db;
      --neutral-bg: #f8f9fa;
      --neutral-text: #343a40;
      --neutral-light: #ecf0f1;
      --neutral-border: #dee2e6;
      --white: #ffffff;
      --shadow: rgba(0, 0, 0, 0.075);
      --shadow-strong: rgba(0, 0, 0, 0.15);
      --font-primary: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      --border-radius-sm: 4px;
      --border-radius-md: 8px;
      --border-radius-lg: 12px;
      --transition-speed: 0.3s;
    }

    .admin-stats-container {
      font-family: var(--font-primary);
      background-color: var(--neutral-bg);
      padding: 2rem;
      color: var(--neutral-text);
    }
    
    .stats-header {
      color: var(--primary);
      margin-bottom: 1.5rem;
      border-bottom: 2px solid var(--neutral-border);
      padding-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* New Filter Bar Styles */
    .filter-bar {
      background: var(--white);
      padding: 1rem 1.5rem;
      margin-bottom: 2rem;
      border-radius: var(--border-radius-md);
      box-shadow: 0 2px 8px var(--shadow);
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-group {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }
    
    .filter-group label {
        font-weight: 500;
        color: var(--neutral-text);
    }
    
    .filter-group select, .filter-group input {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--neutral-border);
        border-radius: var(--border-radius-sm);
        background: var(--neutral-bg);
        font-family: var(--font-primary);
        font-size: 0.9rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background-color: var(--white);
      border-radius: var(--border-radius-md);
      box-shadow: 0 4px 12px var(--shadow-strong);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      transition: transform var(--transition-speed), box-shadow var(--transition-speed);
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-card-title { font-size: 0.9rem; color: #6c757d; text-transform: uppercase; margin: 0; }
    .stat-card-value { font-size: 2rem; font-weight: 700; color: var(--neutral-text); margin: 0.25rem 0 0 0; }
    .stat-card-icon { color: var(--white); font-size: 1.5rem; width: 60px; height: 60px; border-radius: 50%; display: flex; justify-content: center; align-items: center; }

    .stats-details-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; align-items: flex-start; }
    .bookings-by-status, .recent-bookings { background: var(--white); padding: 1.5rem; border-radius: var(--border-radius-lg); box-shadow: 0 4px 12px var(--shadow-strong); }
    .detail-title { margin-top: 0; margin-bottom: 1.5rem; color: var(--primary); }

    .status-item { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--neutral-light); }
    .status-item:last-child { border-bottom: none; }
    .status-name { font-weight: 500; }
    .status-count { background: var(--primary-light); color: var(--white); padding: 0.2rem 0.6rem; border-radius: var(--border-radius-sm); font-weight: bold; }
    
    .recent-bookings-table { width: 100%; border-collapse: collapse; }
    .recent-bookings-table th, .recent-bookings-table td { padding: 0.8rem; text-align: left; border-bottom: 1px solid var(--neutral-border); }
    .recent-bookings-table th { background-color: var(--neutral-bg); color: var(--primary); font-weight: 600; }
    
    .loading-spinner, .error-message, .no-data { text-align: center; padding: 3rem; font-size: 1.2rem; }
    .error-message { color: var(--danger); background-color: #fdd; border: 1px solid var(--danger); border-radius: var(--border-radius-md); }
    .no-data { color: var(--neutral-text); background-color: var(--neutral-light); border-radius: var(--border-radius-md); }

    @media (max-width: 992px) { .stats-details-grid { grid-template-columns: 1fr; } }
    @media (max-width: 768px) { .admin-stats-container { padding: 1rem; } .stats-header { font-size: 1.5rem; flex-direction: column; align-items: flex-start; } .stat-card-value { font-size: 1.5rem; } .filter-bar { flex-direction: column; align-items: stretch; } }
  `;
  
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
              <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon="₹" color="var(--success)" />
              <StatCard title="Bookings (Period)" value={stats.totalBookings} icon="📅" color="var(--accent)" />
              <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="var(--secondary)" />
              <StatCard title="Total Halls" value={stats.totalHalls} icon="🏛️" color="var(--primary-light)" />
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
    <>
      <style>{styles}</style>
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
    </>
  );
};

export default AdminStats;

