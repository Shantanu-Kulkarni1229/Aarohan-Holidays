import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IndianRupee, ClipboardList, Compass, Users, Mail, Star, RefreshCw, Plus, Mountain,
  Sparkles, AlertCircle, ArrowRight, Edit, CheckCircle2, Clock,
} from 'lucide-react';
import api from '../api/api';
import { showError } from '../utils/toast';

const colors = { primary: '#1E9ABF', secondary: '#E66926', text: '#1F2937', textLight: '#6B7280', border: '#E5E7EB' };

const RANGES = [
  { key: 'all', label: 'All time' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Last 7 days' },
  { key: 'month', label: 'Last 30 days' },
  { key: 'year', label: 'Last 12 months' },
];
const RANGE_DAYS = { today: 1, week: 7, month: 30, year: 365 };

const inr = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  pending: 'bg-amber-100 text-amber-800',
  cancelled: 'bg-red-100 text-red-800',
};

const StatCard = ({ title, value, hint, icon: Icon, color }) => (
  <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: colors.border }}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: colors.textLight }}>{title}</p>
        <p className="text-2xl sm:text-3xl font-bold mt-1 truncate" style={{ color }}>{value}</p>
        {hint && <p className="text-xs mt-1" style={{ color: colors.textLight }}>{hint}</p>}
      </div>
      <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
        <Icon size={22} style={{ color }} />
      </div>
    </div>
  </div>
);

