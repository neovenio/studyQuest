# StudyQuest Linear Backlog

This document organizes the project into epics, user stories, tasks, and subtasks in a format that can be copied into Linear.

Suggested priority scale:

- P0: Critical for MVP
- P1: Important for beta
- P2: Valuable after core launch

---

## Epic 1: Product Foundation and Onboarding

### User Story 1.1

As a new user, I want to create an account and complete onboarding so that StudyQuest can personalize my study journey.

Tasks:

- Build sign up, sign in, and password reset flows
- Create onboarding questionnaire for goals, study style, subjects, and challenges
- Save onboarding profile and preferences
- Create first-time user welcome flow

Subtasks:

- Design auth screens and validation states
- Define onboarding questions and data schema
- Implement onboarding API and persistence
- Create post-onboarding redirect logic
- Track onboarding completion analytics

Priority: P0

### User Story 1.2

As a user, I want my profile and preferences saved so that my dashboard and recommendations feel personalized.

Tasks:

- Create user profile model
- Add editable preferences page
- Support avatar, theme, and study goal settings

Subtasks:

- Define profile fields
- Build preferences UI
- Implement update profile API
- Add validation and autosave states

Priority: P0

---

## Epic 2: Progressive Learning System

### User Story 2.1

As a learner, I want structured study levels so that I can learn proven techniques step by step.

Tasks:

- Define level system architecture
- Create lesson, mission, and completion models
- Build level progression UI
- Add level completion and reward logic

Subtasks:

- Define content schema for levels, lessons, and missions
- Build level map screen
- Implement locked and unlocked state handling
- Show completion progress and next recommended level

Priority: P0

### User Story 2.2

As a learner, I want content for the first study methods so that I can start improving immediately.

Tasks:

- Create Active Recall level
- Create Spaced Repetition level
- Create Pomodoro level

Subtasks:

- Write lesson copy and exercises for each level
- Define mission success criteria
- Add quiz or check-for-understanding steps
- QA content flow for clarity and pacing

Priority: P0

---

## Epic 3: Tool Unlocking System

### User Story 3.1

As a user, I want to unlock tools as I progress so that the app feels rewarding and guided.

Tasks:

- Build unlock rules engine
- Map levels to tool rewards
- Create unlock celebration UI
- Store unlocked tool state per user

Subtasks:

- Define unlock conditions and reward types
- Implement unlock event handler
- Add animations and notifications for unlock moments
- Persist reward history

Priority: P0

### User Story 3.2

As a user, I want to view what I have unlocked and what comes next so that I stay motivated.

Tasks:

- Create rewards and unlocks inventory page
- Show upcoming unlocks in dashboard and level map
- Add achievement history

Subtasks:

- Design unlock inventory cards
- Add locked-state previews
- Show progress toward next unlock
- Instrument click and engagement analytics

Priority: P1

---

## Epic 4: Personalized Study Dashboard

### User Story 4.1

As a user, I want a dashboard with my most important tools and progress so that I can begin studying quickly.

Tasks:

- Build dashboard layout
- Add daily goals, streaks, and progress widgets
- Add recent activity and recommended next action widgets

Subtasks:

- Define dashboard widget system
- Build default widget layout
- Implement dashboard data aggregation API
- Add empty states for new users

Priority: P0

### User Story 4.2

As a user, I want to customize my dashboard so that it matches how I study.

Tasks:

- Add drag-and-drop widget arrangement
- Allow widget hide/show behavior
- Save per-user dashboard layout

Subtasks:

- Build dashboard settings modal
- Implement widget layout persistence
- Add mobile-responsive widget arrangement

Priority: P1

---

## Epic 5: Focus Tools and Session Management

### User Story 5.1

As a learner, I want a Pomodoro timer so that I can run focused study sessions.

Tasks:

- Build Pomodoro timer UI
- Support work, short break, and long break sessions
- Save timer session history

Subtasks:

- Add timer presets and custom durations
- Add start, pause, resume, and reset states
- Persist completed sessions
- Trigger rewards or streak updates after completion

Priority: P0

### User Story 5.2

