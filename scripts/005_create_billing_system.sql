-- This script creates all tables needed for the subscription and usage tracking system

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Plans table to store subscription plan details
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- 'starter', 'basic', 'growth', 'pro'
    display_name VARCHAR(100) NOT NULL, -- 'Starter Plan', 'Basic Plan', etc.
    price_monthly DECIMAL(10,2) NOT NULL, -- Monthly price in USD
    price_yearly DECIMAL(10,2) NOT NULL, -- Yearly price in USD
    minutes_monthly INTEGER NOT NULL, -- Minutes included per month
    minutes_yearly INTEGER NOT NULL, -- Minutes included per year
    perks JSONB DEFAULT '[]'::jsonb, -- Array of perks/features
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Avoid duplicate plan names
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'plans_name_key'
    ) THEN
        ALTER TABLE plans ADD CONSTRAINT plans_name_key UNIQUE (name);
    END IF;
END $$;

-- Insert default plans
INSERT INTO plans (name, display_name, price_monthly, price_yearly, minutes_monthly, minutes_yearly, perks) VALUES
('starter', 'Starter Plan', 8.00, 80.00, 100, 1200, '[
    "AI-powered content generation",
    "Basic templates",
    "Email support",
    "Export to multiple formats"
]'::jsonb),
('basic', 'Basic Plan', 18.00, 160.00, 300, 2400, '[
    "Everything in Starter",
    "Advanced AI models",
    "Priority processing",
    "Custom branding",
    "Analytics dashboard"
]'::jsonb),
('growth', 'Growth Plan', 35.00, 280.00, 800, 6400, '[
    "Everything in Basic",
    "Bulk processing",
    "Team collaboration",
    "API access",
    "Priority support",
    "Custom integrations"
]'::jsonb),
('pro', 'Pro Plan', 60.00, 480.00, 1600, 12800, '[
    "Everything in Growth",
    "White-label solution",
    "Dedicated account manager",
    "Custom AI training",
    "Enterprise integrations",
    "24/7 phone support"
]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- User subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES plans(id),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'paused', 'expired')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    razorpay_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, status) -- Only one active subscription per user
);

-- Usage tracking table (replaces the existing usage table concept)
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    allocated_minutes INTEGER NOT NULL DEFAULT 0,
    used_minutes INTEGER NOT NULL DEFAULT 0,
    remaining_minutes INTEGER NOT NULL DEFAULT 0,
    source VARCHAR(50), -- 'monthly_free', 'subscription', 'addon', 'manual'
    cycle_start TIMESTAMP WITH TIME ZONE,
    cycle_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage log for detailed tracking
