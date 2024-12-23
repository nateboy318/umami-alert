# UmamiAlert

UmamiAlert is a Next.js application that automatically sends daily email reports containing your Umami Analytics data. It leverages Vercel's Cron Jobs and Resend for email delivery.

## Features

- 📊 Daily analytics reports via email
- 📈 Includes key metrics like pageviews, visitors, and bounce rates
- 🌍 Shows top pages, referrers, browsers, devices, and cities
- ⚡ Powered by Vercel Cron Jobs
- 📧 Beautiful, responsive HTML emails using React Email

## Prerequisites

- A [Vercel](https://vercel.com) account
- An [Umami Analytics](https://umami.is) account
- A [Resend](https://resend.com) account for sending emails

## Setup

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Copy the environment variables file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:

```env
# Cron schedule for when to send the email (default: every day at midnight)
CRON_SCHEDULE=0 0 * * *

# Email configuration
FROM_EMAIL=your-from-email@example.com
RECIPIENT_EMAIL=your-recipient@example.com
RESEND_API_KEY=re_xxxxxxxxxxxx

# Umami Analytics configuration
WEBSITE_ID=your-website-id
UMAMI_API_KEY=your-umami-api-key
UMAMI_API_URL=https://api.umami.is
```

## Environment Variables Explained

- `CRON_SCHEDULE`: When to send the email (uses cron syntax)
- `FROM_EMAIL`: The email address emails will be sent from (must be verified in Resend)
- `RECIPIENT_EMAIL`: Where to send the analytics reports
- `RESEND_API_KEY`: Your Resend API key
- `WEBSITE_ID`: Your Umami website ID
- `UMAMI_API_KEY`: Your Umami API key
- `UMAMI_API_URL`: Your Umami API URL (default is api.umami.is)

## Development

To run the development server:

```bash
npm run dev
```

To preview the email template:

```bash
npm run email
```

## Deployment

1. Deploy to Vercel:
```bash
vercel deploy
```

2. Configure environment variables in your Vercel project settings

3. The Vercel Cron Job is automatically configured through the `vercel.json` file to run daily at midnight:

```json
{
    "crons": [
        {
            "path": "/api/email",
            "schedule": "0 0 * * *"
        }
    ]
}
```

## Testing

You can test the email endpoint by visiting `/api/email` in your browser or making a GET request to that endpoint.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