As a learner, I want focus mode tools so that I can reduce distractions while studying.

Tasks:

- Create focus mode UI
- Add optional task-only or timer-only view
- Design future browser and device distraction-blocking hooks

Subtasks:

- Build minimal focus screen
- Hide non-essential UI during sessions
- Define blocker integration architecture for later versions

Priority: P1

---

## Epic 6: Smart Flashcard System

### User Story 6.1

As a learner, I want to create flashcards so that I can study course material actively.

Tasks:

- Build flashcard deck management
- Build flashcard creation and editing flows
- Support tags, subjects, and difficulty metadata

Subtasks:

- Create deck list and deck detail views
- Add flashcard editor form
- Support import-ready schema for future integrations

Priority: P0

### User Story 6.2

As a learner, I want an adaptive review system so that I review cards at the right time.

Tasks:

- Implement spaced repetition scheduling model
- Build review session flow
- Capture review difficulty feedback

Subtasks:

- Define scheduling algorithm version 1
- Store next review dates and recall performance
- Build due-cards queue
- Show review summary after session

Priority: P0

### User Story 6.3

As a learner, I want AI help creating flashcards so that preparing materials is faster.

Tasks:

- Add AI-assisted flashcard generation flow
- Support pasted notes or text input
- Add human review before save

Subtasks:

- Design AI generation prompt and response schema
- Build generation review screen
- Add token/error handling states
- Track acceptance and edit rates

Priority: P1

---

## Epic 7: Rewards, Achievements, and Motivation

### User Story 7.1

As a user, I want badges, streaks, and milestone rewards so that I stay motivated over time.

Tasks:

- Build achievement engine
- Create streak system
- Create badge library and milestone definitions

Subtasks:

- Define achievement triggers
- Build achievement notification UI
- Add achievements page
- Support shareable achievement cards later

Priority: P0

### User Story 7.2

As a user, I want progress visualizations so that I can see my growth clearly.

Tasks:

- Create study activity charts
- Show weekly and monthly streak visualizations
- Show level progress and mastery trends

Subtasks:

- Define analytics events and derived metrics
- Build chart components
- Add date filters and empty states

Priority: P1

---

## Epic 8: Social and Accountability Features

### User Story 8.1

As a learner, I want to share progress with friends or groups so that I feel accountable.

Tasks:

- Create progress sharing model
- Build lightweight social feed or updates view
- Add privacy controls for shared progress

Subtasks:

- Define public, friends-only, and private visibility rules
- Build progress card UI
- Add share action from dashboard and achievements

Priority: P1

### User Story 8.2

As a learner, I want to find a study buddy or accountability group so that I can stay consistent.

Tasks:

- Build study buddy matching flow
- Build accountability group model
- Add group goals and check-ins

Subtasks:

- Define matching criteria
- Create group creation and join flows
- Add group streaks or shared challenge tracking

Priority: P2

### User Story 8.3

As a learner, I want challenge and competition modes so that studying feels more engaging.

Tasks:

- Create study sprint challenge model
- Build leaderboard or challenge progress UI
- Add invite or join challenge flow

Subtasks:

- Define fair scoring system
- Prevent low-quality engagement exploits
- Build weekly challenge templates

Priority: P2

---

## Epic 9: AI Recommendations and Personalization

### User Story 9.1

As a learner, I want personalized recommendations so that I use the study methods that fit me best.

Tasks:

- Build recommendation rules engine for MVP
- Add recommendation cards to dashboard
- Use session, progress, and review data as inputs

Subtasks:

- Define recommendation triggers
- Create recommendation copy templates
- Track recommendation impressions and acceptance

Priority: P1

### User Story 9.2

As a learner, I want smarter AI coaching over time so that the app helps me improve my habits.

Tasks:

- Build AI coaching service layer
- Add session summaries and habit suggestions
- Flag ineffective patterns such as missed reviews or burnout pacing

Subtasks:

- Define coaching prompt inputs
- Build recommendation feedback loop
- Add user controls for AI guidance frequency

Priority: P2

---

## Epic 10: Analytics and Insights

