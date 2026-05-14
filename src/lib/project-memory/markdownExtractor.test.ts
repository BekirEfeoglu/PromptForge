import { describe, expect, it } from 'vitest';
import { extractProjectMemoryFromMarkdown } from './markdownExtractor';

describe('project memory markdown extractor', () => {
  it('extracts project memory fields from structured markdown sections', () => {
    const result = extractProjectMemoryFromMarkdown(`# OdoBot

## What is OdoBot
Turkish Discord moderation bot with local project memory and command workflows.

## Tech Stack
- Node.js 22+
- discord.js v14
- SQLite

## Core Architecture
Event-driven Discord events, command handlers and local persistence.

## Database Schema
\`\`\`sql
guilds(id, name)
voice_rooms(id, owner_id)
\`\`\`

## Current State
Bot boots and slash commands are deployed.

## Working Features
- Moderation commands
- Voice room setup

## Known Bugs
- Stale voice room records can block creation

## Rules
- Do not break existing commands
- Keep replies ephemeral for operator actions
`);

    expect(result.name).toBe('OdoBot');
    expect(result.description).toContain('Turkish Discord moderation bot');
    expect(result.tech_stack).toEqual(expect.arrayContaining(['Node.js 22+', 'discord.js v14', 'SQLite']));
    expect(result.core_architecture).toContain('Event-driven Discord events');
    expect(result.database_schema).toContain('voice_rooms');
    expect(result.current_state).toContain('slash commands');
    expect(result.working_features).toContain('Moderation commands');
    expect(result.known_bugs).toContain('Stale voice room records can block creation');
    expect(result.rules).toContain('Do not break existing commands');
  });

  it('uses common README/CLAUDE signals when explicit field headings are missing', () => {
    const result = extractProjectMemoryFromMarkdown(`# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Development Commands
\`\`\`bash
npm run dev
npm start
\`\`\`

The application is built with React, TypeScript, Vite and Zustand.
`);

    expect(result.name).toBeUndefined();
    expect(result.description).toContain('application is built');
    expect(result.tech_stack).toEqual(expect.arrayContaining(['React', 'TypeScript', 'Vite', 'Zustand']));
  });
});
