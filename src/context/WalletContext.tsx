
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useHealth } from './HealthContext';

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

  useEffect(() => {
    if (user) {
      // Load wallet data from localStorage
      const storedWallet = localStorage.getItem(`stepcoin-wallet-${user.id}`);
      if (storedWallet) {
        try {
          setWallet(JSON.parse(storedWallet));
        } catch (error) {
          console.error('Failed to parse stored wallet:', error);
        }
      }

      // Load transactions from localStorage
      const storedTransactions = localStorage.getItem(`stepcoin-transactions-${user.id}`);
      if (storedTransactions) {
        try {
          setTransactions(JSON.parse(storedTransactions));
        } catch (error) {
          console.error('Failed to parse stored transactions:', error);
        }
      }

      // Load previous steps count
      const storedPreviousSteps = localStorage.getItem(`stepcoin-previous-steps-${user.id}`);
      if (storedPreviousSteps) {
        try {
          setPreviousSteps(JSON.parse(storedPreviousSteps));
        } catch (error) {
          console.error('Failed to parse stored previous steps:', error);
        }
      }
    } else {
      // Reset state when user logs out
      setWallet(defaultWallet);
      setTransactions([]);
      setPreviousSteps(0);
      setFitnessScore(0);
    }
  }, [user]);

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

  // Update wallet when health data changes
  useEffect(() => {
    if (lastUpdate && user) {
      updateWallet();
    }
  }, [lastUpdate, user]);

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
          
          // Create transaction record
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            amount: coinsEarned,
            description: `Earned for ${newSteps} steps`,
            timestamp: now,
            type: 'earned',
          };
          
          const updatedTransactions = [newTransaction, ...transactions];
          
          // Update state
          setWallet(updatedWallet);
          setTransactions(updatedTransactions);
          setPreviousSteps(healthData.steps);
          
          // Save to localStorage
          localStorage.setItem(`stepcoin-wallet-${user.id}`, JSON.stringify(updatedWallet));
          localStorage.setItem(`stepcoin-transactions-${user.id}`, JSON.stringify(updatedTransactions));
          localStorage.setItem(`stepcoin-previous-steps-${user.id}`, JSON.stringify(healthData.steps));
          
          toast.success(`Earned ${coinsEarned} coins for your steps!`);
        }
      }
    } catch (error) {
      console.error('Wallet update error:', error);
      toast.error('Failed to update wallet');
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
      
      // Update wallet
      const updatedWallet = {
        ...wallet,
        coins: wallet.coins - amount,
        lastUpdated: now,
      };
      
      // Create transaction record
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        amount: amount,
        description,
        timestamp: now,
        type: 'spent',
      };
      
      const updatedTransactions = [newTransaction, ...transactions];
      
      // Update state
      setWallet(updatedWallet);
      setTransactions(updatedTransactions);
      
      // Save to localStorage
      localStorage.setItem(`stepcoin-wallet-${user.id}`, JSON.stringify(updatedWallet));
      localStorage.setItem(`stepcoin-transactions-${user.id}`, JSON.stringify(updatedTransactions));
      
      toast.success(`Spent ${amount} coins`);
      return true;
    } catch (error) {
      console.error('Spend coins error:', error);
      toast.error('Failed to spend coins');
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
