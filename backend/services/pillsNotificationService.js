const Pill = require('../models/Pill');
const User = require('../models/User');
const twilio = require('twilio');

// Twilio credentials (you'll need to set these in your environment variables)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;
if (accountSid && authToken) {
  client = require('twilio')(accountSid, authToken);
}

class PillNotificationService {
  // Check for missed pills and send notifications
  async checkMissedPills() {
    try {
      console.log('Checking for missed pills...');

      // Get all active pills
      const activePills = await Pill.find({ active: true });

      for (const pill of activePills) {
        await this.checkAndUpdatePillStatus(pill);
      }

      console.log('Missed pills check completed');
    } catch (error) {
      console.error('Error checking missed pills:', error);
    }
  }

  // Check and update status for a single pill
  async checkAndUpdatePillStatus(pill) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Check if this pill should be taken today based on schedule
      if (!this.shouldTakePillToday(pill, today)) {
        return;
      }

      // Check if pill was already logged for today
      const todayLog = pill.medicationLog.find(log => {
        const logDate = new Date(log.date);
        return logDate.toDateString() === today.toDateString();
      });

      if (todayLog) {
        // Already logged for today
        return;
      }

      // Expected time to take the pill
      const expectedTime = this.getExpectedTime(pill);
      const expectedDateTime = new Date(today);
      expectedDateTime.setHours(...expectedTime.split(':').map(Number));

      // If it's past the expected time + grace period (2 hours), mark as missed
      const gracePeriod = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      const missedThreshold = new Date(expectedDateTime.getTime() + gracePeriod);

      if (now > missedThreshold) {
        // Mark as missed and send notification
        await this.markPillAsMissed(pill, expectedDateTime);
        await this.sendMissedPillNotification(pill);
      }
    } catch (error) {
      console.error(`Error checking pill ${pill._id}:`, error);
    }
  }

  // Determine if pill should be taken today based on schedule
  shouldTakePillToday(pill, today) {
    const dayOfWeek = today.toLocaleLowerCase('en-US', { weekday: 'long' });
    const dayOfMonth = today.getDate();

    switch (pill.schedule.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return pill.schedule.daysOfWeek.includes(dayOfWeek);
      case 'monthly':
        return pill.schedule.daysOfMonth.includes(dayOfMonth);
      default:
        return true;
    }
  }

  // Get expected time for pill based on timing
  getExpectedTime(pill) {
    if (pill.time) {
      return pill.time;
    }

    // Default times based on timing
    const defaultTimes = {
      morning: '08:00',
      afternoon: '14:00',
      evening: '18:00',
      night: '22:00'
    };

    return defaultTimes[pill.timing] || '08:00';
  }

  // Mark pill as missed
  async markPillAsMissed(pill, expectedTime) {
    try {
      const logEntry = {
        date: new Date(),
        scheduledTime: expectedTime.toTimeString().slice(0, 5),
        actualTime: null,
        status: 'missed',
        notes: 'Automatically marked as missed'
      };

      pill.medicationLog.push(logEntry);
      pill.lastChecked = new Date();
      await pill.save();

      console.log(`Marked pill ${pill.name} as missed for user ${pill.userId}`);
    } catch (error) {
      console.error('Error marking pill as missed:', error);
    }
  }

  // Send SMS notification for missed pill
  async sendMissedPillNotification(pill) {
    try {
      // Get user details
      const user = await User.findById(pill.userId);
      if (!user || !user.phone) {
        console.log(`No phone number found for user ${pill.userId}`);
        return;
      }

      const message = `HealthTracker Reminder: You missed taking your ${pill.name} ${pill.dosage || ''} medication scheduled for ${this.getExpectedTime(pill)}. Please take it as soon as possible and update your medication log.`;

      if (accountSid && authToken && twilioPhoneNumber) {
        await client.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: user.phone
        });

        console.log(`Sent missed pill notification to ${user.phone} for ${pill.name}`);
      } else {
        console.log('Twilio credentials not configured, skipping SMS notification');
      }
    } catch (error) {
      console.error('Error sending missed pill notification:', error);
    }
  }

  // Mark pill as taken
  async markPillAsTaken(pillId, userId, notes = '') {
    try {
      const pill = await Pill.findOne({ _id: pillId, userId });
      if (!pill) {
        throw new Error('Pill not found');
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Check if already taken today
      const todayLog = pill.medicationLog.find(log => {
        const logDate = new Date(log.date);
        return logDate.toDateString() === today.toDateString();
      });

      if (todayLog && todayLog.status === 'taken') {
        throw new Error('Pill already marked as taken today');
      }

      const expectedTime = this.getExpectedTime(pill);
      const expectedDateTime = new Date(today);
      expectedDateTime.setHours(...expectedTime.split(':').map(Number));

      // Determine if taken late
      const status = now > expectedDateTime ? 'late' : 'taken';

      const logEntry = {
        date: now,
        scheduledTime: expectedTime,
        actualTime: now,
        status: status,
        notes: notes
      };

      if (todayLog) {
        // Update existing log entry
        todayLog.actualTime = now;
        todayLog.status = status;
        todayLog.notes = notes;
      } else {
        // Add new log entry
        pill.medicationLog.push(logEntry);
      }

      await pill.save();

      console.log(`Marked pill ${pill.name} as ${status} for user ${userId}`);
      return pill;
    } catch (error) {
      console.error('Error marking pill as taken:', error);
      throw error;
    }
  }

  // Get medication history for a user
  async getMedicationHistory(userId, startDate, endDate) {
    try {
      const pills = await Pill.find({
        userId,
        active: true,
        'medicationLog.date': {
          $gte: startDate,
          $lte: endDate
        }
      }).select('name dosage medicationLog');

      const history = [];

      pills.forEach(pill => {
        pill.medicationLog.forEach(log => {
          if (log.date >= startDate && log.date <= endDate) {
            history.push({
              pillId: pill._id,
              pillName: pill.name,
              dosage: pill.dosage,
              date: log.date,
              scheduledTime: log.scheduledTime,
              actualTime: log.actualTime,
              status: log.status,
              notes: log.notes
            });
          }
        });
      });

      // Sort by date descending
      history.sort((a, b) => new Date(b.date) - new Date(a.date));

      return history;
    } catch (error) {
      console.error('Error getting medication history:', error);
      throw error;
    }
  }
}

module.exports = new PillNotificationService();