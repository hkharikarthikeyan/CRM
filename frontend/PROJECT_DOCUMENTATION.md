# Employee Attendance Management System

## Project Overview
A comprehensive multi-page Employee Attendance Management System built with React, TypeScript, and Tailwind CSS. This system replicates the exact design and features from the provided reference images.

## Design System
The application uses a carefully crafted design system matching the reference screenshot:
- **Primary Color**: Blue gradient (#2563EB to #1D4ED8)
- **Background**: Light gray (#F5F5F7)
- **Cards**: White with subtle shadows
- **Active Navigation**: Deep navy/black (#1F2937)
- **Typography**: Clear hierarchy with semantic color tokens

## Features Implemented

### 1. Dashboard (Home)
- **Live Clock Card**: Real-time display with Clock In/Out CTA
- **KPI Cards**: 
  - Present Days (18)
  - Leave Balance (12 days)
  - Late Arrivals (2)
  - Attendance Rate (82%)
- **Profile Information Card**: Employee ID, Department, Role, Email
- **Top Bar**: Current date/time with notification icon

### 2. My Attendance
- Daily calendar/records view
- Clock-in/clock-out history with timestamps
- Geo-location and IP-based logging indicators
- Single-click Clock In/Out button
- Status tracking (Present, Late, Absent, Half-day)
- Quick stats for today, week, and month

### 3. My Leaves
- Submit leave request form with:
  - Leave type selection (Sick, Vacation, Personal, Unpaid)
  - Date range picker
  - Reason textarea
- Leave status tracking (Pending, Approved, Rejected)
- Leave balance overview by type
- Leave request history with detailed status

### 4. Reports & Dashboard
- **Time Period Filters**: Daily, Weekly, Monthly, Yearly
- **Department Filter**: View by specific departments
- **Date Range Picker**: Custom date ranges
- **Summary Cards**: Total present, absent, late arrivals, average attendance
- **Charts**:
  - Monthly attendance trends
  - Absenteeism trends by category
- **Export Options**: Excel, PDF, CSV

### 5. Admin Panel
Three main sections:
- **Employee Management**:
  - Add/Edit employees
  - Profile fields: Name, ID, Department, Role, Contact
  - Bulk import/export capabilities
- **Leave Approvals**:
  - Pending leave requests queue
  - One-click approve/reject actions
  - Employee details with leave information
- **Settings**:
  - Shift management
  - Holiday management
  - Integration placeholders (Payroll, Biometric, Mobile App)

## Technical Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Routing**: React Router v6
- **UI Components**: Shadcn/ui (customized)
- **Icons**: Lucide React
- **Forms**: React Hook Form (ready to integrate)
- **State Management**: React Query

## Project Structure
```
src/
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── Sidebar.tsx      # Left navigation sidebar
│   ├── ClockCard.tsx    # Real-time clock with actions
│   ├── KPICard.tsx      # Reusable metric cards
│   └── ProfileCard.tsx  # Employee profile display
├── pages/
│   ├── Dashboard.tsx    # Main dashboard page
│   ├── Attendance.tsx   # Attendance tracking page
│   ├── Leaves.tsx       # Leave management page
│   ├── Reports.tsx      # Analytics & reports page
│   ├── Admin.tsx        # Admin control panel
│   └── NotFound.tsx     # 404 page
├── lib/
│   ├── mockData.ts      # Sample data structures
│   └── utils.ts         # Utility functions
├── App.tsx              # Main app with routing
└── index.css            # Design system tokens
```

## Design Highlights
- **Semantic Color Tokens**: All colors defined in CSS variables (HSL format)
- **Responsive Layout**: Mobile, tablet, and desktop optimized
- **Consistent Spacing**: 16-24px spacing throughout
- **Rounded Cards**: All cards use rounded corners (1rem radius)
- **Hover Effects**: Smooth transitions on interactive elements
- **Active States**: Clear visual feedback for navigation

## Mock Data
The system includes comprehensive sample data:
- 5 sample employees
- Attendance records with various statuses
- Leave requests in different states
- KPI metrics for current month

## Accessibility Features
- Keyboard-accessible navigation
- ARIA labels on interactive controls
- Semantic HTML structure
- Clear focus states
- Responsive for all device sizes

## Future Integration Points
The system is designed with placeholders for:
- **Backend API**: Replace mock data with real API endpoints
- **Database**: SQLite, PostgreSQL, or MongoDB integration
- **Authentication**: User login/logout functionality
- **Real-time Updates**: WebSocket for live attendance tracking
- **Biometric Integration**: Device connectivity endpoints
- **Mobile App API**: REST endpoints for mobile applications
- **Payroll Systems**: Export/import capabilities

## Getting Started
1. All components are ready to use
2. Replace mock data in `src/lib/mockData.ts` with API calls
3. Add authentication flow if needed
4. Connect to your backend services
5. Deploy using the Lovable publish feature

## Reference Images
- Flow Diagram: Shows complete feature structure and relationships
- UI Screenshot: Exact visual reference for design implementation

## Notes
- All images are placeholders awaiting your actual assets
- Company logo can be added to sidebar header
- Profile avatars can be replaced with real photos
- Device screenshots ready for integration section
- Export functionality ready for backend integration

---
**Built with Lovable** - Ready for customization and deployment
