# Users Module

This module is **required for the MVP** and handles user authentication and profile management.

## Purpose

The Users module provides:
- User registration and authentication
- User profile management
- Credit balance tracking
- User account status management

## Components

- `users.module.ts` - NestJS module configuration
- `users.service.ts` - Business logic for user operations
- `users.controller.ts` - REST API endpoints

## API Endpoints

- `POST /users` - Create a new user
- `GET /users` - Get all users (admin)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user

## Next Steps

This module will need to be extended with:
- Password hashing (bcrypt)
- JWT authentication
- Login/logout endpoints
- Password reset functionality