CREATE TABLE IF NOT EXISTS usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id VARCHAR(255), -- YouTube video ID
    video_title VARCHAR(500),
    video_duration INTEGER, -- in seconds
    minutes_used INTEGER NOT NULL,
    processing_type VARCHAR(100), -- 'transcript', 'analysis', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add-ons/purchases table for one-time minute purchases
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    purchase_type VARCHAR(50) NOT NULL CHECK (purchase_type IN ('addon_minutes', 'plan_upgrade')),
    minutes_purchased INTEGER,
    amount_paid DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    razorpay_payment_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table for tracking all payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    purchase_id UUID REFERENCES purchases(id),
    razorpay_payment_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs for tracking notifications
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- 'subscription_started', 'payment_failed', etc.
    email_address VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    provider_id VARCHAR(255), -- Resend message ID
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION credit_free_minutes_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Credit 10 free minutes that expire at end of current month
    INSERT INTO user_usage (
    user_id,
    allocated_minutes,
    used_minutes,
    remaining_minutes,
    source,
    cycle_start,
    cycle_end
    ) VALUES (
        NEW.id,
        10,
        0,
    10,
    'monthly_free',
    DATE_TRUNC('month', NOW()),
    (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day')::timestamp + INTERVAL '23:59:59'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-credit free minutes for new users
DROP TRIGGER IF EXISTS trigger_credit_free_minutes ON auth.users;
CREATE TRIGGER trigger_credit_free_minutes
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION credit_free_minutes_for_new_user();

-- Function to update remaining minutes
CREATE OR REPLACE FUNCTION update_remaining_minutes()
RETURNS TRIGGER AS $$
BEGIN
    NEW.remaining_minutes := NEW.allocated_minutes - NEW.used_minutes;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update remaining minutes
DROP TRIGGER IF EXISTS trigger_update_remaining_minutes ON user_usage;
CREATE TRIGGER trigger_update_remaining_minutes
    BEFORE UPDATE ON user_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_remaining_minutes();

-- Function to grant monthly free minutes if not already granted for the current month
CREATE OR REPLACE FUNCTION grant_monthly_free_minutes_if_needed(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    already_granted INTEGER;
    start_month TIMESTAMP WITH TIME ZONE := DATE_TRUNC('month', NOW());
    end_month TIMESTAMP WITH TIME ZONE := (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day')::timestamp + INTERVAL '23:59:59';
BEGIN
    SELECT COUNT(*) INTO already_granted
    FROM user_usage
    WHERE user_id = p_user_id
      AND source = 'monthly_free'
      AND cycle_start >= start_month
      AND cycle_end <= end_month;

    IF already_granted = 0 THEN
        INSERT INTO user_usage (
            user_id, allocated_minutes, used_minutes, remaining_minutes, source, cycle_start, cycle_end
        ) VALUES (
            p_user_id, 10, 0, 10, 'monthly_free', start_month, end_month
        );
        RETURN TRUE;
    END IF;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current minutes balance
CREATE OR REPLACE FUNCTION get_user_minutes_balance(p_user_id UUID)
RETURNS TABLE(
    allocated INTEGER,
    used INTEGER,
    remaining INTEGER,
    cycle_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(uu.allocated_minutes), 0)::INTEGER as allocated,
        COALESCE(SUM(uu.used_minutes), 0)::INTEGER as used,
        COALESCE(SUM(uu.remaining_minutes), 0)::INTEGER as remaining,
        MAX(uu.cycle_end) as cycle_end
    FROM user_usage uu
    WHERE uu.user_id = p_user_id
    AND (
        uu.cycle_end IS NULL OR 
        uu.cycle_end >= NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct minutes from user balance
CREATE OR REPLACE FUNCTION deduct_user_minutes(
    p_user_id UUID,
    p_minutes INTEGER,
    p_video_id VARCHAR DEFAULT NULL,
    p_video_title VARCHAR DEFAULT NULL,
    p_video_duration INTEGER DEFAULT NULL,
    p_processing_type VARCHAR DEFAULT 'transcript'
)
RETURNS BOOLEAN AS $$
DECLARE
    current_remaining INTEGER;
    usage_record RECORD;
BEGIN
    -- Get current remaining minutes
    SELECT remaining INTO current_remaining
    FROM get_user_minutes_balance(p_user_id)
    LIMIT 1;
    
    -- Check if user has enough minutes
    IF current_remaining < p_minutes THEN
        RETURN FALSE;
    END IF;
    
    -- Log the usage
    INSERT INTO usage_log (
        user_id, 
        video_id, 
        video_title, 
        video_duration, 
        minutes_used, 
        processing_type
    ) VALUES (
        p_user_id, 
        p_video_id, 
        p_video_title, 
        p_video_duration, 
        p_minutes, 
        p_processing_type
    );
    
    -- Deduct from the oldest available usage record with remaining minutes
    FOR usage_record IN 
        SELECT * FROM user_usage 
        WHERE user_id = p_user_id 
        AND remaining_minutes > 0
        AND (cycle_end IS NULL OR cycle_end >= NOW())
        ORDER BY created_at ASC
    LOOP
        IF usage_record.remaining_minutes >= p_minutes THEN
            -- This record has enough minutes, deduct all from here
            UPDATE user_usage 
            SET used_minutes = used_minutes + p_minutes
            WHERE id = usage_record.id;
            EXIT;
        ELSE
            -- Use all remaining minutes from this record and continue
            p_minutes := p_minutes - usage_record.remaining_minutes;
            UPDATE user_usage 
            SET used_minutes = allocated_minutes
            WHERE id = usage_record.id;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_user_id ON usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own usage" ON user_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own usage log" ON usage_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own usage log" ON usage_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own purchases" ON purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own email logs" ON email_logs FOR SELECT USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON plans TO anon, authenticated;
GRANT SELECT ON subscriptions TO authenticated;
GRANT SELECT ON user_usage TO authenticated;
GRANT SELECT ON usage_log TO authenticated;
GRANT SELECT ON purchases TO authenticated;
GRANT SELECT ON payments TO authenticated;
GRANT SELECT ON email_logs TO authenticated;

-- Allow authenticated users to execute RPCs
GRANT EXECUTE ON FUNCTION grant_monthly_free_minutes_if_needed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_minutes_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_user_minutes(UUID, INTEGER, VARCHAR, VARCHAR, INTEGER, VARCHAR) TO authenticated;

-- RLS insert policies so users can create their own rows where needed
CREATE POLICY "Users can create their own subscriptions" ON subscriptions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage buckets" ON user_usage
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage buckets" ON user_usage
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" ON purchases
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON payments
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
