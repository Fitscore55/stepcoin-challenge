
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useHealth } from './HealthContext';
import { supabase } from '@/integrations/supabase/client';

type Wallet = {
  coins: number;
  lastUpdated: string;
  totalEarned: number;
  stepsCounted: number;
};

type Transaction = {
  id: string;
  amount: number;
  description: string;
  timestamp: string;
  type: 'earned' | 'spent';
};

type WalletContextType = {
  wallet: Wallet;
  transactions: Transaction[];
  updateWallet: () => Promise<void>;
  spendCoins: (amount: number, description: string) => Promise<boolean>;
  fitnessScore: number;
};

const defaultWallet: Wallet = {
  coins: 0,
  lastUpdated: '',
  totalEarned: 0,
  stepsCounted: 0,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { healthData, lastUpdate } = useHealth();
  const [wallet, setWallet] = useState<Wallet>(defaultWallet);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fitnessScore, setFitnessScore] = useState(0);
  const [previousSteps, setPreviousSteps] = useState(0);

  // Fetch wallet data when user changes
  useEffect(() => {
    if (user) {
      fetchWalletData();
      fetchTransactions();
    } else {
      // Reset state when user logs out
      setWallet(defaultWallet);
      setTransactions([]);
      setPreviousSteps(0);
      setFitnessScore(0);
    }
  }, [user]);

  // Fetch previous steps
  useEffect(() => {
    if (user) {
      const fetchPreviousSteps = async () => {
        try {
          const { data, error } = await supabase
            .from('health_data')
            .select('steps')
            .eq('user_id', user.id)
            .order('last_synced', { ascending: false })
            .limit(1)
            .single();
            
          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching previous steps:', error);
            return;
          }
          
          if (data) {
            setPreviousSteps(data.steps);
          }
        } catch (error) {
          console.error('Failed to fetch previous steps:', error);
        }
      };
      
      fetchPreviousSteps();
    }
  }, [user]);

  // Update wallet when health data changes
  useEffect(() => {
    if (lastUpdate && user) {
      updateWallet();
    }
  }, [lastUpdate, user]);

  const fetchWalletData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No wallet found, create one
          const { data: newWallet, error: createError } = await supabase
            .from('wallets')
            .insert({
              user_id: user.id,
              coins: 0,
              total_earned: 0,
              steps_counted: 0,
              last_updated: new Date().toISOString()
            })
            .select()
            .single();
            
          if (createError) throw createError;
          
          if (newWallet) {
            setWallet({
              coins: newWallet.coins,
              lastUpdated: newWallet.last_updated,
              totalEarned: newWallet.total_earned,
              stepsCounted: newWallet.steps_counted
            });
          }
        } else {
          throw error;
        }
      } else if (data) {
        setWallet({
          coins: data.coins,
          lastUpdated: data.last_updated,
          totalEarned: data.total_earned,
          stepsCounted: data.steps_counted
        });
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      
      if (data) {
        const formattedTransactions: Transaction[] = data.map(t => ({
          id: t.id,
          amount: t.amount,
          description: t.description,
          timestamp: t.created_at,
          type: t.type as 'earned' | 'spent'
        }));
        
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  // Calculate fitness score
  useEffect(() => {
    if (user && wallet.totalEarned > 0) {
      // Simple score based on total steps and consistency (number of transactions)
      const stepsScore = Math.min(wallet.stepsCounted / 100000, 50);
      const consistencyScore = Math.min(transactions.filter(t => t.type === 'earned').length * 5, 50);
      const newScore = Math.floor(stepsScore + consistencyScore);
      setFitnessScore(newScore);
    }
  }, [user, wallet, transactions]);

  const updateWallet = async () => {
    if (!user) return;

    try {
      // If there are new steps (more than previous stored)
      if (healthData.steps > previousSteps) {
        // Calculate new steps since last update
        const newSteps = healthData.steps - previousSteps;
        
        // Calculate coins earned (1 coin per 1000 steps)
        const coinsEarned = Math.floor(newSteps / 1000);
        
        if (coinsEarned > 0) {
          // Update wallet
          const now = new Date().toISOString();
          const updatedWallet = {
            coins: wallet.coins + coinsEarned,
            lastUpdated: now,
            totalEarned: wallet.totalEarned + coinsEarned,
            stepsCounted: wallet.stepsCounted + newSteps,
          };
          
          // Update wallet in Supabase
          const { error: walletError } = await supabase
            .from('wallets')
            .update({
              coins: updatedWallet.coins,
              total_earned: updatedWallet.totalEarned,
              steps_counted: updatedWallet.stepsCounted,
              last_updated: now
            })
            .eq('user_id', user.id);
            
          if (walletError) throw walletError;
          
          // Create transaction record
          const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              amount: coinsEarned,
              description: `Earned for ${newSteps} steps`,
              type: 'earned'
            });
            
          if (transactionError) throw transactionError;
          
          // Update previous steps
          setPreviousSteps(healthData.steps);
          
          // Update state
          setWallet(updatedWallet);
          
          // Refresh transactions
          fetchTransactions();
          
          toast.success(`Earned ${coinsEarned} coins for your steps!`);
        }
      }
    } catch (error: any) {
      console.error('Wallet update error:', error);
      toast.error(error.message || 'Failed to update wallet');
    }
  };

  const spendCoins = async (amount: number, description: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      if (wallet.coins < amount) {
        toast.error('Not enough coins');
        return false;
      }
      
      const now = new Date().toISOString();
      
      // Update wallet in Supabase
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          coins: wallet.coins - amount,
          last_updated: now
        })
        .eq('user_id', user.id);
        
      if (walletError) throw walletError;
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          description,
          type: 'spent'
        });
        
      if (transactionError) throw transactionError;
      
      // Update state
      setWallet({
        ...wallet,
        coins: wallet.coins - amount,
        lastUpdated: now,
      });
      
      // Refresh transactions
      fetchTransactions();
      
      toast.success(`Spent ${amount} coins`);
      return true;
    } catch (error: any) {
      console.error('Spend coins error:', error);
      toast.error(error.message || 'Failed to spend coins');
      return false;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        transactions,
        updateWallet,
        spendCoins,
        fitnessScore,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
