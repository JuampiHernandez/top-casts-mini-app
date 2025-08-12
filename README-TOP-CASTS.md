# Top Casts Mini App

A Base App mini app built with MiniKit that displays your top 10 Farcaster casts using the Neynar API.

## Features

- **Wallet Integration**: Connect your wallet to access the app
- **Top Casts Display**: Shows your 10 most popular Farcaster casts
- **Beautiful UI**: Modern, responsive design with Tailwind CSS
- **Real-time Data**: Fetches live data from the Neynar API
- **Mini App Ready**: Built for Base App with proper frame integration

## Getting Started

### Prerequisites

1. **Neynar API Key**: Get your free API key at [neynar.com](https://neynar.com/)
2. **Node.js**: Version 20.12.2 or higher
3. **Base App**: Access to Base App for testing

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Neynar API key:
   ```bash
   NEYNAR_API_KEY=your_actual_api_key_here
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Configuration

### Required Environment Variables

- `NEYNAR_API_KEY`: Your Neynar API key for fetching Farcaster data

### Optional Environment Variables

- `NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME`: Name of your mini app
- `NEXT_PUBLIC_URL`: Your app's URL
- `NEXT_PUBLIC_ICON_URL`: Icon URL for your app
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: OnchainKit API key

## How It Works

1. **Wallet Connection**: Users connect their wallet using OnchainKit
2. **FID Resolution**: The app resolves the user's Farcaster ID (FID)
3. **API Call**: Makes a request to the Neynar API to fetch top 10 casts
4. **Data Display**: Renders the casts in a beautiful, responsive interface

## API Endpoints

- `GET /api/casts?fid={fid}`: Fetches top 10 casts for a given FID
  - Uses the Neynar API: `https://api.neynar.com/v2/farcaster/cast/user/popular`
  - Returns formatted cast data with author info, text, reactions, and timestamps

## Customization

### Styling
The app uses Tailwind CSS with custom CSS variables defined in `theme.css`. You can customize:
- Colors and themes
- Typography
- Spacing and layout
- Component styles

### Adding Features
Consider adding these features to enhance the app:
- **Cast Search**: Allow users to search for specific casts
- **User Profiles**: Display detailed user information
- **Cast Interactions**: Like, recast, and reply to casts
- **Notifications**: Alert users about new popular casts
- **Analytics**: Track which casts are most engaging

### Performance Improvements
- **Caching**: Implement Redis caching for API responses
- **Pagination**: Load casts in batches for better performance
- **Real-time Updates**: Use WebSockets for live cast updates

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Troubleshooting

### Common Issues

1. **"Neynar API key not configured"**
   - Ensure `NEYNAR_API_KEY` is set in your `.env.local` file
   - Restart your development server after adding the key

2. **"Failed to fetch casts"**
   - Check your Neynar API key is valid
   - Verify the API endpoint is accessible
   - Check browser console for detailed error messages

3. **Wallet connection issues**
   - Ensure you're using a supported wallet (Coinbase Wallet, MetaMask, etc.)
   - Check if you're on the correct network (Base)

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

- **Base Documentation**: [docs.base.org](https://docs.base.org)
- **MiniKit Guide**: [docs.base.org/base-app/miniapps/overview](https://docs.base.org/base-app/miniapps/overview)
- **Neynar API**: [docs.neynar.com](https://docs.neynar.com)

## Roadmap

- [ ] Cast search functionality
- [ ] User profile pages
- [ ] Cast interaction buttons
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Cast sharing features 