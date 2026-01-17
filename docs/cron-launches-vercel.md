# Automatic Launch Update Configuration

This document explains how to configure the cron job to automatically update server launch statuses at 8:00 AM UTC every day on Vercel.

## How it works

The launch system works as follows:

- Servers initially have the `SCHEDULED` status with a planned launch date
- At 8:00 AM UTC on the launch day, the status changes to `ONGOING`
- At 8:00 AM UTC the following day, the status changes to `LAUNCHED`
- The top 3 servers with the most upvotes are ranked (supporting ties)
- Abandoned payments (pending for 24+ hours) are automatically cleaned up

## Configuration on Vercel

### 1. Add environment variable

Add the `CRON_SECRET` environment variable to your Vercel project:

1. Go to your project settings on Vercel
2. Navigate to **Environment Variables**
3. Add a new variable:
   - **Key**: `CRON_SECRET`
   - **Value**: A random secret string (use a password generator like 1Password to create a secure string of at least 16 characters)
4. Make sure it's available for all environments (Production, Preview, Development)

### 2. Configure the cron job

The cron job is automatically configured via the `vercel.json` file in the project root:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/cron/update-launches",
      "schedule": "0 8 * * *"
    }
  ]
}
```

This configuration tells Vercel to make an HTTP GET request to `/api/cron/update-launches` every day at 8:00 AM UTC.

### 3. Deploy to production

Cron jobs on Vercel only run on **production deployments**. Deploy your changes to production:

```bash
vercel deploy --prod
```

Or push to your main branch if you have automatic deployments configured.

### 4. View and manage cron jobs

To view your active cron jobs:

1. Go to your project dashboard on Vercel
2. Click on **Settings**
3. Select **Cron Jobs** from the sidebar

Here you can:
- View execution logs
- Temporarily disable cron jobs
- Monitor execution history

### 5. Security

The endpoint is secured using Vercel's recommended approach:

- Vercel automatically sends the `CRON_SECRET` value as an `Authorization: Bearer {token}` header
- The endpoint verifies this header matches the environment variable
- Only requests with the correct secret can execute the cron job

### 6. Manual testing

To manually test the cron job endpoint:

```bash
curl -X GET \
  -H "Authorization: Bearer your_cron_secret_here" \
  "https://your-domain.vercel.app/api/cron/update-launches"
```

Replace `your_cron_secret_here` with your actual `CRON_SECRET` value and `your-domain.vercel.app` with your production URL.

### 7. Monitoring and logs

View cron job execution logs:

1. Go to your project on Vercel
2. Navigate to **Settings** > **Cron Jobs**
3. Click **View Logs** next to the cron job
4. You'll see the function invocation logs with timestamps and any console output

### 8. Troubleshooting

If the cron job isn't working:

1. **Verify the environment variable**: Make sure `CRON_SECRET` is set in your Vercel project settings
2. **Check production deployment**: Cron jobs only run on production, not preview deployments
3. **Review logs**: Check the execution logs in the Vercel dashboard for errors
4. **Verify schedule**: The cron expression `0 8 * * *` runs at 8:00 AM UTC daily
5. **Check endpoint accessibility**: The route should be accessible at `/api/cron/update-launches`

## Cron Expression Reference

The schedule `0 8 * * *` means:
- `0` - Minute (0)
- `8` - Hour (8 AM UTC)
- `*` - Any day of month
- `*` - Any month
- `*` - Any day of week

You can use [crontab.guru](https://crontab.guru/) to validate and understand cron expressions.

## Important Notes

- Vercel cron jobs run in UTC timezone only
- Free/Hobby plans have hourly accuracy limitations (job may run anytime between 08:00-08:59)
- Pro and Enterprise plans have minute-level accuracy
- Cron jobs do not follow redirects
- If a cron job fails, Vercel will not automatically retry it