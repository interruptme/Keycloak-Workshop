# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Setup
- Backend (.NET): `cd backend/src/SimpleAPI.Web && dotnet restore && dotnet run`
- Frontend (Vue.js): `cd frontend && npm install && npm run dev`
- Run entire solution: `docker-compose up -d`

## Commands
- Frontend lint: `cd frontend && npm run lint`
- Frontend test: `cd frontend && npm run test`
- Frontend test (watch): `cd frontend && npm run test:watch`
- Backend build: `cd backend/src/SimpleAPI.Web && dotnet build`
- Backend run: `cd backend/src/SimpleAPI.Web && dotnet run` 

## Code Style
- Backend: C# with nullable reference types, FastEndpoints framework
  - 2-space indentation, PascalCase for methods/classes, _camelCase for private fields
  - Use interfaces for services with dependency injection
- Frontend: Vue 3 with Composition API, TypeScript
  - 2-space indentation, camelCase for variables/functions, PascalCase for components
  - Use @/services path alias for imports
  - Wrap API calls in try/catch blocks
  - Keep components small and focused on a single responsibility