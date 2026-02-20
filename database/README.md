# Database Schema and Migrations

This folder contains database schema documentation and migration files.

## Structure

- `schema/` - SQL schema definitions and documentation
- `migrations/` - TypeORM migration files (when migrations are enabled)

## Current Schema

### Users Table

The `users` table stores core user information for authentication and profile management.

**Columns:**
- `id` (UUID, Primary Key) - Unique identifier
- `email` (VARCHAR, Unique) - User's email address
- `password_hash` (VARCHAR) - Hashed password for authentication
- `display_name` (VARCHAR, Nullable) - User's display name
- `credit_balance` (DECIMAL(10,2), Default: 0) - User's credit balance
- `is_active` (BOOLEAN, Default: true) - Account status
- `created_at` (TIMESTAMP) - Account creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

## Entity Location

TypeORM entities are located in `server/src/entities/` as they are TypeScript classes that are part of the NestJS application code.

## Setup

See `DATABASE_SETUP.md` for installation and configuration instructions.

