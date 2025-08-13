'use client';

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { Button } from './DemoComponents';
import { 
  Swap, 
  SwapAmountInput, 
  SwapToggleButton, 
  SwapButton, 
  SwapMessage, 
  SwapToast 
} from '@coinbase/onchainkit/swap';
import type { Token } from '@coinbase/onchainkit/token';

// Mock wallet address for demo - in real app, this would come from Farcaster wallet
const DEMO_WALLET_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";

interface SwapDisplayProps {
  className?: string;
}

export function SwapDisplay({ className = "" }: SwapDisplayProps) {
  const { context } = useMiniKit();
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Get user info from Farcaster context and set up wallet
  useEffect(() => {
    console.log('=== FARCASTER CONTEXT DEBUG ===');
    console.log('Full context object:', context);
    
    if (context) {
      console.log('Context exists, checking for Farcaster user info...');
      console.log('Context keys:', Object.keys(context));
      
      // Check if we have user info directly in context
      if (context.user) {
        console.log('✅ Farcaster user info found in context.user:', context.user);
        console.log('User keys:', Object.keys(context.user));
        
        // For now, use demo wallet address since we're in Base App
        // In a real Farcaster mini app, you'd use sdk.wallet.getAddress()
        setUserAddress(DEMO_WALLET_ADDRESS);
        setIsWalletConnected(true);
        console.log('✅ Using demo wallet address for Base App:', DEMO_WALLET_ADDRESS);
      }
      
      if (context.client) {
        console.log('Client exists, full client object:', context.client);
        console.log('Client keys:', Object.keys(context.client));
      }
    } else {
      console.log('❌ No context available');
    }
    
    console.log('=== END FARCASTER CONTEXT DEBUG ===');
  }, [context]);

  // Define Base tokens for swapping
  const ETHToken: Token = {
    address: "",
    chainId: 8453, // Base mainnet
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
    image: "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
  };

  const USDCToken: Token = {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    chainId: 8453, // Base mainnet
    decimals: 6,
    name: "USDC",
    symbol: "USDC",
    image: "https://dynamic-assets.coinbase.com/3c15df5e2ac7d4abbe9499ed9335041f00c620f28e8de2f93474a9f432058742cdf4674bd43f309e69778a26969372310135be97eb183d91c492154176d455b8/asset_icons/9d67b728b6c8f457717154b3a35f9ddc702eae7e76c4684ee39302c4d7fd0bb8.png",
  };

  const WETHToken: Token = {
    address: "0x4200000000000000000000000000000000000006",
    chainId: 8453, // Base mainnet
    decimals: 18,
    name: "Wrapped Ether",
    symbol: "WETH",
    image: "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
  };

  // Add other tokens here to display them as options in the swap
  const swappableTokens: Token[] = [ETHToken, USDCToken, WETHToken];

  if (!isWalletConnected) {
    return (
      <div className={`bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-[var(--app-foreground)] mb-4">
            🔗 Connect Your Wallet
          </h3>
          <p className="text-[var(--app-foreground-muted)] mb-6">
            Your wallet should automatically connect when using this mini app in Base App. If not connected, please check your Base App settings.
          </p>
          
          <div className="mb-4">
            <Button
              onClick={() => {
                console.log('=== MANUAL WALLET CHECK ===');
                console.log('Current context:', context);
                if (context?.client) {
                  console.log('Client object:', context.client);
                  console.log('Client keys:', Object.keys(context.client));
                }
                console.log('=== END MANUAL CHECK ===');
              }}
              variant="ghost"
              size="sm"
              className="w-full text-xs"
            >
              🔍 Debug: Check Wallet Context in Console
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-[var(--app-gray)] rounded-lg p-4">
              <h4 className="font-medium text-[var(--app-foreground)] mb-2">Expected Wallet Info:</h4>
              <div className="text-sm text-[var(--app-foreground-muted)] space-y-1">
                <p>• Wallet Address: {userAddress || 'Not detected'}</p>
                <p>• Network: Base (Chain ID: 8453)</p>
                <p>• Status: {isWalletConnected ? '✅ Connected' : '❌ Disconnected'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
            {/* Profile Card */}
      {context?.user && (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {context.user.pfpUrl ? (
                  <img 
                    src={context.user.pfpUrl} 
                    alt={`${context.user.displayName || context.user.username} profile`}
                    className="w-16 h-16 rounded-full border-2 border-[var(--app-card-border)]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-16 h-16 bg-[var(--app-primary)] rounded-full flex items-center justify-center ${context.user.pfpUrl ? 'hidden' : ''}`}>
                  <span className="text-2xl">🔗</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--app-foreground)]">
                  {context.user.displayName || context.user.username || 'Farcaster User'}
                </h2>
                <p className="text-[var(--app-foreground-muted)] mb-1">
                  @{context.user.username || 'user'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-[var(--app-foreground-muted)]">
                  <span>📍 Farcaster Network</span>
                  <span className="font-mono text-xs bg-[var(--app-gray)] px-2 py-1 rounded">
                    FID: {context.user.fid}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Connected
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Swap Interface */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-2">
            💱 Token Swap
          </h3>
          <p className="text-[var(--app-foreground-muted)]">
            Swap tokens on Base using your connected wallet. Powered by Uniswap V3.
          </p>
        </div>

        {isWalletConnected ? (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-blue-500 text-sm">
                💡 <strong>Demo Mode:</strong> Using demo wallet address for Base App testing. 
                In a real Farcaster mini app, this would connect to your actual Farcaster wallet.
              </p>
            </div>
            
            <Swap>
              <SwapAmountInput
                label="Sell"
                swappableTokens={swappableTokens}
                token={ETHToken}
                type="from"
              />
              <SwapToggleButton />
              <SwapAmountInput
                label="Buy"
                swappableTokens={swappableTokens}
                token={USDCToken}
                type="to"
              />
              <SwapButton />
              <SwapMessage />
              <SwapToast />
            </Swap>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔒</div>
            <p className="text-[var(--app-foreground-muted)]">
              Please connect your wallet to start swapping tokens.
            </p>
          </div>
        )}
      </div>

      {/* Token Info */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
        <h4 className="font-medium text-[var(--app-foreground)] mb-4">Available Tokens</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {swappableTokens.map((token) => (
            <div key={token.symbol} className="flex items-center space-x-3 p-3 bg-[var(--app-gray)] rounded-lg">
              <img src={token.image || ''} alt={token.name} className="w-8 h-8 rounded-full" />
              <div>
                <p className="font-medium text-[var(--app-foreground)]">{token.symbol}</p>
                <p className="text-sm text-[var(--app-foreground-muted)]">{token.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 