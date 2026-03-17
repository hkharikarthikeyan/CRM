-- Create attendance_corrections table
CREATE TABLE IF NOT EXISTS attendance_corrections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    original_clock_in VARCHAR(20),
    original_clock_out VARCHAR(20),
    requested_clock_in VARCHAR(20) NOT NULL,
    requested_clock_out VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    requested_on TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE attendance_corrections ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations" ON attendance_corrections FOR ALL USING (true);
