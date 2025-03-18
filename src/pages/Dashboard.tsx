
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHealth } from '@/context/HealthContext';
import { useWallet } from '@/context/WalletContext';
import { useChallenges } from '@/context/ChallengeContext';
import { Link } from 'react-router-dom';
import { Footprints, MapPin, Award, Trophy, Zap, Coins } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const { healthData, hasPermission, requestPermission, syncHealthData, loading } = useHealth();
  const { wallet, fitnessScore } = useWallet();
  const { availableChallenges, userChallenges } = useChallenges();
  
  // Format distance to km with 2 decimal places
  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2);
  };
  
  // Handle permission request
  const handleConnectHealth = async () => {
    if (!hasPermission) {
      await requestPermission();
    } else {
      await syncHealthData();
    }
  };
  
  // Get active challenges (either participating or available)
  const getActiveChallenges = () => {
    if (userChallenges.length > 0) {
      return userChallenges.slice(0, 2).map(uc => {
        const challenge = availableChallenges.find(c => c.id === uc.challengeId);
        return { userChallenge: uc, challenge };
      }).filter(item => item.challenge); // Filter out any undefined challenges
    }
    
    return availableChallenges.slice(0, 2).map(challenge => ({
      challenge,
      userChallenge: null
    }));
  };
  
  const activeChallenges = getActiveChallenges();
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Track your progress and earn rewards</p>
      </div>
      
      {!hasPermission ? (
        <Card className="mb-6 border-2 border-dashed border-stepcoin-primary/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Zap className="h-12 w-12 text-stepcoin-primary mx-auto" />
              <h3 className="text-xl font-semibold">Connect to Health Data</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Connect to your health data to start tracking your steps and earning rewards.
              </p>
              <Button 
                onClick={handleConnectHealth} 
                className="bg-stepcoin-primary hover:bg-stepcoin-primary/90"
              >
                Connect Now
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-500">Today's Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{healthData.steps.toLocaleString()}</span>
                    <span className="ml-1 text-sm text-gray-500">steps</span>
                  </div>
                  <Footprints className="h-8 w-8 text-stepcoin-primary" />
                </div>
                <Progress className="h-2 mt-4" value={(healthData.steps / 10000) * 100} />
                <p className="text-xs text-gray-500 mt-2">Goal: 10,000 steps</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-500">Distance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{formatDistance(healthData.distance)}</span>
                    <span className="ml-1 text-sm text-gray-500">km</span>
                  </div>
                  <MapPin className="h-8 w-8 text-stepcoin-accent" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-500">Fitness Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{fitnessScore}</span>
                    <span className="ml-1 text-sm text-gray-500">/100</span>
                  </div>
                  <Award className="h-8 w-8 text-stepcoin-secondary" />
                </div>
                <Progress className="h-2 mt-4" value={fitnessScore} />
              </CardContent>
            </Card>
          </div>
          
          {/* Wallet Summary */}
          <Card className="mb-6 bg-gradient-to-r from-stepcoin-primary to-stepcoin-accent text-white">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold mb-1">Your Wallet Balance</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">{wallet.coins}</span>
                    <span className="ml-2">coins</span>
                  </div>
                  <p className="text-white/80 text-sm mt-1">
                    Total earned: {wallet.totalEarned} coins
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button asChild variant="secondary" className="flex-1 md:flex-none">
                    <Link to="/app/wallet">
                      <Coins className="h-4 w-4 mr-2" />
                      View Wallet
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Challenge Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Active Challenges</h2>
              <Button variant="ghost" asChild>
                <Link to="/app/challenges">
                  View All
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeChallenges.map((item, index) => (
                <Card key={index} className={item.userChallenge ? "border-stepcoin-secondary/30" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{item.challenge?.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {item.challenge?.description}
                        </CardDescription>
                      </div>
                      <Trophy className="h-6 w-6 text-stepcoin-secondary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {item.userChallenge ? (
                        <>
                          <Progress 
                            className="h-2" 
                            value={(item.userChallenge.currentProgress / (item.challenge?.goal || 1)) * 100} 
                          />
                          <div className="flex justify-between items-center text-sm">
                            <span>Progress: {item.userChallenge.currentProgress}/{item.challenge?.goal}</span>
                            <span className="font-medium text-stepcoin-secondary">
                              Reward: {item.challenge?.reward} coins
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-sm font-medium">
                            Entry: {item.challenge?.entryFee} coins
                          </span>
                          <span className="text-sm font-medium text-stepcoin-secondary">
                            Reward: {item.challenge?.reward} coins
                          </span>
                        </div>
                      )}
                      
                      {!item.userChallenge && (
                        <Button asChild className="w-full mt-2 bg-stepcoin-secondary hover:bg-stepcoin-secondary/90">
                          <Link to="/app/challenges">
                            Join Challenge
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Sync Button */}
          <div className="flex justify-center mt-8">
            <Button 
              onClick={handleConnectHealth} 
              disabled={loading}
              variant="outline"
              className="px-6"
            >
              {loading ? 'Syncing...' : 'Sync Health Data'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
