-- Clean up phone numbers in customers table by removing non-digit/non-plus characters
UPDATE customers
SET phone_number = REGEXP_REPLACE(phone_number, '[^\d+]', '', 'g')
WHERE phone_number ~ '[^\d+]';

-- Optional: ensure all start with +39 if 10 digits and no prefix?
-- Only if you are sure all customers are Italian!
-- UPDATE customers SET phone_number = '+39' || phone_number WHERE phone_number ~ '^\d{10}$';
