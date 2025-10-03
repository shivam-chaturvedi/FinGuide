# Admin Dashboard Setup

## Overview
The admin dashboard allows you to upload and manage educational modules for the FinGuide application. Only users with admin privileges can access this dashboard.

## Admin Access
- **Email**: admin@gmail.com
- **Password**: admin (or whatever you set in Supabase)

## Setup Instructions

### 1. Database Setup
Run the following migrations in your Supabase database:
```sql
-- Run the migration files in order:
-- 1. 20250117000000_add_modules_and_admin_role.sql
-- 2. 20250117000001_create_modules_storage.sql
```

### 2. Create Admin User
1. Go to your Supabase Auth dashboard
2. Create a new user with email: `admin@gmail.com`
3. Set a secure password
4. The user profile will automatically be created with admin role

### 3. Storage Bucket
The migration will create a `modules` storage bucket for file uploads. Make sure it's configured as public for file access.

## Admin Dashboard Features

### Overview Tab
- View total modules count
- See published vs draft modules
- Recent modules list

### Modules Tab
- View all modules in the system
- Toggle publish/unpublish status
- Delete modules
- View module details and files

### Upload Module Tab
- Create new educational modules
- Upload supporting files (PDF, images, etc.)
- Set difficulty levels and categories
- Publish immediately or save as draft

### Settings Tab
- Admin preferences (future feature)

## Module Structure
Each module includes:
- **Title**: Module name
- **Description**: Brief overview
- **Content**: Detailed educational content
- **Category**: Module category (e.g., Budgeting, Investment)
- **Difficulty**: Beginner, Intermediate, Advanced
- **Duration**: Estimated completion time in minutes
- **File**: Optional supporting file upload
- **Published**: Whether module is visible to users

## Accessing Admin Dashboard
1. Go to `/login`
2. Login with admin@gmail.com and your password
3. You'll be automatically redirected to `/admin`

## Security
- Only users with `role = 'admin'` or email `admin@gmail.com` can access the dashboard
- All admin routes are protected
- File uploads are restricted to authenticated admin users

