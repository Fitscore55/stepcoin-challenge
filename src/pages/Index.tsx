
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Footprints, ArrowRight, Award, Trophy, Wallet, Activity } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 bg-white border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-stepcoin-primary mr-2" />
            <span className="text-xl font-bold">StepCoin</span>
          </div>
          <div className="space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button className="bg-stepcoin-primary hover:bg-stepcoin-primary/90" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-stepcoin-background to-white py-16 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Walk Your Way to <span className="text-stepcoin-primary">Rewards</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Turn your daily steps into digital coins. Earn rewards, join challenges, and 
                improve your fitness score - all while walking!
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button className="bg-stepcoin-primary hover:bg-stepcoin-primary/90 text-lg px-8 py-6" asChild>
                  <Link to="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center relative">
              <div className="relative w-72 h-72 flex items-center justify-center">
                <div className="absolute inset-0 bg-stepcoin-primary/20 rounded-full animate-pulse-ring"></div>
                <div className="absolute w-56 h-56 bg-stepcoin-primary/30 rounded-full"></div>
                <div className="relative w-48 h-48 bg-stepcoin-primary rounded-full flex items-center justify-center animate-bounce-subtle">
                  <Footprints className="h-24 w-24 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              StepCoin makes earning rewards for your physical activity simple and fun
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-stepcoin-primary/10 rounded-full flex items-center justify-center mb-4">
                <Footprints className="h-6 w-6 text-stepcoin-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Track Your Steps</h3>
              <p className="text-gray-600">
                Connect your health data and automatically track your daily steps and distance.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-stepcoin-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-stepcoin-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Earn Coins</h3>
              <p className="text-gray-600">
                Get 1 coin for every 1,000 steps you take. The more you move, the more you earn!
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-stepcoin-accent/10 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-stepcoin-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Join Challenges</h3>
              <p className="text-gray-600">
                Participate in challenges to earn bonus coins and increase your fitness score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-stepcoin-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="max-w-lg mx-auto mb-8 text-white/80">
            Join thousands of users who are already turning their steps into rewards.
            Sign up today and start your fitness journey!
          </p>
          <Button className="bg-white text-stepcoin-primary hover:bg-white/90 text-lg px-8 py-6" asChild>
            <Link to="/signup">
              Create Your Account
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Activity className="h-6 w-6 text-stepcoin-primary mr-2" />
              <span className="text-lg font-bold">StepCoin</span>
            </div>
            <div className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} StepCoin. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
