# UnderKilometer

## Overview

UnderKilometer is a Flask-based web application designed to help students find suitable accommodation near their educational institutions. The platform provides filtering capabilities for listings based on price range, distance from campus, accommodation type, gender preferences, and available amenities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Framework
- **Flask** serves as the web framework, handling routing and template rendering
- **Jinja2** templating engine for server-side HTML generation
- Templates are organized with partial includes (filters.html, amenities.html, accom-card.html) for reusability

### Database Layer
- **SQLAlchemy** as the ORM with raw SQL queries via `text()` for flexibility
- **MySQL** database hosted externally (connection string via `DATABASE_URL_STRING` environment variable)
- SSL-verified connections required for database security
- Single main table: `UnderKilometer_database` containing accommodation listings

### Data Model
Key fields in the accommodation table:
- `id` (primary key, starts from 2)
- `accommodation_name`, `accomodation_type`, `room_type`, `gender_type`
- `distance` (numeric, in kilometers)
- `overall_monthly_rent` (numeric)
- `available_amenities` (string, comma-separated or similar format for LIKE queries)
- `phone_number`

### Frontend Architecture
- Server-rendered HTML with Jinja2 templates
- CSS organized by page: `style.css` (global), `index.css` (homepage), `details.css` (detail page)
- Custom CSS variables for theming (colors, spacing, radii)
- Scroll-driven hero animation system using canvas and frame sequences (192 PNG/JPG frames)
- Animation frames stored in `static/underkilometer-frames/`

### Filter System
Dynamic query building with parameterized filters:
- Distance (within 0.5km, 1km, 2km, or more than 2km)
- Accommodation type (Private Hostel, PG, Flat)
- Gender type
- Maximum monthly rent
- Amenities (multi-select, uses SQL LIKE for partial matching)

## External Dependencies

### Database
- **MySQL/MariaDB** - External hosted database with SSL verification
- Connection configured via `DATABASE_URL_STRING` environment variable

### Python Packages
- `flask` - Web framework
- `gunicorn` - Production WSGI server
- `SQLAlchemy` - Database ORM
- `pymysql` - MySQL database driver

### Frontend Libraries (CDN)
- Google Fonts: Inter, STIX Two Text, Noto Sans
- Animate.css for animations

### Static Assets
- Frame sequence images for hero animation (192 frames in `static/underkilometer-frames/`)