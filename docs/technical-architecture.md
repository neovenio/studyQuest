# StudyQuest Technical Architecture

## Purpose

This document outlines a practical, MVP-first technical architecture for StudyQuest. It favors fast iteration, clean domain modeling, and future extensibility for AI, social, and institutional features.

## Architecture Goals

- Ship the MVP quickly without painting the team into a corner.
- Keep the core learning loop modular and easy to extend.
- Support future mobile clients, sync, analytics, and premium features.
- Maintain clear boundaries between content, progress, tools, and recommendations.

## Recommended Stack

- Frontend: Next.js with React and TypeScript
- UI: Tailwind CSS plus a small reusable component system
- Backend: Next.js route handlers or a dedicated Node.js API layer
- Database: PostgreSQL
- ORM: Prisma
- Authentication: Clerk or Supabase Auth
- Analytics: PostHog
- Background jobs: Trigger.dev, Inngest, or a queue-backed worker
- File/media storage: Supabase Storage or S3-compatible object storage
- AI layer: OpenAI-backed service boundary for recommendations and generation

## System Context

Core systems:

- Web client for dashboard, study flows, and content progression
- API layer for user, content, progress, flashcards, unlocks, and analytics
- Relational database for product state
- Analytics system for product and learning events
- Background job layer for scheduling reviews, computing achievements, and generating recommendations

Future systems:

- Mobile client
- Realtime collaboration or social updates
- Integrations layer for Notion, OneNote, and calendars
- Institution tenant and admin services

## High-Level Modules

### 1. Identity and Access

Responsibilities:

- Authentication
- Session management
- User profile
- Preferences
- Future role support

Core entities:

- User
- Profile
- Preference

### 2. Learning Content

Responsibilities:

- Levels
- Lessons
- Missions
- Completion criteria

Core entities:

- Level
- Lesson
- Mission
- LevelPrerequisite

### 3. Progression and Rewards

Responsibilities:

- User progress
- Unlock rules
- Achievements
- Streaks

Core entities:

- UserLevelProgress
- UnlockRule
- UserUnlock
- AchievementDefinition
- UserAchievement
- StreakSnapshot

### 4. Study Tools

Responsibilities:

- Pomodoro sessions
- Focus mode state
- Future task and reward tracker features

Core entities:

- StudySession
- TimerPreset

### 5. Flashcards and Review

Responsibilities:

- Deck management
- Card authoring
- Review history
- Scheduling

Core entities:

- Deck
- Flashcard
- ReviewSession
- ReviewResult
- ReviewSchedule

### 6. Analytics and Recommendations

Responsibilities:

- Event capture
- Derived metrics
- Recommendation generation
- AI feature boundaries

Core entities:

- AnalyticsEvent
- Recommendation
- RecommendationImpression

## Suggested Data Model

Key relational structure:

- `users`
- `profiles`
- `preferences`
- `levels`
- `lessons`
- `missions`
- `user_level_progress`
- `unlock_rules`
- `user_unlocks`
- `achievement_definitions`
- `user_achievements`
- `study_sessions`
- `decks`
- `flashcards`
- `review_sessions`
- `review_results`
- `review_schedules`
- `analytics_events`
- `recommendations`

Important design choices:

- Keep content definitions separate from user state.
- Store unlock rules declaratively when possible.
- Model flashcard scheduling independently from cards so algorithms can evolve.
- Treat analytics events as append-only.

## API Surface

Suggested route groups:

- `/api/auth/*`
- `/api/me`
- `/api/onboarding`
- `/api/levels`
- `/api/levels/:id/progress`
- `/api/unlocks`
- `/api/dashboard`
- `/api/study-sessions`
- `/api/decks`
- `/api/decks/:id/cards`
- `/api/reviews/queue`
- `/api/reviews/submit`
- `/api/achievements`
- `/api/recommendations`
- `/api/analytics/events`

## Domain Flow

### Onboarding flow

1. User authenticates.
2. User submits onboarding data.
3. Profile and preferences are created.
4. Default progress state and starter recommendations are initialized.
5. User is routed to the first level.

### Level completion flow

1. User completes lesson and mission steps.
2. Progress service validates completion criteria.
3. Level progress is marked complete.
4. Unlock engine evaluates rewards.
5. Achievements and analytics events are recorded.
6. Dashboard state reflects the new unlock and next recommendation.

### Flashcard review flow

1. User requests due cards.
2. Review queue returns cards ordered by schedule priority.
3. User reviews and submits difficulty feedback.
4. Scheduling service updates next review dates.
5. Analytics and achievement events are emitted.

## Background Jobs

MVP jobs:

- Recompute streak snapshots
- Evaluate achievements after session or level completion
- Generate dashboard recommendations
- Process review schedule updates in batches if needed

Later jobs:

- AI-generated session summaries
- AI flashcard generation pipelines
- Social notifications
- Sync reconciliation

## Recommendation Architecture

MVP recommendation strategy:

- Start with a rules-based engine.
- Use onboarding data, recent activity, incomplete levels, streak state, and missed reviews.
- Return recommendation cards with type, reason, priority, and CTA.

Later AI strategy:

- Wrap LLM features behind a dedicated recommendation service.
- Log prompt inputs and outputs safely.
- Keep final recommendations structured, not free-form only.

## Analytics Strategy

Track at minimum:

- `signup_completed`
- `onboarding_completed`
- `level_started`
- `level_completed`
- `tool_unlocked`
- `pomodoro_started`
- `pomodoro_completed`
- `deck_created`
- `flashcard_created`
- `review_started`
- `review_completed`
- `achievement_earned`

Guidelines:

- Keep event names stable and readable.
- Include user ID, timestamp, and relevant entity IDs.
- Distinguish client-side UI events from server-verified completion events.

## Security and Privacy

- Protect all user-scoped routes with authenticated access checks.
- Separate public content from private user state.
- Avoid storing sensitive raw AI prompts when not necessary.
- Design for future privacy controls around social sharing.

## Scalability Notes

- PostgreSQL is sufficient for MVP and early growth.
- Background jobs prevent heavy logic from blocking user flows.
- Modular route groups make it easier to split services later if needed.
- Event-based analytics allows more flexible reporting over time.

## Suggested Build Sequence

1. Set up app shell, auth, database, and analytics foundation.
2. Implement onboarding and profile services.
3. Build level content model and progress tracking.
4. Build unlock engine and dashboard foundations.
5. Implement Pomodoro sessions.
6. Implement flashcard CRUD and review scheduling.
7. Add achievements, streaks, and recommendation cards.

## Key Tradeoffs

- A monolithic app is faster for MVP than microservices.
- Rules-based recommendations are better than early overinvestment in AI.
- Web-first delivery reduces complexity while preserving future mobile expansion.
- Declarative content models will cost more upfront but make new learning paths much easier later.
