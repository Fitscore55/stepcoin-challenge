
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChallenges } from '@/context/ChallengeContext';
import { useWallet } from '@/context/WalletContext';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, Users, Check, Ban } from 'lucide-react';

const Challenges = () => {
  const { availableChallenges, userChallenges, joinChallenge, leaveChallenge } = useChallenges();
  const { wallet } = useWallet();
  const [joining, setJoining] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  
  // Format the date in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Create a map of challenge IDs to user challenges for easy lookup
  const userChallengeMap = userChallenges.reduce((acc, uc) => {
    acc[uc.challengeId] = uc;
    return acc;
  }, {} as Record<string, typeof userChallenges[0]>);
  
  // Handle joining a challenge
  const handleJoinChallenge = async (challengeId: string) => {
    setJoining(challengeId);
    try {
      await joinChallenge(challengeId);
    } finally {
      setJoining(null);
    }
  };
  
  // Handle leaving a challenge
  const handleLeaveChallenge = async (challengeId: string) => {
    setLeaving(challengeId);
    try {
      await leaveChallenge(challengeId);
    } finally {
      setLeaving(null);
    }
  };
  
  // Get active and completed user challenges
  const activeUserChallenges = userChallenges
    .filter(uc => !uc.completed)
    .map(uc => {
      const challenge = availableChallenges.find(c => c.id === uc.challengeId);
      return { userChallenge: uc, challenge };
    })
    .filter(item => item.challenge);
  
  const completedUserChallenges = userChallenges
    .filter(uc => uc.completed)
    .map(uc => {
      const challenge = availableChallenges.find(c => c.id === uc.challengeId);
      return { userChallenge: uc, challenge };
    })
    .filter(item => item.challenge);
  
  // Get available challenges that the user hasn't joined
  const availableChallengesForUser = availableChallenges.filter(
    challenge => !userChallengeMap[challenge.id]
  );
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Challenges</h1>
        <p className="text-gray-500">Join challenges to earn more coins</p>
      </div>
      
      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-6">
          {availableChallengesForUser.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Available Challenges</h3>
                  <p className="text-gray-500">You've joined all the available challenges!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableChallengesForUser.map(challenge => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{challenge.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {challenge.description}
                        </CardDescription>
                      </div>
                      <Trophy className="h-6 w-6 text-stepcoin-secondary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>
                          {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{challenge.participantsCount} participants</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Entry Fee</p>
                        <p className="font-bold">{challenge.entryFee} coins</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Reward</p>
                        <p className="font-bold text-stepcoin-secondary">{challenge.reward} coins</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Goal:</p>
                      <p className="text-sm">
                        {challenge.type === 'steps' && `${challenge.goal.toLocaleString()} steps`}
                        {challenge.type === 'distance' && `${(challenge.goal / 1000).toFixed(1)} km`}
                        {challenge.type === 'streak' && `${challenge.goal} days streak`}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-stepcoin-secondary hover:bg-stepcoin-secondary/90"
                      onClick={() => handleJoinChallenge(challenge.id)}
                      disabled={joining === challenge.id || wallet.coins < challenge.entryFee}
                    >
                      {joining === challenge.id ? 'Joining...' : `Join for ${challenge.entryFee} coins`}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-6">
          {activeUserChallenges.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Active Challenges</h3>
                  <p className="text-gray-500">Join a challenge to get started!</p>
                  <Button 
                    className="mt-4 bg-stepcoin-primary hover:bg-stepcoin-primary/90"
                    onClick={() => {
                      const availableTab = document.querySelector('[data-value="available"]') as HTMLElement;
                      if (availableTab) availableTab.click();
                    }}
                  >
                    Browse Challenges
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeUserChallenges.map(({ userChallenge, challenge }) => (
                <Card key={userChallenge.challengeId} className="border-stepcoin-secondary/30">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{challenge?.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {challenge?.description}
                        </CardDescription>
                      </div>
                      <Trophy className="h-6 w-6 text-stepcoin-secondary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>
                          {challenge && formatDate(challenge.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{challenge?.participantsCount} participants</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <p className="text-sm font-medium">Progress</p>
                        <p className="text-sm font-medium">
                          {userChallenge.currentProgress}/{challenge?.goal}
                        </p>
                      </div>
                      <Progress 
                        className="h-2" 
                        value={(userChallenge.currentProgress / (challenge?.goal || 1)) * 100} 
                      />
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-md text-center">
                      <p className="text-xs text-green-600">Potential Reward</p>
                      <p className="font-bold text-green-600">{challenge?.reward} coins</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline"
                      className="w-full text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => handleLeaveChallenge(userChallenge.challengeId)}
                      disabled={leaving === userChallenge.challengeId}
                    >
                      {leaving === userChallenge.challengeId ? 'Leaving...' : 'Leave Challenge'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-6">
          {completedUserChallenges.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Check className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Completed Challenges</h3>
                  <p className="text-gray-500">Complete challenges to see your achievements here!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedUserChallenges.map(({ userChallenge, challenge }) => (
                <Card key={userChallenge.challengeId} className="border-green-300">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <CardTitle>{challenge?.title}</CardTitle>
                          <div className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                            Completed
                          </div>
                        </div>
                        <CardDescription className="mt-1">
                          {challenge?.description}
                        </CardDescription>
                      </div>
                      <Check className="h-6 w-6 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 p-4 rounded-md text-center mt-2">
                      <p className="text-sm text-green-600 mb-1">Reward Earned</p>
                      <p className="text-2xl font-bold text-green-600">{challenge?.reward} coins</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Challenges;
