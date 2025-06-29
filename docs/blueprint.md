# **App Name**: ProPools

## Core Features:

- Role Management: Superadmin, admin, and user roles.
- Dashboard: Interactive dashboards with shortcuts and overviews.
- Pool Management: Manage pools with fields: pool_name, pool_location, pool_picture, pump (pump_image, pump_power, salt_water toggle), has_heatpump toggle, heatpump (heatpump_image, heatpump_on toggle, heatpump_temperature if on), grouting_type, tile_image, extra_info, loses_water toggle, water_loss_reason if loses_water, salt_system_model, salt_system_image, has_ph_controller toggle, sand_filter_model, sand_filter_sand_amount, pool_cover, water_filling_on toggle with alert. Admins can also create additional custom fields as needed.
- Pool Record Keeping: Fields include: ph, cl, chlorine_type, chlorine_quantity, flocculant_type, flocculant_quantity, salt_quantity, acid_quantity, ph_plus_quantity, ph_minus_quantity, algaecide_quantity, chlorine_tablets_quantity, vacuumed, brushed, leaves_cleaned, overall_state, weather_status, created_at. Admins can add custom fields.
- Product Stock: Track stock and user fetches; admins can create custom fields for stock items.
- Navigation: Left sidebar with quick links.
- Security & Permissions: Auth, RBAC, token security.
- Responsive Design: Works across devices.
- Error Handling: Clear user feedback.
- Testing: Unit/integration/e2e.
- Accessibility: WCAG compliance.
- Internationalization: Localized UI support.
- Analytics: Monitoring, telemetry, usage stats.
- Backup & Export: Data backups, export options.
- AI Picture Analysis: Analyze test strip images & pool pictures; provide AI-driven advice.
- Notifications System: Alerts for tasks, low stock, unusual readings.
- User Preferences: Customize dashboard, language, notifications.
- Scheduling & Reminders: Manage tasks and chemical checks.
- API Integration: Future-ready connections with third-party systems.
- Data Visualization: Charts and graphs of pool and stock trends.
- Offline Mode: Limited functionality when offline.
- Help/Support Module: Knowledge base and chat support.
- Role-based Data Visibility: Precise control over data view/edit by role.
- Version Control on Pool Records: Historical snapshots for comparison.
- Import Existing Data: Bulk import of pools, users, products via CSV/Excel.
- Advanced Search & Filters: Find data quickly by multiple criteria.
- Mobile App Version: Strategy for native app or PWA.
- Compliance & Regulations: Data privacy compliance (GDPR, etc).
- User Onboarding: Guided walkthroughs for new users.
- Task Assignment: Admins can assign tasks to users with tracking.
- Multi-language & Multi-currency Management: Admins can enable new languages and currencies for their company, with oversight tools in the superadmin control panel.

## Style Guidelines:

- Sky blue (#87CEEB)
- Light sky blue (#F0F8FF)
- Pale turquoise (#7FFFD4)
- 'Inter' sans-serif
- Clean, line-based
- Left sidebar
- Subtle transitions when loading data