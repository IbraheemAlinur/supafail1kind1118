import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Share2, Bookmark } from 'lucide-react';

// This would typically come from an API or CMS
const BLOG_POSTS = {
  1: {
    title: 'Building Trust in Professional Communities',
    content: `
      <p class="mb-4">Trust is the foundation of any successful professional community. At 1Kind AI, we've developed a unique approach to fostering trust through our Ki points system, which creates tangible accountability and rewards for meaningful contributions.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">The Challenge of Online Trust</h2>
      <p class="mb-4">In traditional online communities, trust is often based solely on user profiles and reviews. However, this approach has limitations and can be manipulated. We needed a more robust solution that would encourage genuine, valuable interactions.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Enter Ki Points</h2>
      <p class="mb-4">Ki points serve as a measure of contribution and reliability within our community. Unlike traditional karma systems, Ki points have real value and can be exchanged for expertise and assistance. This creates a self-sustaining ecosystem where quality contributions are naturally rewarded.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Building Sustainable Communities</h2>
      <p class="mb-4">The key to building sustainable professional communities lies in creating the right incentives. When members see tangible benefits from their contributions, they're more likely to remain engaged and continue providing value to others.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Looking Ahead</h2>
      <p class="mb-4">As we continue to grow, we're exploring new ways to enhance trust and collaboration within our community. We're developing features that will make it even easier for professionals to connect and share their expertise.</p>
    `,
    author: 'Sarah Chen',
    authorRole: 'Community Lead',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    date: 'Mar 15, 2024',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=2000',
    category: 'Community'
  },
  2: {
    title: 'The Power of Skill Exchange in Career Growth',
    content: `
      <p class="mb-4">Professional development has traditionally been a one-way street, with individuals investing in courses or certifications. However, peer-to-peer skill exchange is emerging as a powerful alternative that offers unique advantages.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">The Evolution of Learning</h2>
      <p class="mb-4">Traditional learning methods often lack the practical, real-world context that professionals need. Skill exchange provides hands-on experience and immediate feedback from peers who are actively working in the field.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Benefits of Peer Learning</h2>
      <p class="mb-4">When professionals exchange skills, both parties benefit. The teacher reinforces their knowledge by explaining it to others, while the learner gains practical insights that might not be available through traditional channels.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Success Stories</h2>
      <p class="mb-4">We've seen numerous success stories on our platform, from developers learning new frameworks to marketers mastering analytics. The key is finding the right match and establishing clear objectives for the exchange.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Getting Started</h2>
      <p class="mb-4">Ready to accelerate your career through skill exchange? Start by identifying your strengths and areas where you'd like to improve. Then, connect with professionals who complement your skills and goals.</p>
    `,
    author: 'Michael Ross',
    authorRole: 'Career Development',
    authorImage: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=300',
    date: 'Mar 12, 2024',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2000',
    category: 'Career Growth'
  },
  3: {
    title: 'Why Ki Points Matter in Professional Networks',
    content: `
      <p class="mb-4">Ki points represent more than just a gamification system - they're a fundamental shift in how we measure and reward professional contributions. This innovative approach is changing how professionals interact and collaborate.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">The Problem with Traditional Networking</h2>
      <p class="mb-4">Professional networking often lacks clear incentives for meaningful contribution. Many platforms focus on connection quantity over quality, leading to superficial relationships.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">How Ki Points Work</h2>
      <p class="mb-4">Ki points create a tangible value system for professional contributions. When you help someone or share valuable knowledge, you earn points that can be used to seek help from others. This creates a sustainable ecosystem of giving and receiving.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Real-World Impact</h2>
      <p class="mb-4">We've seen Ki points facilitate everything from quick code reviews to comprehensive mentorship programs. The system ensures that everyone's time and expertise are properly valued.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Future Developments</h2>
      <p class="mb-4">As our platform grows, we're exploring new ways to make Ki points even more valuable. This includes partnerships with educational platforms and professional development resources.</p>
    `,
    author: 'Alex Thompson',
    authorRole: 'Product Strategy',
    authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    date: 'Mar 10, 2024',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2000',
    category: 'Innovation'
  },
  4: {
    title: 'The Future of Professional Networking',
    content: `
      <p class="mb-4">The landscape of professional networking is undergoing a radical transformation. Traditional platforms have focused on connection quantity over quality, leading to networks that are wide but shallow. At 1Kind AI, we're pioneering a new approach that prioritizes meaningful interactions and tangible value exchange.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">The Problem with Current Networking</h2>
      <p class="mb-4">Despite the proliferation of professional networking platforms, many professionals still struggle to build meaningful connections that drive career growth. The current paradigm often results in:</p>
      <ul class="list-disc ml-6 mb-4">
        <li>Superficial connections without real engagement</li>
        <li>Difficulty in quantifying the value of contributions</li>
        <li>Limited opportunities for meaningful collaboration</li>
        <li>Lack of trust in online professional relationships</li>
      </ul>

      <h2 class="text-2xl font-bold mt-8 mb-4">A New Paradigm: Value-First Networking</h2>
      <p class="mb-4">Our platform introduces a revolutionary approach to professional networking through three key innovations:</p>

      <h3 class="text-xl font-semibold mt-6 mb-3">1. Ki Points System</h3>
      <p class="mb-4">Unlike traditional networking metrics, Ki points provide a tangible measure of contribution and value exchange. This system ensures that helpful members are recognized and rewarded, creating a self-sustaining ecosystem of professional growth.</p>

      <h3 class="text-xl font-semibold mt-6 mb-3">2. Community-Driven Growth</h3>
      <p class="mb-4">We've built specialized communities where professionals can connect based on shared interests and goals. These communities facilitate deeper connections and more meaningful collaborations than traditional networking approaches.</p>

      <h3 class="text-xl font-semibold mt-6 mb-3">3. Skill Exchange Platform</h3>
      <p class="mb-4">Our platform facilitates direct skill exchange between professionals, allowing members to both teach and learn. This creates a dynamic environment where expertise is shared and valued appropriately.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Real Impact Stories</h2>
      <p class="mb-4">Early adopters of our platform have already seen remarkable results:</p>
      <blockquote class="border-l-4 border-indigo-500 pl-4 italic my-4">
        "Through 1Kind AI, I've made more meaningful professional connections in three months than I did in three years on traditional networking platforms." - Sarah K., UX Designer
      </blockquote>

      <h2 class="text-2xl font-bold mt-8 mb-4">Looking Ahead</h2>
      <p class="mb-4">The future of professional networking will be defined by:</p>
      <ul class="list-disc ml-6 mb-4">
        <li>Quality over quantity in professional relationships</li>
        <li>Tangible value exchange through skill sharing</li>
        <li>Trust-based communities with verified expertise</li>
        <li>AI-powered matching for optimal collaboration</li>
      </ul>

      <h2 class="text-2xl font-bold mt-8 mb-4">Join the Revolution</h2>
      <p class="mb-4">As we continue to develop and refine our platform, we're seeing a fundamental shift in how professionals connect and collaborate. The future of networking isn't about collecting connections – it's about building meaningful relationships that drive mutual growth and success.</p>

      <p class="mb-4">We invite you to be part of this transformation. Join 1Kind AI today and experience the future of professional networking firsthand.</p>
    `,
    author: 'David Kim',
    authorRole: 'CEO',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    date: 'Mar 18, 2024',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=2000',
    category: 'Featured'
  }
};

