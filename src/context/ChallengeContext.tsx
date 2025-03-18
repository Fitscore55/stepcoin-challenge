
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';

// Challenge types
type Challenge = {
  id: string;
  title: string;
  description: string;
  entryFee: number;
  reward: number;
  startDate: string;
  endDate: string;
  type: 'steps' | 'distance' | 'streak';
  goal: number;
  participantsCount: number;
};

type UserChallenge = {
  challengeId: string;
  joined: string;
  completed: boolean;
  currentProgress: number;
};

type ChallengeContextType = {
  availableChallenges: Challenge[];
  userChallenges: UserChallenge[];
  joinChallenge: (challengeId: string) => Promise<boolean>;
  leaveChallenge: (challengeId: string) => Promise<boolean>;
  updateChallengeProgress: () => Promise<void>;
};

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { spendCoins } = useWallet();
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);

  // Initialize with mock challenges
  useEffect(() => {
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: 'Weekend Warrior',
        description: 'Complete 20,000 steps over the weekend to win coins',
        entryFee: 5,
        reward: 20,
        startDate: new Date(Date.now() - 86400000).toISOString(), // yesterday
        endDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
        type: 'steps',
        goal: 20000,
        participantsCount: 42,
      },
      {
        id: '2',
        title: 'Marathon Month',
        description: 'Walk the equivalent of a marathon (42.2km) in a month',
        entryFee: 10,
        reward: 50,
        startDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        endDate: new Date(Date.now() + 86400000 * 25).toISOString(), // 25 days from now
        type: 'distance',
        goal: 42200, // meters
        participantsCount: 127,
      },
      {
        id: '3',
        title: 'Daily 10K',
        description: 'Complete 10,000 steps every day for 7 days',
        entryFee: 7,
        reward: 30,
        startDate: new Date(Date.now()).toISOString(), // today
        endDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
        type: 'streak',
        goal: 7, // days
        participantsCount: 89,
      }
    ];
    
    setAvailableChallenges(mockChallenges);
  }, []);

  // Load user's challenges from localStorage when authenticated
  useEffect(() => {
    if (user) {
      const storedUserChallenges = localStorage.getItem(`stepcoin-user-challenges-${user.id}`);
      if (storedUserChallenges) {
        try {
          setUserChallenges(JSON.parse(storedUserChallenges));
        } catch (error) {
          console.error('Failed to parse stored user challenges:', error);
        }
      }
    } else {
      setUserChallenges([]);
    }
  }, [user]);

  const joinChallenge = async (challengeId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Find the challenge
      const challenge = availableChallenges.find(c => c.id === challengeId);
      if (!challenge) {
        toast.error('Challenge not found');
        return false;
      }
      
      // Check if already joined
      if (userChallenges.some(uc => uc.challengeId === challengeId)) {
        toast.error('Already joined this challenge');
        return false;
      }
      
      // Try to spend coins for entry fee
      const success = await spendCoins(challenge.entryFee, `Joined ${challenge.title} challenge`);
      if (!success) return false;
      
      // Add to user challenges
      const newUserChallenge: UserChallenge = {
        challengeId,
        joined: new Date().toISOString(),
        completed: false,
        currentProgress: 0,
      };
      
      const updatedUserChallenges = [...userChallenges, newUserChallenge];
      setUserChallenges(updatedUserChallenges);
      
      // Update available challenges with increased participant count
      const updatedChallenges = availableChallenges.map(c => 
        c.id === challengeId 
          ? {...c, participantsCount: c.participantsCount + 1} 
          : c
      );
      setAvailableChallenges(updatedChallenges);
      
      // Save to localStorage
      localStorage.setItem(`stepcoin-user-challenges-${user.id}`, JSON.stringify(updatedUserChallenges));
      
      toast.success(`Joined ${challenge.title} challenge!`);
      return true;
    } catch (error) {
      console.error('Join challenge error:', error);
      toast.error('Failed to join challenge');
      return false;
    }
  };

  const leaveChallenge = async (challengeId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Find user challenge
      const userChallenge = userChallenges.find(uc => uc.challengeId === challengeId);
      if (!userChallenge) {
        toast.error('Challenge not found');
        return false;
      }
      
      // Cannot leave completed challenges
      if (userChallenge.completed) {
        toast.error('Cannot leave completed challenges');
        return false;
      }
      
      // Update user challenges
      const updatedUserChallenges = userChallenges.filter(uc => uc.challengeId !== challengeId);
      setUserChallenges(updatedUserChallenges);
      
      // Update available challenges with decreased participant count
      const updatedChallenges = availableChallenges.map(c => 
        c.id === challengeId 
          ? {...c, participantsCount: Math.max(0, c.participantsCount - 1)} 
          : c
      );
      setAvailableChallenges(updatedChallenges);
      
      // Save to localStorage
      localStorage.setItem(`stepcoin-user-challenges-${user.id}`, JSON.stringify(updatedUserChallenges));
      
      toast.success('Left challenge');
      return true;
    } catch (error) {
      console.error('Leave challenge error:', error);
      toast.error('Failed to leave challenge');
      return false;
    }
  };

  const updateChallengeProgress = async (): Promise<void> => {
    // This would be called periodically to update challenge progress
    // For simplicity, we'll just simulate random progress for now
    if (!user || userChallenges.length === 0) return;
    
    try {
      const updatedUserChallenges = userChallenges.map(uc => {
        // Find the challenge
        const challenge = availableChallenges.find(c => c.id === uc.challengeId);
        if (!challenge || uc.completed) return uc;
        
        // Randomly update progress (in a real app, this would use actual health data)
        const progressIncrement = Math.floor(Math.random() * (challenge.goal * 0.2));
        let newProgress = Math.min(uc.currentProgress + progressIncrement, challenge.goal);
        const completed = newProgress >= challenge.goal;
        
        return {
          ...uc,
          currentProgress: newProgress,
          completed,
        };
      });
      
      setUserChallenges(updatedUserChallenges);
      
      // Save to localStorage
      localStorage.setItem(`stepcoin-user-challenges-${user.id}`, JSON.stringify(updatedUserChallenges));
      
      // Check for newly completed challenges
      const newlyCompleted = updatedUserChallenges.filter(
        (uc, i) => uc.completed && !userChallenges[i].completed
      );
      
      if (newlyCompleted.length > 0) {
        newlyCompleted.forEach(uc => {
          const challenge = availableChallenges.find(c => c.id === uc.challengeId);
          if (challenge) {
            toast.success(`Challenge completed: ${challenge.title}! You earned ${challenge.reward} coins!`);
            // In a real app, we would credit the reward to the wallet here
          }
        });
      }
    } catch (error) {
      console.error('Update challenge progress error:', error);
    }
  };

  return (
    <ChallengeContext.Provider
      value={{
        availableChallenges,
        userChallenges,
        joinChallenge,
        leaveChallenge,
        updateChallengeProgress,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenges = () => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenges must be used within a ChallengeProvider');
  }
  return context;
};
