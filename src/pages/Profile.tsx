
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { useHealth } from '@/context/HealthContext';
import { Progress } from '@/components/ui/progress';
import { Award, Flag, Calendar, Trophy, User, Settings, Star } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { wallet, fitnessScore, transactions } = useWallet();
  const { healthData } = useHealth();
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Get stats from transactions
  const totalDays = transactions.length > 0 
    ? Math.ceil((Date.now() - new Date(transactions[transactions.length - 1].timestamp).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;
  
  const activeDays = new Set(
    transactions.map(t => {
      const date = new Date(t.timestamp);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    })
  ).size;
  
  const streakPercentage = totalDays > 0 ? (activeDays / totalDays) * 100 : 0;
  
  // Calculate fitness level based on score
  const getFitnessLevel = (score: number) => {
    if (score >= 80) return 'Elite';
    if (score >= 60) return 'Advanced';
    if (score >= 40) return 'Intermediate';
    if (score >= 20) return 'Beginner';
    return 'Novice';
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-500">View your fitness stats and achievements</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Profile Info Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Profile Info</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-stepcoin-primary/10 rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-stepcoin-primary" />
              </div>
              <h3 className="text-xl font-bold">{user?.email?.split('@')[0]}</h3>
              <p className="text-gray-500">{user?.email}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Member Since</p>
                <p className="font-medium">{user ? formatDate(user.created_at) : ''}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Fitness Level</p>
                <div className="flex items-center">
                  <p className="font-medium mr-2">{getFitnessLevel(fitnessScore)}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((_, index) => (
                      <Star 
                        key={index} 
                        className={`h-4 w-4 ${
                          index < Math.ceil(fitnessScore / 20)
                            ? 'fill-stepcoin-primary text-stepcoin-primary'
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Fitness Stats</CardTitle>
            <CardDescription>Your activity summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Fitness Score */}
              <div className="bg-stepcoin-background rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Award className="h-5 w-5 text-stepcoin-primary mr-2" />
                  <h3 className="font-semibold">Fitness Score</h3>
                </div>
                <div className="flex items-baseline mb-2">
                  <span className="text-3xl font-bold">{fitnessScore}</span>
                  <span className="text-sm text-gray-500 ml-1">/100</span>
                </div>
                <Progress className="h-2" value={fitnessScore} />
              </div>
              
              {/* Activity Streak */}
              <div className="bg-stepcoin-background rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-stepcoin-primary mr-2" />
                  <h3 className="font-semibold">Activity Streak</h3>
                </div>
                <div className="flex items-baseline mb-2">
                  <span className="text-3xl font-bold">{activeDays}</span>
                  <span className="text-sm text-gray-500 ml-1">days</span>
                </div>
                <Progress className="h-2" value={streakPercentage} />
              </div>
              
              {/* Total Steps */}
              <div className="bg-stepcoin-background rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Flag className="h-5 w-5 text-stepcoin-primary mr-2" />
                  <h3 className="font-semibold">Total Steps</h3>
                </div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{wallet.stepsCounted.toLocaleString()}</span>
                  <span className="text-sm text-gray-500 ml-1">steps</span>
                </div>
              </div>
              
              {/* Earned Coins */}
              <div className="bg-stepcoin-background rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Trophy className="h-5 w-5 text-stepcoin-primary mr-2" />
                  <h3 className="font-semibold">Total Earned</h3>
                </div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{wallet.totalEarned}</span>
                  <span className="text-sm text-gray-500 ml-1">coins</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Achievements and Goals */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Your fitness milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`border rounded-lg p-4 text-center ${
              wallet.stepsCounted >= 10000 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}>
              <div className="mx-auto w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2">
                <Flag className={`h-6 w-6 ${
                  wallet.stepsCounted >= 10000 ? 'text-green-500' : 'text-gray-400'
                }`} />
              </div>
              <h4 className="font-medium">First Steps</h4>
              <p className="text-sm text-gray-500">10,000 steps</p>
            </div>
            
            <div className={`border rounded-lg p-4 text-center ${
              wallet.totalEarned >= 10 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}>
              <div className="mx-auto w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2">
                <Trophy className={`h-6 w-6 ${
                  wallet.totalEarned >= 10 ? 'text-green-500' : 'text-gray-400'
                }`} />
              </div>
              <h4 className="font-medium">Coin Collector</h4>
              <p className="text-sm text-gray-500">10 coins earned</p>
            </div>
            
            <div className={`border rounded-lg p-4 text-center ${
              fitnessScore >= 30 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}>
              <div className="mx-auto w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2">
                <Award className={`h-6 w-6 ${
                  fitnessScore >= 30 ? 'text-green-500' : 'text-gray-400'
                }`} />
              </div>
              <h4 className="font-medium">Fitness Novice</h4>
              <p className="text-sm text-gray-500">Score 30+</p>
            </div>
            
            <div className={`border rounded-lg p-4 text-center ${
              activeDays >= 7
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}>
              <div className="mx-auto w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2">
                <Calendar className={`h-6 w-6 ${
                  activeDays >= 7 ? 'text-green-500' : 'text-gray-400'
                }`} />
              </div>
              <h4 className="font-medium">Week Warrior</h4>
              <p className="text-sm text-gray-500">7 active days</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h3 className="font-medium">Sign Out</h3>
              <p className="text-sm text-gray-500">Log out of your account</p>
            </div>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="md:w-auto w-full"
            >
              Sign Out
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h3 className="font-medium">Health Data</h3>
              <p className="text-sm text-gray-500">Manage health connections</p>
            </div>
            <Button 
              variant="outline" 
              className="md:w-auto w-full"
            >
              Manage
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h3 className="font-medium text-red-500">Delete Account</h3>
              <p className="text-sm text-gray-500">Permanently delete your account and data</p>
            </div>
            <Button 
              variant="destructive" 
              className="md:w-auto w-full"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
