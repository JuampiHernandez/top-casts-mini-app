"use client";

import { useState, useEffect } from "react";
import { useMiniKit, useAuthenticate } from "@coinbase/onchainkit/minikit";
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
  const { signIn } = useAuthenticate();
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userFid, setUserFid] = useState<number | null>(null);
  const [manualFid, setManualFid] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState(false);

  const [authLoading, setAuthLoading] = useState(false);

  // Try to get FID from Base App context first
  useEffect(() => {
    // Check if we have any user context from Base App
    if (context?.client) {
      console.log('Base App context:', context.client);
      // The FID should be available after authentication
    }
  }, [context]);

  // Handle Sign In with Farcaster
  const handleSignIn = async () => {
    setAuthLoading(true);
    try {
      // Try to authenticate with Farcaster
      const result = await signIn();
      
      if (result) {
        console.log('Authenticated:', result);
        // After successful auth, the context should update with the user's FID
        // For now, we'll use demo mode until we can get the actual FID
        setUserFid(123456);
      }
    } catch (err) {
      console.error('Authentication failed:', err);
      setError('Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchCasts = async (fid: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Note: In a real app, you'd want to proxy this through your backend
      // to avoid exposing your API key in the frontend
      const response = await fetch(`/api/casts?fid=${fid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch casts');
      }
      
      const data = await response.json();
      setCasts(data.casts || []);
    } catch (err) {
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
            Sign In with Farcaster
          </h3>
          <p className="text-[var(--app-foreground-muted)] mb-6">
            Sign in to view your top 10 casts, or try demo mode
          </p>
          
          <div className="space-y-4">
            {!showManualInput ? (
              <>
                <Button
                  onClick={handleSignIn}
                  variant="primary"
                  className="w-full"
                  disabled={authLoading}
                >
                  {authLoading ? 'Signing In...' : 'Sign In with Farcaster'}
                </Button>
                <Button
                  onClick={handleDemoMode}
                  variant="outline"
                  className="w-full"
                >
                  Try Demo Mode (FID: 123456)
                </Button>
                <Button
                  onClick={() => setShowManualInput(true)}
                  variant="ghost"
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