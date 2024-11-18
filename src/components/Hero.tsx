import React from 'react';
import { ArrowRight, Users, Sparkles, MessageCircle, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="relative bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Connect, Collaborate,</span>
                  <span className="block text-indigo-600">Grow Together</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Join a thriving community of leaders, entrepreneurs, and innovators. Share resources, 
                  exchange knowledge, and build meaningful connections through our unique Ki points system.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link to="/signup" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link to="/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10">
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="relative bg-gray-50 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Why Join 1Kind AI?
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                A platform designed to foster meaningful collaboration and growth
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
                <div className="text-indigo-600 mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Trusted Communities
                </h3>
                <p className="text-gray-500">
                  Join specialized communities aligned with your interests and goals. Connect with experts and peers who share your passion.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
                <div className="text-indigo-600 mb-4">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ki Points System
                </h3>
                <p className="text-gray-500">
                  Earn and spend Ki points to prioritize your needs and reward valuable contributions. A unique system that ensures fair exchanges.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
                <div className="text-indigo-600 mb-4">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Asks & Offers
                </h3>
                <p className="text-gray-500">
                  Post your needs or share your expertise. Our platform makes it easy to find the right match for collaboration.
                </p>
              </div>
            </div>

            {/* Social Proof */}
            <div className="mt-16">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
                  <div>
                    <p className="text-4xl font-extrabold text-indigo-600">1,000+</p>
                    <p className="mt-2 text-gray-500">Active Members</p>
                  </div>
                  <div>
                    <p className="text-4xl font-extrabold text-indigo-600">50+</p>
                    <p className="mt-2 text-gray-500">Communities</p>
                  </div>
                  <div>
                    <p className="text-4xl font-extrabold text-indigo-600">5,000+</p>
                    <p className="mt-2 text-gray-500">Successful Collaborations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-16 text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                Join our community today and start connecting with like-minded professionals.
                Your next great collaboration is just a click away.
              </p>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Your Account
                  <Award className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}