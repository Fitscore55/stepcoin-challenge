
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';
import { supabase } from '@/integrations/supabase/client';

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

  // Fetch challenges when component mounts
  useEffect(() => {
    fetchChallenges();
  }, []);

  // Fetch user challenges when user changes
  useEffect(() => {
    if (user) {
      fetchUserChallenges();
    } else {
      setUserChallenges([]);
    }
  }, [user]);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*');
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform the data to match our Challenge type
        const challenges: Challenge[] = data.map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          entryFee: c.entry_fee,
          reward: c.reward,
          startDate: c.start_date,
          endDate: c.end_date,
          type: c.type as 'steps' | 'distance' | 'streak',
          goal: c.goal,
          participantsCount: 0 // Will be calculated later
        }));
        
        setAvailableChallenges(challenges);
      } else {
        // If no challenges in DB, create demo challenges
        createDemoChallenges();
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    }
  };

  const createDemoChallenges = async () => {
    try {
      const mockChallenges = [
        {
          title: 'Weekend Warrior',
          description: 'Complete 20,000 steps over the weekend to win coins',
          entry_fee: 5,
          reward: 20,
          start_date: new Date(Date.now() - 86400000).toISOString(), // yesterday
          end_date: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
          type: 'steps',
          goal: 20000
        },
        {
          title: 'Marathon Month',
          description: 'Walk the equivalent of a marathon (42.2km) in a month',
          entry_fee: 10,
          reward: 50,
          start_date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
          end_date: new Date(Date.now() + 86400000 * 25).toISOString(), // 25 days from now
          type: 'distance',
          goal: 42200 // meters
        },
        {
          title: 'Daily 10K',
          description: 'Complete 10,000 steps every day for 7 days',
          entry_fee: 7,
          reward: 30,
          start_date: new Date().toISOString(), // today
          end_date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
          type: 'streak',
          goal: 7 // days
        }
      ];
      
      // Insert challenges into the database
      const { data, error } = await supabase
        .from('challenges')
        .insert(mockChallenges)
        .select();
      
      if (error) throw error;
      
      if (data) {
        // Transform the returned data to match our Challenge type
        const challenges: Challenge[] = data.map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          entryFee: c.entry_fee,
          reward: c.reward,
          startDate: c.start_date,
          endDate: c.end_date,
          type: c.type as 'steps' | 'distance' | 'streak',
          goal: c.goal,
          participantsCount: 0
        }));
        
        setAvailableChallenges(challenges);
      }
    } catch (error) {
      console.error('Failed to create demo challenges:', error);
    }
  };

  const fetchUserChallenges = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      if (data) {
        // Transform the data to match our UserChallenge type
        const userChallengesData: UserChallenge[] = data.map(uc => ({
          challengeId: uc.challenge_id,
          joined: uc.joined_at,
          completed: uc.completed,
          currentProgress: uc.current_progress
        }));
        
        setUserChallenges(userChallengesData);
      }
    } catch (error) {
      console.error('Failed to fetch user challenges:', error);
    }
  };

  // Count participants for each challenge
  useEffect(() => {
    const countParticipants = async () => {
      if (availableChallenges.length === 0) return;
      
      try {
        // Get participant counts for each challenge
        const counts = await Promise.all(
          availableChallenges.map(async (challenge) => {
            const { count, error } = await supabase
              .from('user_challenges')
              .select('*', { count: 'exact', head: true })
              .eq('challenge_id', challenge.id);
              
            if (error) throw error;
            
            return {
              challengeId: challenge.id,
              count: count || 0
            };
          })
        );
        
        // Update participant counts
        setAvailableChallenges(prev => 
          prev.map(challenge => {
            const countObj = counts.find(c => c.challengeId === challenge.id);
            return {
              ...challenge,
              participantsCount: countObj ? countObj.count : 0
            };
          })
        );
      } catch (error) {
        console.error('Failed to count participants:', error);
      }
    };
    
    countParticipants();
  }, [availableChallenges.length, userChallenges]);

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
      
      // Add to user challenges in Supabase
      const { error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          current_progress: 0,
          completed: false
        });
        
      if (error) throw error;
      
      // Add to user challenges in state
      const newUserChallenge: UserChallenge = {
        challengeId,
        joined: new Date().toISOString(),
        completed: false,
        currentProgress: 0,
      };
      
      setUserChallenges([...userChallenges, newUserChallenge]);
      
      toast.success(`Joined ${challenge.title} challenge!`);
      return true;
    } catch (error: any) {
      console.error('Join challenge error:', error);
      toast.error(error.message || 'Failed to join challenge');
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
      
      // Delete from Supabase
      const { error } = await supabase
        .from('user_challenges')
        .delete()
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId);
        
      if (error) throw error;
      
      // Update user challenges in state
      setUserChallenges(userChallenges.filter(uc => uc.challengeId !== challengeId));
      
      toast.success('Left challenge');
      return true;
    } catch (error: any) {
      console.error('Leave challenge error:', error);
      toast.error(error.message || 'Failed to leave challenge');
      return false;
    }
  };

  const updateChallengeProgress = async (): Promise<void> => {
    if (!user || userChallenges.length === 0) return;
    
    try {
      const updatedUserChallenges = await Promise.all(
        userChallenges.map(async (uc) => {
          // Find the challenge
          const challenge = availableChallenges.find(c => c.id === uc.challengeId);
          if (!challenge || uc.completed) return uc;
          
          // Randomly update progress (in a real app, this would use actual health data)
          const progressIncrement = Math.floor(Math.random() * (challenge.goal * 0.2));
          let newProgress = Math.min(uc.currentProgress + progressIncrement, challenge.goal);
          const completed = newProgress >= challenge.goal;
          
          // Update in Supabase
          const { error } = await supabase
            .from('user_challenges')
            .update({
              current_progress: newProgress,
              completed
            })
            .eq('user_id', user.id)
            .eq('challenge_id', uc.challengeId);
            
          if (error) throw error;
          
          return {
            ...uc,
            currentProgress: newProgress,
            completed,
          };
        })
      );
      
      setUserChallenges(updatedUserChallenges);
      
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
