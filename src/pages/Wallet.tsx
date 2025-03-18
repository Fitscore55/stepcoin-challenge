
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/context/WalletContext';
import { Wallet as WalletIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Wallet = () => {
  const { wallet, transactions } = useWallet();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your Wallet</h1>
        <p className="text-gray-500">Manage your StepCoin balance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2 bg-gradient-to-r from-stepcoin-primary to-stepcoin-accent text-white">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                <WalletIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Current Balance</p>
                <h2 className="text-3xl font-bold">{wallet.coins} coins</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-white/80">Total Earned</p>
                <p className="text-2xl font-semibold">{wallet.totalEarned}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-white/80">Steps Counted</p>
                <p className="text-2xl font-semibold">{wallet.stepsCounted.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>How to Earn</CardTitle>
            <CardDescription>Ways to increase your balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-stepcoin-primary/10 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-stepcoin-primary font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium">Walk More</h4>
                <p className="text-sm text-gray-500">Earn 1 coin for every 1,000 steps</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-stepcoin-primary/10 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-stepcoin-primary font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium">Complete Challenges</h4>
                <p className="text-sm text-gray-500">Win coins by completing challenges</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-stepcoin-primary/10 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-stepcoin-primary font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium">Daily Streak</h4>
                <p className="text-sm text-gray-500">Bonus coins for daily activity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent activity in your wallet</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <React.Fragment key={transaction.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                        transaction.type === 'earned' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'earned' ? (
                          <ArrowUp className="h-5 w-5" />
                        ) : (
                          <ArrowDown className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                      </div>
                    </div>
                    <div className={`font-bold ${
                      transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} coins
                    </div>
                  </div>
                  {index < transactions.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
