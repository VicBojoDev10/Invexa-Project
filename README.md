# Invexa - Financial Education App

Gamified financial education application that teaches users about investing through interactive simulations.

## Features

- **Password Protection**: Create and manage account password
- **Account Blocking**: Block/unblock your account security
- **Card Blocking**: Block credit/debit cards for safety
- **Account Deletion**: Delete account with password confirmation
- **Supabase Integration**: Cloud database for multi-client logins
- **Multi-language**: English and Spanish support
- **Investment Simulator**: Learn with virtual money

## Getting Started

### Run Locally

```bash
cd "C:\Users\A106-3\Documents\GitHub\Invexa Project"
npm install
npm start
```

Open http://localhost:8080 in your browser.

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in details:
   - **Name**: Invexa
   - **Database Password**: Your secure password
   - **Region**: Closest to your users
4. Wait for setup to complete (~2 min)

### 2. Get Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGciOiJIUzI1NiIs...`

### 3. Create Database Tables

Run this SQL in **SQL Editor**:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT,
  name TEXT,
  number TEXT,
  balance DECIMAL DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT,
  amount DECIMAL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own data" ON users FOR DELETE USING (auth.uid() = id);

-- Or for public access (development only)
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Public insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Public delete users" ON users FOR DELETE USING (true);
```

### 4. Connect in App

1. Open the app
2. Go to **Options** → **Supabase**
3. Enter your:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIs...`
4. Click **Confirm**

## Security Features

### Password System

- Minimum 6 characters
- Stored as hashed value
- Required for:
  - Blocking/unblocking cards
  - Blocking/unblocking account
  - Deleting account

### Account Blocking

When your account is blocked:
- You cannot access the app
- See blocked screen with "Request Unblock" button
- Need password to unblock

### Card Blocking

Block all cards in Options:
- Cards show as "BLOCKED" overlay
- Cannot add new cards
- Need password to unblock

## App Structure

```
Invexa Project/
├── docs/
│   ├── index.html      # Main HTML
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── i18n.js    # Translations
│       ├── app.js      # Main logic
│       └── main.js    # Entry point
├── images/            # App images/icons
└── package.json
```

## Development

### Add Translations

Edit `docs/js/i18n.js`:

```javascript
es: { newKey: 'Texto en español' },
en: { newKey: 'English text' }
```

### Add Investment Type

Edit `App.investments` array in `app.js`:

```javascript
{
  id: 'newInvestment',
  icon: '📊',
  minLevel: 1,
  riskLevel: 'medium',
  potentialReturn: '5-10%'
}
```

## License

MIT