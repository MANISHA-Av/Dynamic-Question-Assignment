const pool = require('../config/db');
const moment = require('moment-timezone');

// Helper function to get the current cycle based on configurable cycle duration
async function getCurrentCycle(regionId) {
  const result = await pool.query(`
    SELECT * FROM cycles
    WHERE region_id = $1
    ORDER BY start_date DESC
    LIMIT 1
  `, [regionId]);

  if (result.rows.length === 0) {
    throw new Error('No cycle found for the region');
  }

  const cycle = result.rows[0];
  const cycleDurationDays = cycle.duration_days; 
  const startDate = moment.tz(cycle.start_date, 'Asia/Singapore');
  const currentDate = moment.tz('Asia/Singapore'); 

  const diffInMs = currentDate.diff(startDate);

  // Calculate the number of cycles that have passed since the start date
  const cycleDurationMs = cycleDurationDays * 24 * 60 * 60 * 1000; 
  const cycleNumber = Math.floor(diffInMs / cycleDurationMs) + 1; 

  return { cycleNumber, cycle };
}

async function assignQuestionToRegion() {
    try {
      // Fetch all regions from the database
      const regionResult = await pool.query(`
        SELECT id FROM regions
      `);
  
      const regions = regionResult.rows;
  
      // Loop through each region and assign a question
      for (const region of regions) {
        const regionId = region.id;
  
        // Get the current cycle for the region
        const { cycleNumber, cycle } = await getCurrentCycle(regionId);
  
        // Fetch all questions for the current region
        const questionResult = await pool.query(`
          SELECT id, question_text 
          FROM questions 
          WHERE region_id = $1
          ORDER BY id ASC
        `, [regionId]);
  
        const totalQuestions = questionResult.rows.length;
  
        if (totalQuestions === 0) {
          console.error(`No questions found for region ${regionId}`);
          continue;
        }
  
        const questionIndex = (cycleNumber - 1) % totalQuestions;
        const selectedQuestion = questionResult.rows[questionIndex];
  
        // Insert the question assignment for the region and cycle
        await pool.query(`
          INSERT INTO region_question_assignments (region_id, question_id, cycle_id)
          VALUES ($1, $2, $3)
          ON CONFLICT (region_id, cycle_id) DO NOTHING
        `, [regionId, selectedQuestion.id, cycle.id]);
  
        console.log(`Assigned question "${selectedQuestion.question_text}" (ID: ${selectedQuestion.id}) to region ${regionId}`);
      }
    } catch (error) {
      console.error('Error assigning questions to regions:', error);
    }
  }
  
async function getUserAssignedQuestion(req, res) {
  const { userId } = req.params;

  try {
    const userResult = await pool.query(`
      SELECT region_id FROM users WHERE id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).send('User not found');
    }

    const regionId = userResult.rows[0].region_id;

    const { cycle } = await getCurrentCycle(regionId);

    const assignmentResult = await pool.query(`
      SELECT rqa.question_id, q.question_text
      FROM region_question_assignments rqa
      JOIN questions q ON rqa.question_id = q.id
      WHERE rqa.region_id = $1 AND rqa.cycle_id = $2
    `, [regionId, cycle.id]);

    if (assignmentResult.rows.length === 0) {
      return res.status(404).send('No question assigned for this cycle');
    }

    const assignedQuestion = assignmentResult.rows[0];
    res.status(200).json(assignedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching assigned question');
  }
}

module.exports = {
  assignQuestionToRegion,
  getUserAssignedQuestion
};
