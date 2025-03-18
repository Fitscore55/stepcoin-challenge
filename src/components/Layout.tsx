
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Trophy, Wallet, User, LogOut, Menu, X, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useHealth } from '@/context/HealthContext';
import { useWallet } from '@/context/WalletContext';

const Layout = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { syncHealthData, hasPermission, requestPermission } = useHealth();
  const { wallet } = useWallet();

  // Sync health data and update challenges periodically
  useEffect(() => {
    if (hasPermission) {
      syncHealthData();
      
      const interval = setInterval(() => {
        syncHealthData();
      }, 60000); // every minute for demo purposes
      
      return () => clearInterval(interval);
    }
  }, [hasPermission, syncHealthData]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleHealthConnect = async () => {
    if (!hasPermission) {
      await requestPermission();
    }
  };

  const navItems = [
    { path: '/app', label: 'Dashboard', icon: Home },
    { path: '/app/challenges', label: 'Challenges', icon: Trophy },
    { path: '/app/wallet', label: 'Wallet', icon: Wallet },
    { path: '/app/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm py-4 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-stepcoin-primary mr-2" />
            <span className="text-xl font-bold">StepCoin</span>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:flex items-center mr-4">
              <div className="bg-stepcoin-background rounded-full px-3 py-1 flex items-center">
                <Wallet className="h-4 w-4 text-stepcoin-primary mr-1" />
                <span className="font-semibold">{wallet.coins} coins</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Navigation (desktop) */}
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-stepcoin-primary/10 text-stepcoin-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            ))}
            
            <div className="pt-4 mt-4 border-t border-gray-200">
              {!hasPermission && (
                <Button 
                  onClick={handleHealthConnect} 
                  className="w-full mb-2 bg-stepcoin-secondary hover:bg-stepcoin-secondary/90"
                >
                  Connect Health Data
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </nav>
        </aside>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="bg-white w-64 h-full overflow-auto">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-6 w-6 text-stepcoin-primary mr-2" />
                    <span className="font-bold">StepCoin</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <nav className="p-4 space-y-2">
                <div className="bg-stepcoin-background rounded-lg px-3 py-2 mb-4 flex items-center">
                  <Wallet className="h-4 w-4 text-stepcoin-primary mr-2" />
                  <span className="font-semibold">{wallet.coins} coins</span>
                </div>
                
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-stepcoin-primary/10 text-stepcoin-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                ))}
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  {!hasPermission && (
                    <Button 
                      onClick={() => {
                        handleHealthConnect();
                        setIsOpen(false);
                      }}
                      className="w-full mb-2 bg-stepcoin-secondary hover:bg-stepcoin-secondary/90"
                    >
                      Connect Health Data
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
