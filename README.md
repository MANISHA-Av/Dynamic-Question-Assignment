# Dynamic-Question-Assignment

This repository contains the implementation of a **Dynamic-Question-Assignment** that automatically assigns region-specific questions to users on a scheduled cycle. The system is designed to handle multiple regions and configurable cycles, ensuring that new questions are assigned every week (or other configurable duration).

## Features

- **Region-Specific Questions**: Different regions receive different sets of questions.
- **Cycle-Based Assignment**: New questions are assigned every cycle. By default, this occurs every Monday at 7 PM SGT.
- **Cron Job Automation**: A cron job runs weekly to assign questions automatically.
- **Configurable Cycle Duration**: The duration of each cycle can be configured (e.g., weekly, bi-weekly, etc.).
- **Scalability**: Supports multiple regions and can handle large datasets.

## Architecture

### Database Schema

1. **`regions`**: Stores region data.
2. **`questions`**: Stores questions linked to specific regions.
3. **`cycles`**: Configures the cycle start date and duration for each region.
4. **`region_question_assignments`**: Records which question is assigned to a region during a cycle.

### Backend

- **Express API**: Exposes an API to manually assign questions or fetch assigned questions for a user.
- **Node-Cron**: Automatically assigns questions to all regions based on a weekly cycle.
- **Modular Design**: Organized into controllers, routes, and cron jobs for maintainability and scalability.

## Setup

### Prerequisites

- **Node.js**
- **PostgreSQL**
- **npm or yarn**

### Installation

1. Clone the repository:
    ```bash
    git clone <repo-link>
    cd dynamic-question-assignment
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up PostgreSQL and create the necessary tables:
    ```sql
    CREATE TABLE regions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL
    );

    CREATE TABLE questions (
        id SERIAL PRIMARY KEY,
        question_text TEXT NOT NULL,
        region_id INT REFERENCES regions(id)
    );

    CREATE TABLE cycles (
        id SERIAL PRIMARY KEY,
        region_id INT REFERENCES regions(id),
        start_date TIMESTAMPTZ NOT NULL,
        duration_days INT NOT NULL DEFAULT 7
    );

    CREATE TABLE region_question_assignments (
        region_id INT REFERENCES regions(id),
        question_id INT REFERENCES questions(id),
        cycle_id INT REFERENCES cycles(id),
        assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (region_id, cycle_id)
    );
    ```

4. Create a `.env` file and add your PostgreSQL credentials:
    ```env
    DB_USER=yourusername
    DB_HOST=localhost
    DB_DATABASE=yourdatabase
    DB_PASSWORD=yourpassword
    DB_PORT=5432
    ```

5. Run the application:
    ```bash
    node server.js
    ```

### Running the Cron Job

The cron job automatically runs every **Monday at 7 PM SGT** and assigns a new question for each region. You can manually trigger the question assignment by hitting the API if needed.

## API Endpoints

### Assign Questions Manually

```http
POST /api/questions/assign-question
```
### Get Assigned Question for a User

```http
GET /api/questions/user/:userId/assigned-question
```

## Strategy Explanation: Design and Implementation

### Strategy:
The system is designed around a **modular architecture** that separates the concerns of regions, questions, cycles, and their assignments. The question assignment system is both **automated** and **scalable** to accommodate growth in the number of regions and users.

- **Region-Specific Questions**: Each region has its own set of questions, and the system assigns questions based on a rotating cycle. This ensures that users in different regions get unique questions during each cycle.
  
- **Cycle-Based Assignment**: Cycles are designed to be configurable, allowing for a flexible cycle duration. The system is set to assign questions every 7 days by default, starting every Monday at 7 PM SGT. This is managed by a cron job that ensures automated, on-time question assignment.
  
- **Automation with Cron Job**: The cron job is a key part of the architecture. It runs every Monday at 7 PM SGT and automatically assigns a new question to each region. The `node-cron` package is used to manage this scheduling.

- **Database Design**: The database is designed with scalability in mind. It uses separate tables for `regions`, `questions`, `cycles`, and `region_question_assignments`. This design ensures that each region has its own cycle and that question assignments are tracked over time.

- **Modular Architecture**: The application is designed in a modular way, separating controllers, routes, and cron jobs. This makes the system maintainable and easily extensible in the future.

### Pros:
- **Scalability**: The system can handle multiple regions and a large number of questions. The design ensures that as more regions and questions are added, the system continues to perform efficiently.
  
- **Automation**: The cron job automates the question assignment process, ensuring that questions are assigned at the beginning of each cycle without manual intervention.
  
- **Configurable Cycles**: The cycle duration is configurable, meaning the frequency of question assignments can be easily adjusted based on business needs (e.g., daily, weekly, bi-weekly).
  
- **Flexibility**: The design supports both automated and manual assignment of questions. The API can be used to manually assign questions for testing or other purposes.

### Cons:  
- **Database Growth**: Over time, the `region_question_assignments` table may grow large, especially for systems with a high number of regions and frequent cycles. This may require an archiving strategy in the future.
  
- **Cron Job Limitations**: While the cron job is a powerful tool for scheduling, it may not offer real-time adjustments to question assignments unless a more advanced real-time scheduling system is introduced.
