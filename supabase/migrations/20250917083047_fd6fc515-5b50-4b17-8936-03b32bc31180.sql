-- Create user profile for existing user if it doesn't exist
INSERT INTO public.user_profiles (user_id, full_name, phone, country, occupation)
SELECT 
    'ee875b9b-15dd-4d7c-a2c7-8b372466d252',
    'shivam chaturvedi',
    '08076432763',
    'Singapore',
    'Migrant Worker'
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = 'ee875b9b-15dd-4d7c-a2c7-8b372466d252'
);