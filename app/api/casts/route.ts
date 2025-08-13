import { NextRequest, NextResponse } from 'next/server';

interface NeynarCast {
  hash: string;
  author: {
    object: string;
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    custody_address: string;
    pro?: {
      status: string;
      subscribed_at: string;
      expires_at: string;
    };
    profile?: {
      bio?: {
        text: string;
        mentioned_profiles?: Array<{
          object: string;
          fid: number;
          username: string;
          display_name: string;
          pfp_url: string;
        }>;
      };
      banner?: {
        url: string;
      };
    };
    follower_count?: number;
    following_count?: number;
    verifications?: string[];
    verified_addresses?: {
      eth_addresses: string[];
      sol_addresses: string[];
    };
    power_badge?: boolean;
    score?: number;
  };
  app?: {
    object: string;
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
  };
  text: string;
  timestamp: string;
  thread_hash?: string;
  parent_hash?: string;
  parent_url?: string;
  root_parent_url?: string;
  reactions?: {
    likes?: number;
    recasts?: number;
    replies?: number;
  };
  embeds?: Array<{
    url: string;
    cast_id?: {
      fid: number;
      hash: string;
    };
  }>;
}

interface NeynarResponse {
  casts: NeynarCast[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    const viewerFid = searchParams.get('viewer_fid') || fid;

    if (!fid) {
      return NextResponse.json(
        { error: 'FID parameter is required' },
        { status: 400 }
      );
    }

    // Get API key from environment variable
    const apiKey = process.env.NEYNAR_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Neynar API key not configured' },
        { status: 500 }
      );
    }

    // Fetch popular casts from Neynar API
                        const apiUrl = `https://api.neynar.com/v2/farcaster/feed/user/popular/?fid=${fid}&viewer_fid=${viewerFid}`;
          console.log('🔗 Calling Neynar API:', apiUrl);
          
          const response = await fetch(apiUrl, {
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
          });

          console.log('📡 Neynar API Response Status:', response.status);
          console.log('📡 Neynar API Response Headers:', Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Neynar API error:', response.status, errorText);
            
            // Try to parse error response
            let errorMessage = 'Failed to fetch casts from Neynar API';
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.error) {
                errorMessage = errorData.error;
              }
            } catch {
              // If not JSON, use the raw text
              if (errorText) {
                errorMessage = `${errorMessage}: ${errorText}`;
              }
            }
            
            return NextResponse.json(
              { error: errorMessage },
              { status: response.status }
            );
          }

    const data: NeynarResponse = await response.json();
    
    // Transform the data to match our Cast interface
    const casts = data.casts?.map((cast: NeynarCast) => ({
      hash: cast.hash,
      author: {
        fid: cast.author.fid,
        username: cast.author.username,
        display_name: cast.author.display_name,
        pfp_url: cast.author.pfp_url,
      },
      text: cast.text,
      timestamp: cast.timestamp,
      reactions: {
        likes: cast.reactions?.likes || 0,
        recasts: cast.reactions?.recasts || 0,
        replies: cast.reactions?.replies || 0,
      },
      embeds: cast.embeds,
    })) || [];

    return NextResponse.json({ casts });
  } catch (error) {
    console.error('Error fetching casts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 