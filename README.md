# SV11B SAR Price Tracker

A Next.js dashboard for tracking Pokemon TCG **SV11B Black Bolt** Special Art Rare (SAR) card prices.

![Dashboard Preview](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)

## Features

- 🎴 **Real-time price tracking** for SAR, AR, and SR cards from SV11B Black Bolt & SV11W White Flare
- 📊 **Market & low price** display with seller/listing counts
- 🎯 **Advanced Filtering:**
  - Filter by set (Black Bolt, White Flare, or both)
  - Filter by rarity (SAR, AR, SR, or all)
  - Price range filtering
  - Full-text search by card name or number
  - Multiple sort options (price, name, card number)
- 🔄 **Auto-refresh** every hour (with manual refresh option)
- 📱 **Responsive design** - works on mobile, tablet, and desktop
- 🌙 **Dark theme** with gradient background
- 🖼️ **High-quality card images** from TCGPlayer CDN
- 🔗 **Direct links** to TCGPlayer for each card
- 📈 **Real-time stats** - total cards, API credits used, last update time

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Pokemon Price Tracker API** for live price data

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Pokemon Price Tracker API key (get yours at [pokemonpricetracker.com/api](https://www.pokemonpricetracker.com/api))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Keytoexplore/sv11bsar.git
cd sv11bsar
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Add your API key to `.env.local`:
```
POKEMON_API_KEY=your_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Keytoexplore/sv11bsar)

### Manual Deployment

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variable:
   - Name: `POKEMON_API_KEY`
   - Value: Your API key
6. Click "Deploy"

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `POKEMON_API_KEY` | Your Pokemon Price Tracker API key | Yes |
| `NEXT_PUBLIC_APP_NAME` | App name (optional) | No |

## API Rate Limits

- **Free Plan**: 100 credits/day, 60 calls/minute
- Each card costs 1 credit
- History data costs +1 credit per card

The app is optimized to stay within free tier limits with ISR (Incremental Static Regeneration) revalidating every hour.

## Project Structure

```
sv11bsar/
├── app/
│   ├── page.tsx          # Main page with SSR data fetching
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles
├── components/
│   ├── Card.tsx          # Individual card component
│   ├── CardGrid.tsx      # Grid layout for cards
│   └── RefreshButton.tsx # Manual refresh button
├── .env.local            # Environment variables (not in git)
└── README.md             # This file
```

## Customization

### Customize Tracked Sets

Edit `app/page.tsx` and modify the `sets` array in the `getAllCards` function:

```typescript
const sets = ['Black Bolt', 'White Flare']; // Change this array to track different sets
```

By default, the app tracks both Black Bolt (SV11B) and White Flare (SV11W) sets with all three rarity types (SAR, AR, SR).

### Adjust Refresh Interval

In `app/page.tsx`, change the `revalidate` value (in seconds):

```typescript
next: { revalidate: 3600 } // 1 hour = 3600 seconds
```

## License

MIT

## Acknowledgments

- Pokemon Price Tracker API for price data
- TCGPlayer for card images
- The Pokemon Company for Pokemon TCG
