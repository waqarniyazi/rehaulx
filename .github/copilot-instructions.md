# ReHaulX AI Development Guide

## Architecture Overview

ReHaulX uses a **hybrid deployment architecture**:
- **Main App**: Next.js 14 on Vercel (UI, auth, content generation) - `rehaulx.com`
- **App Subdomain**: Repurpose functionality - `app.rehaulx.com` (dev: `app.localhost:3000`)
- **Video Service**: Express.js on Heroku (video analysis, transcript extraction, frame processing)

### Subdomain Routing
- **Main Domain**: `rehaulx.com` - Landing page, auth, about, pricing
- **App Subdomain**: `app.rehaulx.com` - Repurpose page (protected route)
- **Development**: Use `app.localhost:3000` for app subdomain testing

### Key Components

- **Frontend**: `/app` - Next.js App Router with TypeScript, shadcn/ui components
- **API Routes**: `/app/api` - Proxy requests to Heroku video service, handle auth, content generation
- **Video Service**: `/video-service/` - Separate Express.js microservice with Python dependencies
- **Authentication**: Supabase Auth with custom `useAuth` hook
- **Content Generation**: Pluggable LLM providers (Ollama, DeepSeek)

## Design Language & Visual Identity

### Core Design Principles
- **Obsidian Black Theme**: Pure black (`bg-black`) base with layered transparency
- **Glassmorphism**: `bg-white/5 backdrop-blur-xl border border-white/10` for all cards/panels
- **Aurora Effects**: Animated color blobs using low-opacity gradients
- **Interactive Micro-animations**: Hover scales (`hover:scale-105`), smooth transitions
- **Gradient Text**: `bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent`

### Component Patterns
```tsx
// Card pattern - ALWAYS use this for containers
<Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">

// Button pattern - Primary CTA
<Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-2xl shadow-blue-500/25 hover:scale-105">

// Button pattern - Secondary  
<Button variant="outline" className="bg-white/5 backdrop-blur-xl border-white/20 hover:bg-white/10 hover:border-white/30">

// Text hierarchy
<h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
<h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
<p className="text-white/60"> // For secondary text

// Badge pattern
<Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">

// Icon containers
<div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
```

### Animation Standards
- **Duration**: Always use `duration-300` for micro-interactions
- **Hover Effects**: `hover:scale-105` for buttons, `hover:scale-110` for cards
- **Transitions**: `transition-all duration-300` on interactive elements
- **Blur Effects**: `backdrop-blur-xl` for glass panels
- **Pulse Animations**: `animate-pulse` for accent elements

### Color Palette
- **Background**: `bg-black` (pure black base)
- **Glass Panels**: `bg-white/5` with `border-white/10`
- **Hover States**: `hover:bg-white/10` with `hover:border-white/20`
- **Primary Accent**: Blue gradients (`from-blue-600 to-blue-500`)
- **Secondary Accents**: Purple, cyan, emerald (`from-purple-500/20 to-pink-500/20`)
- **Text Primary**: `text-white`
- **Text Secondary**: `text-white/60`
- **Success**: `bg-green-500/20 text-green-400 border-green-500/30`
- **Warning**: `bg-orange-500/20 text-orange-400 border-orange-500/30`

## Critical Workflows

### Authentication System
ReHaulX uses Supabase Auth with automatic email verification:
```bash
# Authentication flow:
Sign Up → Email Verification → Sign In → Protected Routes
```

### Video Analysis Pipeline
```bash
# Video processing flow:
/api/analyze-video -> Heroku /api/analyze-video -> yt-dlp + youtube-transcript-api -> response
```

### Development Setup
```bash
pnpm install
pnpm run dev                           # Main app on :3000
cd video-service && npm start          # Video service on :3001

# Test app subdomain locally
# Add to /etc/hosts: 127.0.0.1 app.localhost
# Access: http://app.localhost:3000
```

### Deployment
```bash
./deploy-video-service.sh          # Deploy video service to Heroku
git push origin main               # Deploy main app to Vercel (auto)
```

