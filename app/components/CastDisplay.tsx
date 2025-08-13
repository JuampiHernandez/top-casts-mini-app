"use client";

import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import Image from "next/image";
import { Button } from "./DemoComponents";

interface Cast {
  hash: string;
  author: {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
  };
  text: string;
  timestamp: string;
  reactions: {
    likes: number;
    recasts: number;
    replies: number;
  };
  embeds?: Array<{
    url: string;
    cast_id?: {
      fid: number;
      hash: string;
    };
  }>;
}

interface CastDisplayProps {
  className?: string;
}

export function CastDisplay({ className = "" }: CastDisplayProps) {
  const { context } = useMiniKit();
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userFid, setUserFid] = useState<number | null>(null);
  const [manualFid, setManualFid] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState(false);

  // Get FID from Base App context automatically
  useEffect(() => {
    console.log('=== FARCASTER CONTEXT DEBUG ===');
    console.log('Full context object:', context);
    
    if (context) {
      console.log('Context exists, checking client...');
      console.log('Context keys:', Object.keys(context));
      
      // Check if we have user info directly in context
      if (context.user) {
        console.log('✅ User info found in context.user:', context.user);
        console.log('User keys:', Object.keys(context.user));
        if (context.user.fid) {
          console.log('✅ FID found directly in context.user.fid:', context.user.fid);
        }
      }
      
      if (context.client) {
        console.log('Client exists, full client object:', context.client);
        console.log('Client keys:', Object.keys(context.client));
        
        // Try to extract FID from context using type assertion
        // The context should contain user information when accessed from Base App
        const clientContext = context.client as Record<string, unknown>;
        const contextKeys = Object.keys(clientContext);
        console.log('Available client context keys:', contextKeys);
        
        // Log all client properties in detail
        for (const key of contextKeys) {
          const value = clientContext[key];
          console.log(`Client.${key}:`, value);
          console.log(`Client.${key} type:`, typeof value);
          if (value && typeof value === 'object') {
            console.log(`Client.${key} keys:`, Object.keys(value as Record<string, unknown>));
          }
        }
        
        // Look for FID in various possible locations
        // Based on console output, FID is at context.user.fid
        if (context.user && typeof context.user === 'object' && context.user !== null && 'fid' in context.user && typeof context.user.fid === 'number') {
          setUserFid(context.user.fid);
          console.log('✅ FID found in context.user.fid:', context.user.fid);
        } else if (typeof clientContext.fid === 'number') {
          setUserFid(clientContext.fid);
          console.log('✅ FID found in context.client.fid:', clientContext.fid);
        } else if (clientContext.user && typeof clientContext.user === 'object' && clientContext.user !== null && 'fid' in clientContext.user && typeof (clientContext.user as Record<string, unknown>).fid === 'number') {
          setUserFid((clientContext.user as Record<string, unknown>).fid as number);
          console.log('✅ FID found in context.client.user.fid:', (clientContext.user as Record<string, unknown>).fid);
        } else {
          console.log('🔍 No FID found in direct properties, searching nested objects...');
          // Try to find FID in other context properties
          for (const key of contextKeys) {
            const value = clientContext[key];
            if (value && typeof value === 'object' && value !== null && 'fid' in value && typeof (value as Record<string, unknown>).fid === 'number') {
              setUserFid((value as Record<string, unknown>).fid as number);
              console.log(`✅ FID found in context.client.${key}.fid:`, (value as Record<string, unknown>).fid);
              break;
            }
          }
        }
      } else {
        console.log('❌ No client in context');
      }
    } else {
      console.log('❌ No context available');
    }
    
    console.log('=== END FARCASTER CONTEXT DEBUG ===');
  }, [context]);

  // Auto-fetch casts when FID is available
  useEffect(() => {
    if (userFid) {
      fetchCasts(userFid);
    }
  }, [userFid]);

  const fetchCasts = async (fid: number) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching casts for FID:', fid);
      const response = await fetch(`/api/casts?fid=${fid}`);
      
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`Failed to fetch casts: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ API Response data:', data);
      setCasts(data.casts || []);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch casts');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchCasts = () => {
    if (userFid) {
      fetchCasts(userFid);
    }
  };

  const handleManualFidSubmit = () => {
    const fid = parseInt(manualFid);
    if (!isNaN(fid) && fid > 0) {
      setUserFid(fid);
      setShowManualInput(false);
      setManualFid("");
    }
  };

  const handleDemoMode = () => {
    setUserFid(123456); // Demo FID
    setShowManualInput(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!userFid) {
    return (
      <div className={`bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-[var(--app-foreground)] mb-4">
            Loading Farcaster Context...
          </h3>
          <p className="text-[var(--app-foreground-muted)] mb-6">
            Attempting to get your FID from Base App context. If not available, you can try demo mode or enter a custom FID.
          </p>
          
          <div className="mb-4">
            <Button
              onClick={() => {
                console.log('=== MANUAL CONTEXT CHECK ===');
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
              🔍 Debug: Check Context in Console
            </Button>
          </div>
          
          <div className="space-y-4">
            {!showManualInput ? (
              <>
                <Button
                  onClick={handleDemoMode}
                  variant="primary"
                  className="w-full"
                >
                  Try Demo Mode (FID: 123456)
                </Button>
                <Button
                  onClick={() => setShowManualInput(true)}
                  variant="outline"
                  className="w-full"
                >
                  Enter Custom FID
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Enter FID (e.g., 123456)"
                  value={manualFid}
                  onChange={(e) => setManualFid(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--app-card-border)] rounded-lg bg-[var(--app-background)] text-[var(--app-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleManualFidSubmit}
                    variant="primary"
                    className="flex-1"
                    disabled={!manualFid.trim()}
                  >
                    Load Casts
                  </Button>
                  <Button
                    onClick={() => setShowManualInput(false)}
                    variant="ghost"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Profile Card */}
      {userFid && context?.user && (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Image
                src={context.user.pfpUrl || "/default-avatar.svg"}
                alt={`${context.user.displayName || context.user.username} profile`}
                width={64}
                height={64}
                className="rounded-full border-2 border-[var(--app-card-border)]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/default-avatar.svg";
                }}
                unoptimized={true}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[var(--app-foreground)]">
                {context.user.displayName || context.user.username}
              </h2>
              <p className="text-[var(--app-foreground-muted)] mb-2">
                @{context.user.username}
              </p>
              <div className="flex items-center space-x-4 text-sm text-[var(--app-foreground-muted)]">
                <span>FID: {userFid}</span>
                {context.user.location?.description && (
                  <span>📍 {context.user.location.description}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-[var(--app-foreground)]">
            Your Top Farcaster Casts
          </h3>
          <Button
            onClick={handleFetchCasts}
            disabled={loading}
            variant="primary"
            size="sm"
          >
            {loading ? 'Loading...' : 'Refresh Casts'}
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {casts.length === 0 && !loading && !error && (
          <div className="text-center py-8">
            <p className="text-[var(--app-foreground-muted)] mb-4">
              No casts found. Click &ldquo;Refresh Casts&rdquo; to load your top 10 casts.
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-accent)] mx-auto mb-2"></div>
            <p className="text-[var(--app-foreground-muted)]">Loading your casts...</p>
          </div>
        )}

        <div className="space-y-4">
          {casts.map((cast, index) => (
            <div
              key={cast.hash}
              className="border border-[var(--app-card-border)] rounded-lg p-4 hover:bg-[var(--app-gray)] transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Image
                    src={cast.author.pfp_url || '/default-avatar.svg'}
                    alt={cast.author.display_name || cast.author.username}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                    onError={() => {
                      // Fallback is handled by the src prop
                    }}
                    unoptimized={true}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-[var(--app-foreground)]">
                      {cast.author.display_name || cast.author.username}
                    </span>
                    <span className="text-sm text-[var(--app-foreground-muted)]">
                      @{cast.author.username}
                    </span>
                    <span className="text-xs text-[var(--app-foreground-muted)]">
                      {formatTimestamp(cast.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-[var(--app-foreground)] mb-3">
                    {truncateText(cast.text)}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-[var(--app-foreground-muted)]">
                    <span className="flex items-center space-x-1">
                      <span>❤️</span>
                      <span>{cast.reactions.likes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>🔄</span>
                      <span>{cast.reactions.recasts}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>💬</span>
                      <span>{cast.reactions.replies}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <span className="text-xs font-medium text-[var(--app-accent)] bg-[var(--app-accent-light)] px-2 py-1 rounded-full">
                    #{index + 1}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 