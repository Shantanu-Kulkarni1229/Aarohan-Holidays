import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Wallet, Mountain, Compass, Users, MapPin, Calendar, Headphones } from 'lucide-react';

const BUDGETS = [
  { label: 'Any budget', value: '' },
  { label: 'Under ₹10,000', value: '10000' },
  { label: 'Under ₹25,000', value: '25000' },
  { label: 'Under ₹50,000', value: '50000' },
  { label: 'Under ₹1,00,000', value: '100000' },
];

const STATS = [
  { icon: Users, value: '15,000+', label: 'Happy travellers' },
  { icon: MapPin, value: '250+', label: 'Destinations' },
  { icon: Calendar, value: '5+ years', label: 'Of experience' },
  { icon: Headphones, value: '24/7', label: 'Travel support' },
];

// Search strip that overlaps the hero + a trust bar. Search hands off to the list pages via ?q= and ?max=.
const HomeIntro = () => {
  const navigate = useNavigate();
  const [type, setType] = useState('tours');
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (budget) params.set('max', budget);
    const qs = params.toString();
    navigate(`/${type}${qs ? `?${qs}` : ''}`);
  };

  return (
    <section aria-label="Find your trip" className="relative z-20 px-4 -mt-16 sm:-mt-20">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 sm:p-6">
        <div className="flex gap-2 mb-4" role="tablist" aria-label="Trip type">
          {[
            { key: 'tours', label: 'Tours', icon: Compass },
            { key: 'treks', label: 'Treks', icon: Mountain },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={type === key}
              onClick={() => setType(key)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
              style={type === key ? { backgroundColor: '#1E9ABF', color: '#fff' } : { backgroundColor: '#F1F5F9', color: '#334155' }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[1fr_16rem_auto] gap-3">
          <label className="relative block">
            <span className="sr-only">Destination or trip name</span>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={type === 'tours' ? 'Where do you want to go? (e.g. Kashmir)' : 'Which trek? (e.g. Kedarkantha)'}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E9ABF]/40 focus:border-[#1E9ABF]"
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Budget per person</span>
            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E9ABF]/40 focus:border-[#1E9ABF]"
            >
              {BUDGETS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl font-bold text-white shadow-md hover:shadow-lg hover:brightness-95 transition"
            style={{ backgroundColor: '#E66926' }}
          >
            Search
          </button>
        </form>
      </div>

      <ul className="max-w-5xl mx-auto mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {STATS.map(({ icon: Icon, value, label }) => (
          <li key={label} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <span className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
              <Icon className="w-5 h-5" style={{ color: '#1E9ABF' }} />
            </span>
            <span className="min-w-0">
              <span className="block font-bold text-gray-900 leading-tight">{value}</span>
              <span className="block text-xs text-gray-500 truncate">{label}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HomeIntro;
