import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Sparkles, MessageCircle, Award, ArrowRight, Heart, Shield, Target, Linkedin, Twitter, Github } from 'lucide-react';

const TEAM_MEMBERS = [
  {
    name: 'David Kim',
    role: 'CEO & Co-founder',
    bio: 'Former tech executive with 15+ years of experience building communities and marketplaces.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    social: {
      linkedin: '#',
      twitter: '#',
      github: '#'
    }
  },
  {
    name: 'Sarah Chen',
    role: 'CTO & Co-founder',
    bio: 'AI researcher and full-stack developer passionate about building scalable platforms.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    social: {
      linkedin: '#',
      twitter: '#',
      github: '#'
    }
  },
  {
    name: 'Michael Ross',
    role: 'Head of Community',
    bio: 'Community builder with experience growing professional networks and fostering collaboration.',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=300',
    social: {
      linkedin: '#',
      twitter: '#',
      github: '#'
    }
  },
  {
    name: 'Emily Zhang',
    role: 'Product Lead',
    bio: 'Product strategist focused on creating intuitive user experiences and meaningful interactions.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
    social: {
      linkedin: '#',
      twitter: '#',
      github: '#'
    }
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            About <span className="text-indigo-600">1Kind AI</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            Building a community where knowledge sharing and collaboration create lasting impact.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                1Kind AI was founded with a simple yet powerful mission: to create a platform where 
                professionals can meaningfully connect, share expertise, and help each other grow.
              </p>
              <p className="text-lg text-gray-600">
                We believe in the power of community-driven growth and the idea that everyone has 
                something valuable to contribute. Through our unique Ki points system, we've created 
                a sustainable ecosystem of giving and receiving.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-indigo-50 p-6 rounded-lg">
                <Heart className="h-8 w-8 text-indigo-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Community First</h3>
                <p className="text-gray-600">Building trust through meaningful connections</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <Shield className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Trust & Safety</h3>
                <p className="text-gray-600">Ensuring a secure environment for collaboration</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <Target className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Goal Oriented</h3>
                <p className="text-gray-600">Focused on achieving tangible results</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <Award className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Recognition</h3>
                <p className="text-gray-600">Rewarding valuable contributions</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Join Communities</h3>
              <p className="text-gray-600">
                Connect with professionals who share your interests and goals
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Share & Collaborate</h3>
              <p className="text-gray-600">
                Post asks and offers to exchange knowledge and resources
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Earn Ki Points</h3>
              <p className="text-gray-600">
                Get rewarded for your contributions to the community
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Meet Our Team</h2>
            <p className="mt-4 text-xl text-gray-500">
              Passionate individuals dedicated to building meaningful connections
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.name} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-indigo-600 mb-2">{member.role}</p>
                  <p className="text-sm text-gray-500 mb-4">{member.bio}</p>
                  <div className="flex space-x-4">
                    <a href={member.social.linkedin} className="text-gray-400 hover:text-gray-600">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href={member.social.twitter} className="text-gray-400 hover:text-gray-600">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a href={member.social.github} className="text-gray-400 hover:text-gray-600">
                      <Github className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-50 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Start connecting with professionals, sharing knowledge, and making a positive impact today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Read Our Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}