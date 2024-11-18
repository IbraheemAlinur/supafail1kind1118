import React from 'react';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const BLOG_POSTS = [
  {
    id: 1,
    title: 'Building Trust in Professional Communities',
    excerpt: 'Discover how Ki points create a sustainable ecosystem of giving and receiving in professional networks.',
    author: 'Sarah Chen',
    authorRole: 'Community Lead',
    date: 'Mar 15, 2024',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1000',
    category: 'Community'
  },
  {
    id: 2,
    title: 'The Power of Skill Exchange in Career Growth',
    excerpt: 'Learn how professionals are accelerating their career growth through meaningful collaborations.',
    author: 'Michael Ross',
    authorRole: 'Career Development',
    date: 'Mar 12, 2024',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000',
    category: 'Career Growth'
  },
  {
    id: 3,
    title: 'Why Ki Points Matter in Professional Networks',
    excerpt: 'Understanding the innovative approach to measuring and rewarding professional contributions.',
    author: 'Alex Thompson',
    authorRole: 'Product Strategy',
    date: 'Mar 10, 2024',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000',
    category: 'Innovation'
  }
];

const FEATURED_POST = {
  id: 4,
  title: 'The Future of Professional Networking',
  excerpt: 'How 1Kind AI is revolutionizing the way professionals connect and collaborate.',
  author: 'David Kim',
  authorRole: 'CEO',
  date: 'Mar 18, 2024',
  readTime: '8 min read',
  image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=2000',
  category: 'Featured'
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900">
            1Kind AI Blog
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Insights on community, collaboration, and professional growth
          </p>
        </div>

        {/* Featured Post */}
        <Link to={`/blog/${FEATURED_POST.id}`} className="block mb-16 group">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src={FEATURED_POST.image}
              alt={FEATURED_POST.title}
              className="w-full h-[400px] object-cover transform transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {FEATURED_POST.category}
              </span>
              <h2 className="mt-4 text-3xl font-bold text-white group-hover:text-indigo-100 transition-colors">
                {FEATURED_POST.title}
              </h2>
              <p className="mt-2 text-lg text-gray-200">
                {FEATURED_POST.excerpt}
              </p>
              <div className="mt-4 flex items-center text-gray-200">
                <User className="h-5 w-5 mr-2" />
                <span className="mr-4">{FEATURED_POST.author}, {FEATURED_POST.authorRole}</span>
                <Calendar className="h-5 w-5 mr-2" />
                <span className="mr-4">{FEATURED_POST.date}</span>
                <Clock className="h-5 w-5 mr-2" />
                <span>{FEATURED_POST.readTime}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <Link to={`/blog/${post.id}`}>
                <div className="overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover transform transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {post.category}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    <span className="mr-4">{post.author}</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="mr-4">{post.date}</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                  <div className="mt-4 inline-flex items-center text-indigo-600 group-hover:text-indigo-500">
                    Read more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 bg-indigo-50 rounded-2xl p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Stay Updated
            </h2>
            <p className="text-gray-600 mb-6">
              Get the latest insights on community building and professional growth delivered to your inbox.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}