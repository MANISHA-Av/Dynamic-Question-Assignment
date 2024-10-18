const express = require('express');
const questionRoutes = require('./routes/questionRoutes');
const cron = require('node-cron');
const { assignQuestionToRegion } = require('./controllers/questionControllers');

const app = express();

app.use(express.json());

app.use('/api/questions', questionRoutes);

// Cron Job to automatically assign questions every Monday at 7 PM SGT
cron.schedule('0 19 * * 1', async () => {
  console.log('Running the weekly question assignment at Monday 7 PM SGT');

  try {
    // Automatically assign questions to regions for the current cycle
    await assignQuestionToRegion();
    console.log('Successfully assigned questions for all regions');
  } catch (error) {
    console.error('Error running the weekly assignment:', error);
  }
}, {
  timezone: 'Asia/Singapore'
});

module.exports = app;