export default function BlogArticlePage() {
  const { id } = useParams();
  const post = BLOG_POSTS[Number(id)];

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Article not found</h2>
          <Link to="/blog" className="mt-4 text-indigo-600 hover:text-indigo-500 inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back button */}
        <Link to="/blog" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to blog
        </Link>

        {/* Article header */}
        <div className="mb-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {post.category}
          </span>
          <h1 className="mt-4 text-4xl font-bold text-gray-900">
            {post.title}
          </h1>
          <div className="mt-6 flex items-center">
            <img
              src={post.authorImage}
              alt={post.author}
              className="h-12 w-12 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{post.author}</p>
              <p className="text-sm text-gray-500">{post.authorRole}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="mr-4">{post.date}</span>
            <Clock className="h-4 w-4 mr-1" />
            <span>{post.readTime}</span>
          </div>
        </div>

        {/* Featured image */}
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-[400px] object-cover rounded-xl mb-8"
        />

        {/* Share buttons */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </button>
          </div>
        </div>

        {/* Article content */}
        <div 
          className="prose prose-indigo max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Author bio */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center">
            <img
              src={post.authorImage}
              alt={post.author}
              className="h-16 w-16 rounded-full"
            />
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900">{post.author}</h3>
              <p className="text-gray-500">{post.authorRole}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}