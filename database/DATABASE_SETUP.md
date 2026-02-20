# Database Setup Guide

## PostgreSQL Setup

This project uses PostgreSQL with TypeORM for database management.

## Prerequisites

1. Install PostgreSQL on your machine:
   - **Windows**: Download from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
   - **macOS**: `brew install postgresql` or download from the official site
   - **Linux**: `sudo apt-get install postgresql` (Ubuntu/Debian)

2. Start PostgreSQL service:
   - **Windows**: PostgreSQL service should start automatically
   - **macOS/Linux**: `brew services start postgresql` or `sudo systemctl start postgresql`

## Database Configuration

1. Create a `.env` file in the `server` directory with the following variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=souvenote
NODE_ENV=development
```

2. Create the database:

```sql
CREATE DATABASE souvenote;
```

Or via command line:
```bash
createdb souvenote
```

## Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. The database will automatically synchronize in development mode (synchronize: true).

## Database Schema

### User Entity

The `User` entity includes:
- `id` (UUID, Primary Key)
- `email` (Unique)
- `passwordHash` (for authentication)
- `displayName` (Optional)
- `creditBalance` (Decimal, default: 0)
- `isActive` (Boolean, default: true)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

## Using TablePlus

1. Download and install [TablePlus](https://tableplus.com/)
2. Create a new connection:
   - Type: PostgreSQL
   - Host: localhost
   - Port: 5432
   - User: postgres
   - Password: your_password
   - Database: souvenote
3. Connect and explore the database

## Production Notes

In production, set `NODE_ENV=production` and use migrations instead of `synchronize: true`. TypeORM migrations should be used for schema changes in production environments.

