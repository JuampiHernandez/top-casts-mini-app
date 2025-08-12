import { NextRequest, NextResponse } from 'next/server';

interface NeynarCast {
  hash: string;
  author: {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
  };
  text: string;
  timestamp: string;
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
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/cast/user/popular?fid=${fid}&viewer_fid=${viewerFid}`,
      {
        headers: {
          'api_key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Neynar API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch casts from Neynar API' },
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