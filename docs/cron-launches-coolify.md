```markdown
# Auto-update Launch Configuration

This document explains how to configure the scheduled task to automatically update chain launch statuses at 8:00 AM UTC every day.

## How it Works

The launch system operates as follows:

- Chains are initially in `SCHEDULED` status with a programmed launch date.
- At 8:00 AM UTC on the launch day, the status changes to `ONGOING`.
- At 8:00 AM UTC the next day, the status changes to `LAUNCHED`.

## Configuration on Coolify

### 1. Add Environment Variables

Add the following environment variables to your application on Coolify:

```
CRON_SECRET=your_secret_key_here
APP_URL=https://your-domain.com
```

- `CRON_SECRET`: A secret key to secure the API (generate a complex random string).
- `APP_URL`: The base URL of your application.

### 2. Configure the Scheduled Task

In Coolify, create a new scheduled task with the following parameters:

- **Name**: `update-launches`
- **Command**: `/app/scripts/update-launches.sh`
- **Frequency**: `0 8 * * *` (every day at 8:00 AM UTC)
- **Container Name**: The name of your application container

### 3. Make the Script Executable

Ensure the script is executable by running this command in the container:

```bash
chmod +x /app/scripts/update-launches.sh
```

## Manual Testing

To manually test the launch update, you can execute:

```bash
curl -X GET \
  -H "Authorization: Bearer your_secret_key_here" \
  -H "Content-Type: application/json" \
  "https://your-domain.com/api/cron/update-launches"
```

## Logging

Scheduled task logs are available in Coolify under the "Logs" tab of the scheduled task.

## Troubleshooting

If the scheduled task fails, check the following points:

1. The `CRON_SECRET` and `APP_URL` environment variables are correctly defined.
2. The `/app/scripts/update-launches.sh` script is executable.
3. The `/api/cron/update-launches` API is accessible.
4. Check the application logs for potential errors.
```