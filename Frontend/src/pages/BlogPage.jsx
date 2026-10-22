import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, User, Clock, Tag, ArrowLeft, Share2, ThumbsUp, Eye } from 'lucide-react';
import axios from 'axios';
import { showSuccess, showError, showApiError } from '../utils/toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Seo from '../components/Seo';
import { API_BASE_URL } from '../api/api';
import { SITE } from '../utils/contact';
import '../components/RichTextContent.css';

const colors = { primary: '#1E9ABF', secondary: '#E66926' };

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

const BlogPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    window.scrollTo(0, 0);
    setLoading(true);

    axios
      .get(`${API_BASE_URL}/blogs/${identifier}`)
      .then((res) => {
        if (!cancelled && res.data.success) setBlog(res.data.data);
      })
      .catch((err) => {
        if (cancelled) return;
        showApiError(err);
        navigate('/blogs', { replace: true });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [identifier, navigate]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/blogs/latest?limit=5`)
      .then((res) => res.data.success && setLatestBlogs(res.data.data))
      .catch(() => {}); // sidebar is optional
  }, []);

  const handleLike = async () => {
    if (!blog || liking) return;
    setLiking(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/blogs/${blog._id}/like`);
      if (res.data.success) {
        setBlog((prev) => ({ ...prev, likes: res.data.data.likes }));
        showSuccess('Thanks for liking this post!');
      }
    } catch (err) {
      showApiError(err);
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: blog.title, text: blog.excerpt?.replace(/<[^>]*>/g, ''), url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showSuccess('Link copied to clipboard!');
      }
    } catch (err) {
      if (err?.name !== 'AbortError') showError('Could not share this link');
    }
  };

  if (loading) {
    return (
      <>
        <Seo title="Loading article" noindex />
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4" style={{ borderColor: colors.primary }} />
        </div>
      </>
    );
  }

  if (!blog) return null;

  const published = blog.publishedAt || blog.createdAt;
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt?.replace(/<[^>]*>/g, ' '),
    image: blog.featuredImage ? [blog.featuredImage] : undefined,
    datePublished: published,
    dateModified: blog.updatedAt || published,
    author: { '@type': 'Person', name: blog.author },
    publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: SITE.logo } },
    mainEntityOfPage: `${SITE.url}/blogs/${blog.slug || blog._id}`,
  };

  return (
    <>
      <Seo
        title={blog.metaTitle || blog.title}
        description={blog.metaDescription || blog.excerpt}
        image={blog.featuredImage}
        type="article"
        path={`/blogs/${blog.slug || blog._id}`}
        jsonLd={articleLd}
      />
      <Navbar />
      <main className="min-h-screen bg-white">
        <header className="relative h-96 overflow-hidden bg-gray-900">
          {blog.featuredImage && <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/55" />

          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-10">
              <Link to="/blogs" className="mb-4 inline-flex items-center gap-2 text-white hover:text-gray-200">
                <ArrowLeft size={18} /> Back to Blogs
              </Link>

              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {blog.category && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: colors.secondary }}>
                      {blog.category}
                    </span>
                  )}
                  {blog.featured && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
                      Featured
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{blog.title}</h1>
                {blog.subtitle && <p className="text-lg md:text-xl text-gray-200 mb-4">{blog.subtitle}</p>}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white text-sm">
                  <span className="flex items-center gap-2"><User size={16} />{blog.author}</span>
                  <span className="flex items-center gap-2"><Calendar size={16} />{formatDate(published)}</span>
                  <span className="flex items-center gap-2"><Clock size={16} />{blog.readTime} min read</span>
                  <span className="flex items-center gap-2"><Eye size={16} />{blog.views || 0} views</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-10 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <article className="lg:w-2/3 min-w-0">
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-12">
                {blog.excerpt && (
                  <div
                    className="text-lg text-gray-700 mb-8 pb-8 border-b border-gray-200 italic rich-text-content"
                    dangerouslySetInnerHTML={{ __html: blog.excerpt }}
                  />
                )}

                <div className="text-gray-800 leading-relaxed rich-text-content" dangerouslySetInnerHTML={{ __html: blog.content }} />

                {blog.tags?.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                          <Tag size={14} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-8 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={handleLike}
                    disabled={liking}
                    className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <ThumbsUp size={20} />
                    <span className="font-semibold">{blog.likes || 0} Likes</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Share2 size={20} />
                    <span className="font-semibold">Share</span>
                  </button>
                </div>
              </div>
            </article>

            <aside className="lg:w-1/3">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+1rem)] space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">About the Author</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: colors.primary }}>
                      {blog.author?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{blog.author}</p>
                      <p className="text-sm text-gray-600">Travel Writer</p>
                    </div>
                  </div>
                </div>

                {latestBlogs.some((b) => b._id !== blog._id) && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">More Articles</h2>
                    <div className="space-y-4">
                      {latestBlogs.filter((b) => b._id !== blog._id).slice(0, 4).map((item) => (
                        <Link key={item._id} to={`/blogs/${item.slug || item._id}`} className="flex gap-3 group">
                          {item.featuredImage && (
                            <img src={item.featuredImage} alt="" loading="lazy" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-[#1E9ABF] transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">{formatDate(item.publishedAt || item.createdAt)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogPage;
