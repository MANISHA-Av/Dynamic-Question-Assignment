const express = require('express');
const {
  assignQuestionToRegion,
  getUserAssignedQuestion
} = require('../controllers/questionControllers');

const router = express.Router();

// Route to assign a question to a region for the current cycle
router.post('/assign-question', assignQuestionToRegion);

// Route to get assigned question for a user
router.get('/user/:userId/assigned-question', getUserAssignedQuestion);

module.exports = router;
