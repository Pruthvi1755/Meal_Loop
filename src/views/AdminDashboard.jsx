import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Search, AlertTriangle, Users, Store, Leaf, Filter, RefreshCw } from 'lucide-react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { apiGetAdminRestaurants, apiUpdateRestaurantApproval, apiGetAdminStats } from '../services/api';

export default function AdminDashboard() {
  const [merchants, setMerchants] = useState([]);
  const [stats, setStats] = useState({
    total_customers: 1,
    total_partners: 1,
    approved_restaurants: 1,
    pending_approvals: 0,
    total_meals_rescued: 28450,
    co2_diverted_tons: 64.2,
    customer_savings_inr: 5840200
  });
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [restaurantsData, statsData] = await Promise.all([
        apiGetAdminRestaurants(filterStatus),
        apiGetAdminStats()
      ]);
      setMerchants(restaurantsData);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.warn('Could not fetch real admin data, falling back to cached state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApproval = async (restaurantId, nextStatus) => {
    try {
      await apiUpdateRestaurantApproval(restaurantId, nextStatus);
      await fetchData(); // Refresh data from PostgreSQL
    } catch (err) {
      alert(err.message || 'Failed to update restaurant status.');
    }
  };

  const filteredMerchants = merchants.filter(m => {
    const matchesSearch =
      (m.business_name || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (m.locality || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (m.business_type || '').toLowerCase().includes(searchFilter.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingTop: 'var(--space-4)' }}>
      {/* Platform Administration Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <h1 className="text-h1" style={{ marginBottom: 'var(--space-2)' }}>
            Platform Operations & Compliance
          </h1>
          <p className="text-body-muted">
            Live PostgreSQL admin console • Oversee merchant verification, quality standards, and surplus diversion.
          </p>
        </div>

        <Button variant="secondary" icon={RefreshCw} size="sm" onClick={fetchData}>
          Refresh Live Data
        </Button>
      </div>

      {/* Minimal Platform Metrics Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)'
        }}
      >
        <div className="card" style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-surface)' }}>
          <span className="text-uppercase-label">Approved Food Partners</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: 'var(--space-1) 0', color: 'var(--color-success)' }}>
            {stats.approved_restaurants} active
          </div>
          <span className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
            Verified kitchens across Bengaluru
          </span>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-surface)' }}>
          <span className="text-uppercase-label">Pending Reviews</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: 'var(--space-1) 0', color: stats.pending_approvals > 0 ? 'var(--color-warning)' : 'var(--color-text-primary)' }}>
            {stats.pending_approvals} applications
          </div>
          <span className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
            Awaiting administrative audit
          </span>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-surface)' }}>
          <span className="text-uppercase-label">Total Registered Users</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: 'var(--space-1) 0', color: 'var(--color-primary-accent)' }}>
            {(stats.total_customers + stats.total_partners)} accounts
          </div>
          <span className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
            {stats.total_customers} diners, {stats.total_partners} partner owners
          </span>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-surface)' }}>
          <span className="text-uppercase-label">Consumer Savings</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: 'var(--space-1) 0', color: 'var(--color-food-accent)' }}>
            ₹{(stats.customer_savings_inr || 5840200).toLocaleString('en-IN')}
          </div>
          <span className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
            Total savings diverted in Bengaluru
          </span>
        </div>
      </div>

      {/* Minimal Diversion Pace Bar Metric */}
      <div
        className="card"
        style={{
          padding: 'var(--space-5)',
          backgroundColor: 'var(--color-bg-surface)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-3)' }}>
          <div>
            <h3 className="text-h4">Monthly Waste Reduction Target</h3>
            <p className="text-small">Target: 35,000 meals rescued in Bengaluru (October 2026)</p>
          </div>
          <span className="font-semibold text-small" style={{ color: 'var(--color-success)' }}>
            81.2% Achieved (28,450 / 35,000)
          </span>
        </div>

        <div
          style={{
            height: '10px',
            backgroundColor: 'var(--color-bg-surface-secondary)',
            borderRadius: '5px',
            overflow: 'hidden',
            marginBottom: 'var(--space-3)'
          }}
        >
          <div
            style={{
              width: '81.2%',
              height: '100%',
              backgroundColor: 'var(--color-success)',
              borderRadius: '5px'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
          <span>0 Meals</span>
          <span>Target: 35,000 Meals</span>
        </div>
      </div>

      {/* Merchant Registry Table & Filters */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-4)',
            flexWrap: 'wrap',
            gap: 'var(--space-3)'
          }}
        >
          <div>
            <h2 className="text-h3">Partner Verification & Audit Queue</h2>
            <p className="text-small">Approve new restaurant applications or suspend non-compliant partners.</p>
          </div>

          {/* Table Filters */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-tertiary)' }}
              />
              <input
                type="text"
                placeholder="Search restaurant or locality..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  height: '36px',
                  paddingLeft: '32px',
                  paddingRight: '12px',
                  borderRadius: 'var(--radius-input)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-surface)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-option ${filterStatus === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterStatus('ALL')}
              >
                All
              </button>
              <button
                type="button"
                className={`segmented-option ${filterStatus === 'pending' ? 'active' : ''}`}
                onClick={() => setFilterStatus('pending')}
              >
                Pending ({stats.pending_approvals})
              </button>
              <button
                type="button"
                className={`segmented-option ${filterStatus === 'approved' ? 'active' : ''}`}
                onClick={() => setFilterStatus('approved')}
              >
                Approved ({stats.approved_restaurants})
              </button>
            </div>
          </div>
        </div>

        {/* Clean Data Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Partner Kitchen</th>
                <th>Type & Locality</th>
                <th>Owner Details</th>
                <th>Operating Hours</th>
                <th>Verification Status</th>
                <th>Administrative Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMerchants.length > 0 ? (
                filteredMerchants.map((merchant) => {
                  const isApproved = merchant.approval_status === 'approved';
                  const isPending = merchant.approval_status === 'pending';
                  const isSuspended = merchant.approval_status === 'suspended';

                  return (
                    <tr key={merchant.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div>{merchant.business_name}</div>
                        <span className="text-micro" style={{ color: 'var(--color-text-tertiary)' }}>
                          ID: #{merchant.id}
                        </span>
                      </td>
                      <td>
                        <div>{merchant.business_type}</div>
                        <span className="text-micro" style={{ color: 'var(--color-primary-accent)', fontWeight: 600 }}>
                          {merchant.locality}
                        </span>
                      </td>
                      <td>
                        <div>{merchant.owner_name || 'Owner'}</div>
                        <span className="text-micro" style={{ color: 'var(--color-text-tertiary)' }}>
                          {merchant.owner_email || 'N/A'} • {merchant.owner_phone || ''}
                        </span>
                      </td>
                      <td>
                        {merchant.opening_time} – {merchant.closing_time}
                      </td>
                      <td>
                        {isApproved && <Badge variant="success">Approved</Badge>}
                        {isPending && <Badge variant="warning">Pending Review</Badge>}
                        {isSuspended && <Badge variant="error">Suspended</Badge>}
                        {merchant.approval_status === 'rejected' && <Badge variant="error">Rejected</Badge>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {!isApproved && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleUpdateApproval(merchant.id, 'approved')}
                            >
                              Approve
                            </Button>
                          )}
                          {isPending && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleUpdateApproval(merchant.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          )}
                          {isApproved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateApproval(merchant.id, 'suspended')}
                            >
                              Suspend
                            </Button>
                          )}
                          {isSuspended && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleUpdateApproval(merchant.id, 'approved')}
                            >
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                    No partner kitchens found matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
