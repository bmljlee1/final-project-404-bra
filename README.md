# Happy Hands

## Overview

Happy Hands is an interactive application designed to help parents encourage positive behavior in their children through a gamified chore and mission system. Children can earn rewards for completing tasks set by their parents, promoting responsibility and family engagement.

## Features

- **Parent Dashboard**: Create and manage chores/missions, approve completed tasks, and distribute rewards
- **Child Dashboard**: View assigned tasks, mark them as complete, and track earned rewards
- **Reward System**: Customizable rewards using coins/gems currency
- **QR Authentication**: Children can access their profiles by scanning a QR code
- **Reward Proposals**: Children can suggest rewards they'd like to earn
- **Responsive Design**: Optimized for both desktop and mobile devices

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: CSS, Chakra UI, React Icons
- **Backend**: Supabase
- **Monitoring**: Sentry
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js and npm installed
- Git for cloning the repository

### Installation

1. Clone the repo
```
function test() {
  console.log("notice the blank line before this function?");
}
```
2. CD into happy hands
3. Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
4. Install dependencies with npm -i
5. Start the development server
npm run dev
6. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## Current Status

The application is still under development with the following components implemented:

- Landing page for product showcase
- Authentication/Authorization via Supabase
- Backend data structure in Supabase
- Sentry integration for monitoring and error tracking
- Parent and child dashboards with basic functionality
- QR code authentication for children
- Responsive design for mobile devices

## Deployment

The application can be deployed to Vercel or hosted locally according to your preferences.

Deployed URL - https://final-project-404-bra.vercel.app/