const AttentionCard = ({ to, count, label, icon: Icon, color }) => (
  <Link
    to={to}
    className="flex items-center gap-3 bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
    style={{ borderColor: count > 0 ? color : colors.border }}
  >
    <span className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
      <Icon size={18} style={{ color }} />
    </span>
    <span className="flex-1 min-w-0">
      <span className="block text-xl font-bold" style={{ color: count > 0 ? color : colors.text }}>{count}</span>
      <span className="block text-xs" style={{ color: colors.textLight }}>{label}</span>
    </span>
    <ArrowRight size={16} style={{ color: colors.textLight }} />
  </Link>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [treks, setTreks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [enquiryStats, setEnquiryStats] = useState(null);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState([]);
  const [range, setRange] = useState('all');

  const load = useCallback(async () => {
    const jobs = {
      tours: api.get('/admin/tours'),
      treks: api.get('/admin/treks'),
      bookings: api.get('/admin/bookings'),
      enquiries: api.get('/other-services/stats'), // the collection the Enquiries screen manages
      reviews: api.get('/testimonials/admin/stats'),
    };
    // One slow or failing source shouldn't blank the whole dashboard
    const names = Object.keys(jobs);
    const results = await Promise.allSettled(Object.values(jobs));
    const byName = Object.fromEntries(names.map((n, i) => [n, results[i]]));
    const ok = (name) => byName[name].status === 'fulfilled';
    const data = (name) => byName[name].value.data;

    if (ok('tours')) setTours(data('tours').data || []);
    if (ok('treks')) setTreks(data('treks').data || []);
    if (ok('bookings')) setBookings(data('bookings').data || []);
    if (ok('enquiries')) setEnquiryStats(data('enquiries').data);
    if (ok('reviews')) setReviewStats(data('reviews').data);

    const failedNames = names.filter((n) => !ok(n));
    setFailed(failedNames);
    if (failedNames.length === names.length) showError('Could not load the dashboard. Please check your connection.');
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  // Booking figures follow the selected range; package counts are always current
  const inRange = useMemo(() => {
    if (range === 'all') return bookings;
    const since = Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000;
    return bookings.filter((b) => new Date(b.createdAt).getTime() >= since);
  }, [bookings, range]);

  const live = inRange.filter((b) => b.bookingStatus !== 'cancelled');
  const revenue = inRange
    .filter((b) => b.paymentStatus !== 'refunded' && b.paymentStatus !== 'failed')
    .reduce((sum, b) => sum + (Number(b.amountPaid) || 0), 0);
  const travellers = live.reduce((sum, b) => sum + (Number(b.numberOfMembers) || 0), 0);
  const pendingBookings = bookings.filter((b) => b.bookingStatus === 'pending').length;
  const activePackages = tours.filter((t) => t.isActive).length + treks.filter((t) => t.isActive).length;
  const recentBookings = [...inRange].slice(0, 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.primary }} />
          <p style={{ color: colors.textLight }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const packageRow = (item, type) => (
    <div key={item._id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: colors.border }}>
      <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${type === 'tour' ? colors.primary : colors.secondary}15` }}>
        {type === 'tour' ? <Compass size={18} style={{ color: colors.primary }} /> : <Mountain size={18} style={{ color: colors.secondary }} />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate" style={{ color: colors.text }}>{item.name}</p>
        <p className="text-xs flex items-center gap-1" style={{ color: item.isActive ? '#059669' : '#D97706' }}>
          {item.isActive ? <CheckCircle2 size={12} /> : <Clock size={12} />} {item.isActive ? 'Live on website' : 'Hidden (draft)'}
        </p>
      </div>
      <button
        onClick={() => navigate(`/admin/${type}s/edit/${item._id}`)}
        className="p-2 rounded-lg hover:bg-gray-100"
        aria-label={`Edit ${item.name}`}
        style={{ color: colors.textLight }}
      >
        <Edit size={16} />
      </button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.text }}>Dashboard</h1>
          <p className="text-sm" style={{ color: colors.textLight }}>What needs your attention and how the business is doing.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1E9ABF]/40"
            style={{ borderColor: colors.border }}
            aria-label="Time range for bookings and revenue"
          >
            {RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
            style={{ borderColor: colors.border, color: colors.text }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {failed.length > 0 && (
        <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 text-amber-800 text-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>Some figures could not be loaded ({failed.join(', ')}). Use Refresh to try again.</span>
        </div>
      )}

      <section aria-label="Needs attention" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AttentionCard to="/admin/bookings" count={pendingBookings} label="Bookings waiting for confirmation" icon={ClipboardList} color={colors.secondary} />
        <AttentionCard to="/admin/enquiries" count={enquiryStats?.pendingEnquiries || 0} label="New enquiries to reply to" icon={Mail} color={colors.primary} />
        <AttentionCard to="/admin/testimonials" count={reviewStats?.pending || 0} label="Reviews waiting for approval" icon={Star} color="#9333EA" />
      </section>

      <section aria-label="Key figures" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Revenue collected" value={inr(revenue)} hint={`${RANGES.find((r) => r.key === range).label} · payments received`} icon={IndianRupee} color="#059669" />
        <StatCard title="Bookings" value={live.length} hint={`${inRange.length - live.length} cancelled`} icon={ClipboardList} color={colors.primary} />
        <StatCard title="Travellers booked" value={travellers} hint="Across active bookings" icon={Users} color={colors.secondary} />
        <StatCard title="Live packages" value={activePackages} hint={`${tours.length} tours · ${treks.length} treks in total`} icon={Compass} color="#9333EA" />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 bg-white rounded-xl border shadow-sm" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: colors.border }}>
            <h2 className="font-semibold" style={{ color: colors.text }}>Recent bookings</h2>
            <Link to="/admin/bookings" className="text-sm font-medium hover:underline" style={{ color: colors.primary }}>View all</Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="p-8 text-center text-sm" style={{ color: colors.textLight }}>No bookings in this period yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide" style={{ color: colors.textLight }}>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Package</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Travel date</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: colors.border }}>
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium" style={{ color: colors.text }}>{b.name}</p>
                        <p className="text-xs" style={{ color: colors.textLight }}>{b.bookingReference}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[14rem] truncate" style={{ color: colors.text }}>
                        {b.tourId?.name || b.trekId?.name || '—'}
                        <span className="block text-xs capitalize" style={{ color: colors.textLight }}>{b.bookingType}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: colors.text }}>{formatDate(b.bookingDate)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap font-medium" style={{ color: colors.text }}>{inr(b.totalPrice)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[b.bookingStatus] || 'bg-gray-100 text-gray-700'}`}>{b.bookingStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl border shadow-sm p-4" style={{ borderColor: colors.border }}>
          <h2 className="font-semibold mb-3" style={{ color: colors.text }}>Quick actions</h2>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: 'Add a tour', to: '/admin/tours/new', icon: Compass, color: colors.primary },
              { label: 'Add a trek', to: '/admin/treks/new', icon: Mountain, color: colors.secondary },
              { label: 'Create offline booking', to: '/admin/bookings', icon: Plus, color: '#059669' },
              { label: 'Create custom booking', to: '/admin/custom-bookings/create', icon: Sparkles, color: '#9333EA' },
            ].map(({ label, to, icon: Icon, color }) => (
              <Link key={label} to={to} className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm transition-shadow" style={{ borderColor: colors.border }}>
                <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                  <Icon size={18} style={{ color }} />
                </span>
                <span className="font-medium text-sm" style={{ color: colors.text }}>{label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border shadow-sm p-4" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ color: colors.text }}>Latest tours</h2>
            <Link to="/admin/tours" className="text-sm font-medium hover:underline" style={{ color: colors.primary }}>Manage</Link>
          </div>
          <div className="space-y-2">{tours.length ? tours.slice(0, 5).map((t) => packageRow(t, 'tour')) : <p className="text-sm py-4 text-center" style={{ color: colors.textLight }}>No tours yet.</p>}</div>
        </section>
        <section className="bg-white rounded-xl border shadow-sm p-4" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ color: colors.text }}>Latest treks</h2>
            <Link to="/admin/treks" className="text-sm font-medium hover:underline" style={{ color: colors.primary }}>Manage</Link>
          </div>
          <div className="space-y-2">{treks.length ? treks.slice(0, 5).map((t) => packageRow(t, 'trek')) : <p className="text-sm py-4 text-center" style={{ color: colors.textLight }}>No treks yet.</p>}</div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
