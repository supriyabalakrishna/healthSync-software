# HealthSync Backend

A comprehensive health management system backend built with Node.js, Express, and MongoDB.

## Features

### Pill Reminder System
- **Automatic Medication Tracking**: Automatically marks pills as missed if not taken by the scheduled time + 2-hour grace period
- **Comprehensive Logging**: Maintains detailed logs of all medication taken, missed, and late doses with timestamps
- **SMS Notifications**: Optional Twilio integration for SMS reminders when pills are missed
- **Flexible Scheduling**: Support for daily, weekly, and monthly medication schedules
- **Real-time Status**: Live tracking of today's medication status

### User Management
- Secure authentication with bcryptjs password hashing
- Patient profile management with medical history, emergency contacts, and allergies
- JWT-free session management

### Health Tracking
- Vital signs recording and monitoring
- Meal planning and tracking
- Emergency contact management
- Health reports generation

## API Endpoints

### Pills
- `GET /api/pills/:userId` - Get all pills for a user
- `POST /api/pills` - Add a new pill
- `PUT /api/pills/:id/taken` - Mark pill as taken
- `GET /api/pills/:userId/history` - Get medication history
- `GET /api/pills/:userId/today` - Get today's medication status
- `DELETE /api/pills/:id` - Delete a pill

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Vitals, Meals, Contacts, Reports
- Standard CRUD operations for health tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)
- `TWILIO_ACCOUNT_SID`: Twilio account SID (optional)
- `TWILIO_AUTH_TOKEN`: Twilio auth token (optional)
- `TWILIO_PHONE_NUMBER`: Twilio phone number (optional)

3. Start MongoDB service

4. Seed the database (optional):
```bash
node seed.js
```

5. Start the server:
```bash
npm start
```

## Pill Reminder System Details

### Automatic Processing
- **Scheduled Checks**: Runs every 15 minutes and hourly
- **Missed Detection**: Marks pills as missed if not taken within 2 hours of scheduled time
- **SMS Alerts**: Sends notifications for missed pills (requires Twilio setup)

### Medication Log Structure
```javascript
{
  date: Date,           // When the log entry was created
  scheduledTime: String, // Expected time (e.g., "08:00")
  actualTime: Date,     // When actually taken (null if missed)
  status: String,       // 'taken', 'missed', 'late'
  notes: String         // Optional notes
}
```

### Scheduling Options
- **Daily**: Takes every day
- **Weekly**: Specify days of the week
- **Monthly**: Specify days of the month

## Twilio SMS Setup (Optional)

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID, Auth Token, and phone number
3. Add them to your `.env` file
4. The system will automatically send SMS notifications for missed pills

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcryptjs** - Password hashing
- **Twilio** - SMS notifications
- **node-cron** - Scheduled tasks
- **CORS** - Cross-origin resource sharing

## License

MIT License