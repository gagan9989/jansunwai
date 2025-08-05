# Grievance Management System with Admin Dashboard

A comprehensive grievance management system built with Next.js, TypeScript, and Supabase, featuring both user and admin portals.

## Features

### User Portal
- User registration and authentication
- Complaint submission with file attachments
- Complaint tracking and status updates
- Multi-language support
- Responsive design for mobile devices

### Admin Dashboard
- Secure admin authentication
- Comprehensive dashboard with analytics
- Complaint management and status updates
- User management
- Export functionality
- Role-based access control

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI Components**: Radix UI, Lucide React Icons
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Charts**: Recharts

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd grievance-management-system
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up Supabase

1. Create a new project in [Supabase](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-setup.sql`
4. Execute the script to create all necessary tables and policies

### 5. Create Admin User

After setting up the database, you need to create an admin user:

1. First, register a regular user through the signup page
2. Go to your Supabase dashboard > Table Editor > admin_users
3. Insert a new record with the following structure:

```sql
INSERT INTO admin_users (user_id, name, email, role, permissions) 
VALUES (
  'your_user_uuid_from_auth_users', 
  'Admin Name', 
  'admin@example.com', 
  'super_admin', 
  ARRAY['manage_complaints', 'manage_users', 'manage_categories', 'export_data']
);
```

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the user portal.

## Project Structure

```
├── app/                          # Next.js app directory
│   ├── admin/                    # Admin portal pages
│   │   ├── dashboard/           # Admin dashboard
│   │   ├── complaints/          # Complaint management
│   │   └── signin/              # Admin login
│   ├── dashboard/               # User dashboard
│   ├── login/                   # User login
│   ├── signup/                  # User registration
│   └── lodge-grievance/         # Complaint submission
├── components/                   # Reusable UI components
│   ├── ui/                      # Shadcn/ui components
│   ├── header.tsx              # Header component
│   └── theme-provider.tsx      # Theme provider
├── lib/                         # Utility libraries
│   ├── admin-auth.ts           # Admin authentication
│   ├── admin-service.ts        # Admin API services
│   ├── auth.ts                 # User authentication
│   ├── complaints.ts           # Complaint services
│   └── supabase.ts            # Supabase client
├── hooks/                       # Custom React hooks
└── public/                      # Static assets
```

## Admin Dashboard Features

### Dashboard Overview
- **Statistics Cards**: Total complaints, pending, in progress, resolved
- **Charts**: Complaints by category and status
- **Recent Complaints**: Latest complaint submissions

### Complaint Management
- **Search & Filter**: Search by registration number, subject, or filter by status
- **Bulk Actions**: Export complaints to CSV
- **Status Updates**: Update complaint status with notes
- **Assignment**: Assign complaints to specific admins

### User Management
- **Admin Users**: Create and manage admin accounts
- **Role-based Access**: Different permission levels
- **User Profiles**: View and manage user information

### Analytics & Reporting
- **Real-time Statistics**: Live dashboard updates
- **Export Functionality**: Download complaint data
- **Performance Metrics**: Resolution time tracking

## API Endpoints

### User Endpoints
- `GET /api/complaints` - Get user's complaints
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints/[id]` - Get specific complaint
- `PUT /api/complaints/[id]/status` - Update complaint status

### Admin Endpoints
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/complaints` - Get all complaints with filters
- `PUT /api/admin/complaints/[id]` - Update complaint
- `POST /api/admin/responses` - Add response to complaint
- `GET /api/admin/export` - Export complaints data

## Database Schema

### Core Tables
- `complaints` - Main complaints table
- `complaint_categories` - Complaint categories
- `complaint_subcategories` - Subcategories
- `complaint_statuses` - Status definitions
- `complaint_responses` - Admin responses
- `admin_users` - Admin user accounts
- `profiles` - User profiles

### Key Features
- **Row Level Security (RLS)**: Secure data access
- **Auto-generated IDs**: Registration numbers
- **Audit Trail**: Created/updated timestamps
- **File Attachments**: Supabase storage integration

## Security Features

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control
- **Data Protection**: Row Level Security policies
- **Input Validation**: Form validation and sanitization
- **File Upload Security**: Secure file storage

## Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

### Planned Features
- [ ] Email notifications
- [ ] SMS integration
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Multi-department support
- [ ] API documentation
- [ ] Performance optimization
- [ ] Accessibility improvements

### Known Issues
- File upload size limits
- Real-time updates (WebSocket integration)
- Offline support
- Multi-language content management

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check Supabase URL and API key
   - Verify database is set up correctly
   - Check RLS policies

2. **Admin Login Issues**
   - Ensure admin user exists in admin_users table
   - Verify user_id matches auth.users table
   - Check role and permissions

3. **File Upload Errors**
   - Verify storage bucket exists
   - Check storage policies
   - Ensure file size is within limits

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies are installed

### Performance Tips

- Use database indexes for frequently queried columns
- Implement pagination for large datasets
- Optimize images and assets
- Use CDN for static files
- Enable caching where appropriate 