
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Platform } from 'react-native';

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
        fetchHealthData();
      }
    } else {
      // Reset state when user logs out
      setHealthData(defaultHealthData);
      setHasPermission(false);
    }
  }, [user]);

  const fetchHealthData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('health_data')
        .select('*')
        .eq('user_id', user.id)
        .order('last_synced', { ascending: false })
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no data found, which is expected for new users
        console.error('Error fetching health data:', error);
        return;
      }
      
      if (data) {
        setHealthData({
          steps: data.steps,
          distance: data.distance,
          lastSynced: data.last_synced,
        });
        setLastUpdate(data.last_synced);
      }
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // For now, we'll just mock permission request for both web and native
      // In a real app, we would use the Health Connect APIs on native
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
      // Mock health data fetch for both web and native for now
      // In a real app, we would use Health Connect APIs on native
      const steps = Math.floor(Math.random() * 12000) + 3000;
      const distance = steps * 0.7;
      
      const now = new Date().toISOString();
      
      const newHealthData = {
        steps: steps,
        distance: distance,
        lastSynced: now,
      };
      
      // Save to Supabase
      const { error } = await supabase
        .from('health_data')
        .insert({
          user_id: user.id,
          steps: steps,
          distance: distance,
          last_synced: now
        });
        
      if (error) throw error;
      
      setHealthData(newHealthData);
      setLastUpdate(now);
      
      toast.success('Health data synced successfully!');
    } catch (error: any) {
      console.error('Health data sync error:', error);
      toast.error(error.message || 'Failed to sync health data');
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
