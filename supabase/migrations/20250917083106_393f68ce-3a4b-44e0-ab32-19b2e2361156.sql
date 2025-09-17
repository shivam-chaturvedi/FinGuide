-- Insert user profile directly (ignoring foreign key temporarily)
INSERT INTO public.user_profiles (user_id, full_name, phone, country, occupation, created_at, updated_at)
VALUES (
    'ee875b9b-15dd-4d7c-a2c7-8b372466d252',
    'shivam chaturvedi',
    '08076432763',
    'Singapore',
    'Migrant Worker',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO NOTHING;