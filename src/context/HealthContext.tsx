
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

type HealthData = {
  steps: number;
  distance: number; // in meters
  lastSynced: string;
};

type HealthContextType = {
  healthData: HealthData;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  syncHealthData: () => Promise<void>;
  loading: boolean;
  lastUpdate: string | null;
};

const defaultHealthData: HealthData = {
  steps: 0,
  distance: 0,
  lastSynced: '',
};

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<HealthData>(defaultHealthData);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    // Check stored permissions and data when user is authenticated
    if (user) {
      const storedPermission = localStorage.getItem('stepcoin-health-permission');
      if (storedPermission === 'granted') {
        setHasPermission(true);
        const storedData = localStorage.getItem(`stepcoin-health-data-${user.id}`);
        if (storedData) {
          try {
            setHealthData(JSON.parse(storedData));
          } catch (error) {
            console.error('Failed to parse stored health data:', error);
          }
        }
      }
    } else {
      // Reset state when user logs out
      setHealthData(defaultHealthData);
      setHasPermission(false);
    }
  }, [user]);

  const requestPermission = async (): Promise<boolean> => {
    try {
      // Mock permission request - will be replaced with Health Connect API
      setHasPermission(true);
      localStorage.setItem('stepcoin-health-permission', 'granted');
      toast.success('Health data access granted!');
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      toast.error('Failed to get health data permissions');
      return false;
    }
  };

  const syncHealthData = async () => {
    if (!user || !hasPermission) return;
    
    setLoading(true);
    try {
      // Mock health data fetch - will be replaced with Health Connect API
      // Generate random steps between 3000-15000 for demo
      const mockSteps = Math.floor(Math.random() * 12000) + 3000;
      // Average step is about 0.7m, so we calculate a realistic distance
      const mockDistance = mockSteps * 0.7;
      const now = new Date().toISOString();
      
      const newHealthData = {
        steps: mockSteps,
        distance: mockDistance,
        lastSynced: now,
      };
      
      setHealthData(newHealthData);
      setLastUpdate(now);
      localStorage.setItem(`stepcoin-health-data-${user.id}`, JSON.stringify(newHealthData));
      
      toast.success('Health data synced successfully!');
    } catch (error) {
      console.error('Health data sync error:', error);
      toast.error('Failed to sync health data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <HealthContext.Provider
      value={{
        healthData,
        hasPermission,
        requestPermission,
        syncHealthData,
        loading,
        lastUpdate
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
