# Building Management App - Project TODO

## Phase 1: Architecture & Schema Design
- [x] Design database schema (apartments, fees, payments, notifications)
- [x] Define data models and relationships
- [x] Plan API procedures and routes

## Phase 2: Database Setup
- [x] Create apartments table with floor and unit information
- [x] Create fee categories table (maintenance, elevator, electricity, cleaning, other)
- [x] Create monthly fees table
- [x] Create payments table with transaction history
- [x] Create notifications table
- [x] Run migrations with `pnpm db:push`

## Phase 3: Backend API Implementation
- [x] Create apartment CRUD procedures
- [x] Create fee management procedures
- [x] Create payment recording procedures
- [x] Create financial report procedures
- [x] Create notification procedures
- [x] Add search and filter procedures

## Phase 4: Frontend Dashboard & Apartment Management
- [x] Design and implement main dashboard
- [x] Display building overview (total apartments, collection status)
- [x] Create apartment registry page
- [x] Implement apartment CRUD forms
- [x] Add floor and unit filtering

## Phase 5: Payment Tracking & Financial Reports
- [x] Create payment recording form
- [x] Build payment history view per apartment
- [x] Implement financial reports page
- [x] Create collection rate charts
- [x] Build outstanding payments report
- [x] Create monthly revenue breakdown visualization

## Phase 6: Search, Filter & Notifications
- [x] Implement search functionality (by floor, owner name, status)
- [x] Add filter controls to apartment list
- [x] Create notification system UI
- [x] Implement overdue payment alerts
- [x] Add notification display component

## Phase 7: Testing
- [x] Write vitest tests for apartment procedures
- [x] Write vitest tests for payment procedures
- [x] Write vitest tests for financial report procedures
- [x] Write vitest tests for search/filter procedures
- [x] Run full test suite

## Phase 8: Interactive Webpage
- [x] Create static webpage showcasing the application
- [x] Add interactive charts and visualizations
- [x] Include feature highlights and benefits

## Phase 9: Delivery
- [x] Create final checkpoint
- [x] Prepare project summary and documentation

## Bug Fixes
- [x] Fix Select.Item empty value error in Apartments page
- [x] Verify all Select components have proper values
- [x] Test all pages for functionality

## Phase 10: Settings Page & Sidebar Navigation
- [ ] Add buildingSettings table to database schema
- [ ] Create backend API procedures for building settings (create, read, update, delete)
- [ ] Create Settings page for admin with form to manage building info
- [ ] Add header component that displays building name and address
- [ ] Create Sidebar component with navigation links
- [ ] Integrate sidebar into main layout
- [ ] Update all pages to use the new sidebar layout
- [ ] Enhance overall design and styling
- [ ] Test all functionality end-to-end