## Project-Specific Patterns

### API Route Structure
All video-related APIs proxy to Heroku service:
```typescript
// Pattern: /app/api/[endpoint]/route.ts
const videoServiceUrl = process.env.VIDEO_SERVICE_URL
const response = await fetch(`${videoServiceUrl}/api/endpoint`, {
  method: 'POST',
  body: JSON.stringify(data)
})
```

### Authentication Guards
Protected routes use auth pattern:
```typescript
// Pattern: useAuth hook with redirect to main domain
const { user, loading } = useAuth()
useEffect(() => {
  if (!loading && !user) {
    const redirectUrl = process.env.NODE_ENV === "development" 
      ? "http://localhost:3000/auth/callback?redirect=/repurpose"
      : "https://rehaulx.com/auth/callback?redirect=/repurpose"
    window.location.href = redirectUrl
  }
}, [user, loading])

// Always check loading state to prevent infinite loops
if (loading || !user) {
  return <LoadingComponent />
}
```

### Streaming Content Generation
Real-time content generation uses Server-Sent Events:
```typescript
// Pattern: ReadableStream with progress updates
const stream = new ReadableStream({
  async start(controller) {
    controller.enqueue(`data: ${JSON.stringify({ type: "progress", progress: 10 })}\n\n`)
    // ... generation logic
  }
})
```

## Environment Variables

### Main App (.env.local)
```bash
VIDEO_SERVICE_URL=https://rehaulx-video-xyz.herokuapp.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
LLM_PROVIDER=ollama|deepseek
```

### Video Service (Heroku Config)
```bash
heroku config:set DATABAY_USER=... --app rehaulx-video
heroku config:set DATABAY_PASS=... --app rehaulx-video
```

## Integration Points

### Supabase Integration
- **Client**: Use `createClient()` from `/lib/supabase/client.ts`
- **Server**: Use `createClient()` from `/lib/supabase/server.ts`
- **Auth Routes**: Use `createRouteHandlerClient({ cookies })`

### LLM Provider System
Located in `/lib/llm/`:
```typescript
const provider = getLLMProvider() // Auto-detects from LLM_PROVIDER env
const result = await provider.generateStream(prompt)
```

### Video Service Communication
All video operations route through environment-configured service:
- **Transcript**: `/api/transcript` → Heroku `/api/extract-transcript`
- **Frames**: `/api/extract-frames` → Heroku `/api/extract-frames`  
- **Analysis**: `/api/analyze-video` → Heroku `/api/analyze-video`

## Component Patterns

### Shadcn/ui Integration
Components follow shadcn patterns in `/components/ui/`:
```typescript
// Pattern: Tailwind + CVA + forwardRef
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
  }
)
```

### Multi-Step Form Pattern
Repurpose flow uses step-based state management:
```typescript
// Pattern: /app/repurpose/page.tsx
const [currentStep, setCurrentStep] = useState(1)
const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
// Steps: Submit URL → Choose Type → Generate → Export
```

## Debugging Commands

```bash
# Check video service health
curl https://rehaulx-video-xyz.herokuapp.com/health

# Monitor Heroku logs
heroku logs --tail --app rehaulx-video

# Test video analysis locally
curl -X POST http://localhost:3001/api/analyze-video \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=..."}'

# Test transcript extraction
curl -X POST http://localhost:3000/api/transcript \
  -H "Content-Type: application/json" \
  -d '{"videoId": "dQw4w9WgXcQ"}'
```

## Key Files

- `/middleware.ts` - Handles subdomain routing and auth
- `/app/repurpose/page.tsx` - Main application flow with auth guard
- `/video-service/server.js` - Express microservice with Python integration
- `/deploy-video-service.sh` - Heroku deployment script
- `/lib/llm/index.ts` - LLM provider abstraction
- `/hooks/useAuth.tsx` - Authentication state management
- `/app/globals.css` - Contains glassmorphism and gradient utilities
