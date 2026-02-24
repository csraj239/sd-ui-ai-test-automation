# Successive Digital UI AI Enabled Test Automation Product

## Project Repos
```
Project will have 3 Repos:
       - Frontend: Conatins all front end code
       - Backend: Contains APIs and Database Interactions
       - Executor: Contains code to execue the test script or schedule it in a queue when it is not up and running using Redis and BullMQ

Use https://www.saucedemo.com username:'standard_user' password: 'secret_sauce' for any sample scriptg creation or testing the logic


Open AI Info: 
AZURE_OPENAI_ENDPOINT=https://genaipoc-sd.openai.azure.com/
OPENAI_API_KEY='5z3f4jOI9J4yxJGrHwCjq8UrHaJPU4m5ogNPcaRWhoQng5MkUQfqJQQJ99AJACYeBjFXJ3w3AAABACOGviNg'
OPENAI_API_VERSION="2023-03-15-preview"
AZURE_DEPLOYMENT_NAME="gpt-4o"

OPENAI_API_TYPE="azure"

```

## Technology Stack Summary

```
FRONTEND
├─ React 18.3.1
├─ TypeScript 4.9.5
├─ Tailwind CSS 3.4.1
├─ Axios (HTTP client)
├─ Zustand (State management)
└─ React Router (Navigation)

BACKEND
├─ NestJS 10.x
├─ TypeScript 5.3.x
├─ TypeORM (Database ORM)
├─ PostgreSQL 15 (Main database)
├─ Redis 7.4.7 (Cache & Job queue)
├─ BullMQ (Job orchestration)
└─ Swagger/OpenAPI (Documentation)

INFRASTRUCTURE
├─ Docker Compose (Container orchestration)
├─ PostgreSQL 15 (Data persistence)
├─ Redis 7.4.7 (Caching & queues)
├─ MinIO (Object storage)
└─ Node.js 18.x+ (Runtime)

TESTING & AUTOMATION
├─ Custom AI Agents (Planner, Generator, Healer)
├─ Playwright (Browser automation)
└─ Jest (Testing framework)
```


## Project Requirement
```
User Interation:
       - Home Page (https://localhost:3000)
       - Dashboard page (https://localhost:3000/dashboard)
              - Display Total Nos of Projects, Test Suites, Test Scenarios
              - Create database table as required
       - Project page (https://localhost:3000/projects)
              - Fetch the existing projects in a table having option to edit & delete
              - Ability to Add new project
              - Edit existing project
              - Delete existing project
              - Create database table as required

       - Planner page (https://localhost:3000/planner)
              - Fetch the existing Test Plans in a table having option to edit & delete for the selected Project on the project page
              - User can create new Test Plan
              - To create new test plan User provided following information to be used by planner using LLM to generate the Test Scenarios
                     - Navigation Flow
                     - Acceptance Criteria
                     - Prompt
              - Once required info for new Test plan is provided as mentioned above system enables Generate Plan button
              - System generate new Plans as per provided acceptance criteria using Custom Planner AI Agent
              - Display all the generated test scenarios with a checkbox so that user can select the require test scenario to save as part of the Test Plan in database
              - Link test Scenarios with the Test Plan
              - Link Test Plan with the Project
              - Create database table as required

       - Generator page (https://localhost:3000/generator)
              - Fetch the existing Test Plans in a drop down on generator page
              - User will be able to selecte the Test Scenarios from the selected test plan to generate the playwright script using custom Generator AI Agent
              - User will have ability to run the generated test script
              - User will have ability to save the test script in database
              - System should ask user to provide Test Scenarios Name before saving
              - Saved Scripts will be displayed on Test Scenario Page
              - Save test script should be linked to the Test Plan which is currently selected in the drop down
              - User will have option to reset the generator page by clicking reset button this will remove the all the generated script and allow user to select Test Plan agin to generate test scripts
              - Create database table as required


       - Test Scenario page (https://localhost:3000/scenarios)
              - Fetch the saved generated TestScenario Name in a table for the selected project option to edit & delete
              - User will have option to create a new Test Scenario.
              - User will have option to import an existing test Scenario steps while creating the new test scenario
              - When user select a TestScenario from the table Test script should be displayed.
              - User will have option to edit the existing playwright script and save it
              - User will have option to execute the modified test script
              - Create database table as required

       - Test Suite page (https://localhost:3000/suites)
              - Fetch the list of existing test suites for the selected project
              - Allow user to create a new test suite by adding test scenario
              - Allow user to edit, delete existing test suite
              - Allow user to execute the test suite
              - Create database table as required

       - Executor page (https://localhost:3000/execution)
              - Allow user to create an execution list
              - Provide the list of Test Scenarios to be added to the execution list
              - Allow user to execute the Test Scenarios in the execution list
              - Create report of the execution
              - Store execution report for analytics
              - Store videos and screenshot during the script execution as artifacts
              - Create database table as required

       - Report page (https://localhost:3000/reports)
              - Provide execution details of all the Test Scenarios and Test Suite
              - Overall times each Test Scenarios that has been executed
              - Test Scenario Pass and Fail count
              - Create database table as required

       - Healer page (https://localhost:3000/healer)
              - Display the list of failed test scenario from the last run
              - Allow user to select test scenario to execute and fix using Custom Healer AI Agent
              - Allow user to save the fixed test scenario
---

