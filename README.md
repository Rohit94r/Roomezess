# Roomezes - Student Campus Platform

A comprehensive digital platform for campus living and daily services, built with Next.js and Supabase.

## Features

- **Canteen Ordering**: Order food from multiple canteens with Razorpay payment integration
- **Room Finder**: Find and list rooms near campus
- **Roommate Matching**: Connect with potential roommates
- **Community Hub**: Social features with posts, comments, and likes
- **Service Management**: Laundry, mess, and printing services
- **Admin Dashboard**: Complete management interface

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Razorpay
- **Notifications**: WhatsApp Cloud API, Nodemailer

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see .env.example)
4. Run development server: `npm run dev`

## Environment Variables

Create `.env.local` in the frontend directory:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
GMAIL_USER=your_gmail
GMAIL_PASS=your_app_password
```

## Deployment

The project is ready for deployment on Vercel or similar platforms.

## License

MIT License