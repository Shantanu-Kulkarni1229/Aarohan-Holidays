import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Seo from '../components/Seo';

const NotFound = () => (
  <>
    <Seo title="Page not found" noindex />
    <Navbar />
    <main className="min-h-[70vh] flex items-center justify-center px-4 pt-[calc(var(--header-h)+2rem)] pb-16 bg-slate-50">
      <div className="text-center max-w-md">
        <p className="text-7xl font-black text-[#1E9ABF] mb-2">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">This trail doesn't exist</h1>
        <p className="text-gray-600 mb-8">The page you're looking for was moved or never existed. Let's get you back on the route.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="px-6 py-3 rounded-xl font-semibold text-white bg-[#1E9ABF] hover:opacity-90">Go home</Link>
          <Link to="/tours" className="px-6 py-3 rounded-xl font-semibold text-[#E66926] border-2 border-[#E66926] hover:bg-orange-50">Browse tours</Link>
          <Link to="/treks" className="px-6 py-3 rounded-xl font-semibold text-[#E66926] border-2 border-[#E66926] hover:bg-orange-50">Browse treks</Link>
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default NotFound;
