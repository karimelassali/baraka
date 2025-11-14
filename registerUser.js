const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'your_supabase_url';
const supabaseKey = 'your_supabase_anon_key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function registerUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'password',
  });
  if (error) {
    console.error('Error registering user:', error);
  } else {
    console.log('User registered successfully:', data);
  }
}

registerUser();
