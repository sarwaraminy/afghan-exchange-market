# Afghan Exchange Market - Features

## Overview

Afghan Exchange Market (Sarafi) is a comprehensive currency exchange platform providing real-time exchange rates, gold prices, and financial news for the Afghan market.

---

## Core Features

### 1. Exchange Rates

#### Real-Time Currency Rates
- Live exchange rates from multiple Afghan markets
- Buy and sell rates for each currency
- Previous rate comparison with percentage change
- Support for 10+ major currencies

#### Supported Markets
| Market | Location | Description |
|--------|----------|-------------|
| Sarai Shahzada | Kabul | Primary money exchange market |
| Khorasan Market | Herat | Western Afghanistan exchange |
| Da Afghanistan Bank | Kabul | Central bank rates |

#### Supported Currencies
| Code | Currency | Symbol |
|------|----------|--------|
| USD | US Dollar | $ |
| EUR | Euro | € |
| GBP | British Pound | £ |
| PKR | Pakistani Rupee | ₨ |
| INR | Indian Rupee | ₹ |
| IRR | Iranian Rial | ﷼ |
| SAR | Saudi Riyal | ﷼ |
| AED | UAE Dirham | د.إ |
| CNY | Chinese Yuan | ¥ |
| TRY | Turkish Lira | ₺ |

---

### 2. Gold & Precious Metals

#### Gold Rate Tracking
- Real-time gold prices in AFN and USD
- Multiple gold types supported:
  - 24 Karat (Pure Gold)
  - 22 Karat
  - 21 Karat
  - 18 Karat
- Silver price tracking
- Price per gram standardization

#### Price History
- Previous price comparison
- Percentage change indicators
- Visual trend indicators

---

### 3. Currency Converter

#### Conversion Features
- Convert between any supported currencies
- Market-specific conversion rates
- Real-time rate application
- Bidirectional conversion (to/from AFN)

#### Usage
1. Select source currency
2. Select target currency
3. Enter amount
4. Choose market (optional)
5. View converted amount with applied rate

---

### 4. Multi-Language Support

#### Supported Languages
| Language | Code | Direction |
|----------|------|-----------|
| English | en | LTR |
| Dari (Persian) | fa | RTL |
| Pashto | ps | RTL |

#### Localization Features
- Full UI translation
- Currency names in all languages
- Market names in local languages
- News content in multiple languages
- RTL layout support for Dari and Pashto

---

### 5. User Accounts

#### Registration & Authentication
- Email-based registration
- Secure password requirements:
  - Minimum 8 characters
  - Uppercase and lowercase letters
  - Numbers and special characters
- JWT-based authentication
- 7-day session validity

#### User Profile
- Profile management
- Language preference
- Password change capability

---

### 6. Favorites System

#### Currency Favorites
- Mark currencies as favorites
- Quick access to favorite rates
- Dashboard widget for favorites
- Easy add/remove functionality

---

### 7. Price Alerts

#### Alert Configuration
- Set target price for any currency
- Alert types:
  - **Above**: Notify when rate goes above target
  - **Below**: Notify when rate goes below target
- Enable/disable alerts
- Multiple alerts per user

#### Alert Management
- View all active alerts
- Edit alert parameters
- Delete unwanted alerts
- Alert trigger history

---

### 8. News & Announcements

#### News Features
- Market news and updates
- Official announcements
- Multi-language content
- Category filtering:
  - Market news
  - Announcements
  - General news

#### News Display
- Featured images
- Publication date
- Author attribution
- Category badges

---

### 9. User Dashboard

#### Dashboard Widgets
- Favorites count
- Active alerts count
- Recent rate updates
- Quick access to common actions

---

### 10. Admin Panel

#### Rate Management
- Update exchange rates
- Add new currency pairs
- Delete rate entries
- Market-specific rate control

#### Gold Rate Management
- Update gold/silver prices
- Add new precious metal types
- Manage price units

#### News Management
- Create news articles
- Multi-language content entry
- Publish/unpublish control
- Edit existing articles
- Delete articles

#### Market & Currency Management
- Add new markets
- Add new currencies
- Manage active status

---

## User Interface Features

### Responsive Design
- Mobile-friendly layout
- Tablet optimization
- Desktop full-featured view

### Accessibility
- Semantic HTML structure
- Keyboard navigation
- Screen reader compatible
- High contrast support

### Performance
- Fast initial load
- Optimized API calls
- Efficient data caching
- Lazy loading for images

---

## Security Features

### Authentication Security
- Secure password hashing (bcrypt)
- JWT token authentication
- Token expiration handling
- Automatic logout on token invalid

### API Security
- Rate limiting protection
- CORS configuration
- Input validation
- SQL injection prevention

### Data Protection
- No sensitive data in localStorage
- Secure HTTP headers
- XSS prevention

---

## Future Considerations

- Push notifications for alerts
- Historical rate charts
- Export functionality
- Mobile applications
- SMS alerts
- WhatsApp integration