### User Story 10.1

As a learner, I want study session analytics so that I understand what is helping me improve.

Tasks:

- Track session duration, completion, and method usage
- Build personal analytics dashboard
- Show method effectiveness trends

Subtasks:

- Define event tracking plan
- Build analytics aggregation jobs
- Create insights cards for best study windows and strongest methods

Priority: P1

### User Story 10.2

As a product team, we want product analytics so that we can improve retention and activation.

Tasks:

- Implement analytics event taxonomy
- Track activation funnel and retention metrics
- Build internal dashboard or external analytics integration

Subtasks:

- Define naming conventions for events
- Add tracking to onboarding, levels, tools, and flashcards
- Validate event quality in staging

Priority: P0

---

## Epic 11: Cross-Platform Sync and Offline Mode

### User Story 11.1

As a user, I want my progress synced across devices so that I can study anywhere.

Tasks:

- Design sync architecture
- Sync progress, dashboard, flashcards, and settings
- Resolve conflicts gracefully

Subtasks:

- Define syncable entities
- Create updated-at and conflict resolution strategy
- Test same-account behavior across devices

Priority: P1

### User Story 11.2

As a user, I want offline access to core study features so that I can keep working without internet.

Tasks:

- Add offline support for flashcards, tasks, and timers
- Queue sync updates for later
- Show offline status and sync states

Subtasks:

- Define offline-capable data models
- Build local persistence layer
- Handle optimistic updates and sync retries

Priority: P2

---

## Epic 12: Integrations

### User Story 12.1

As a user, I want to connect my external study tools so that StudyQuest fits my existing workflow.

Tasks:

- Design integrations framework
- Add Notion integration exploration
- Add OneNote integration exploration
- Add Google Calendar sync for study sessions

Subtasks:

- Define permissions model for connected apps
- Build connected accounts settings page
- Map external content into internal study objects

Priority: P2

---

## Epic 13: Premium and Monetization

### User Story 13.1

As a user, I want a clear premium upgrade path so that I understand what extra value I get.

Tasks:

- Define free vs premium feature gating
- Build premium upsell surfaces
- Add subscription management

Subtasks:

- Create pricing page
- Add plan comparison table
- Gate premium analytics and AI features

Priority: P1

### User Story 13.2

As a user, I want cosmetic customization so that I can express my identity in the app.

Tasks:

- Build themes, avatars, and badge cosmetics
- Create cosmetic inventory and selection UI
- Support unlockable and purchasable cosmetics

Subtasks:

- Define cosmetic asset schema
- Build profile customization screen
- Track cosmetic engagement

Priority: P2

---

## Epic 14: B2B and Institutional Features

### User Story 14.1

As an educator or institution, I want visibility into learner progress so that I can support students better.

Tasks:

- Define institution account model
- Build educator dashboard
- Add cohort progress views

Subtasks:

- Define permissions and roles
- Build cohort invite flows
- Create student progress summary views

Priority: P2

### User Story 14.2

As an institution, I want custom learning paths so that StudyQuest fits my curriculum.

Tasks:

- Build custom path authoring tools
- Support institution-branded paths
- Add assignment or cohort-based level delivery

Subtasks:

- Define content authoring schema
- Build custom path builder
- Add publishing workflow

Priority: P2

---

## Recommended MVP Cut for Linear Milestone 1

These should be created first if the goal is to launch quickly:

- Epic 1: Product Foundation and Onboarding
- Epic 2: Progressive Learning System
- Epic 3: Tool Unlocking System
- Epic 4: Personalized Study Dashboard
- Epic 5: Focus Tools and Session Management
- Epic 6: Smart Flashcard System
- Epic 7: Rewards, Achievements, and Motivation
- Epic 10: Product analytics instrumentation from User Story 10.2

## Suggested First Sprint

- Set up auth and onboarding
- Define data models for levels, tools, unlocks, flashcards, and achievements
- Build the first level flow
- Build Pomodoro timer
- Build flashcard CRUD and basic review
- Build dashboard MVP
- Add analytics events for onboarding, level completion, tool unlock, and session completion
