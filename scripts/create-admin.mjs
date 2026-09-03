import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyrwzaapdhjljaxnuzek.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5cnd6YWFwZGhqbGpheG51emVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI4MjcyNiwiZXhwIjoyMTAzODU4NzI2fQ.iPNNCJI8rm1barBJd_sDh5VJFOla0Lk6ku3zHHpdoqA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  const adminEmail = 'admin@drdslr.com';
  const adminPassword = 'SecureAdminPass123!@#';
  const adminName = 'Himal Shrestha';

  try {
    // Create auth user
    const { data: user, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error('❌ Error creating user:', authError.message);
      return;
    }

    console.log('✅ User created:', user.user.id);

    // Create admin_profile record
    const { error: profileError } = await supabase
      .from('admin_profile')
      .insert({
        id: user.user.id,
        display_name: adminName,
      });

    if (profileError) {
      console.error('❌ Error creating admin profile:', profileError.message);
      return;
    }

    console.log('\n✅ Admin user created successfully!\n');
    console.log('📧 Email:', adminEmail);
    console.log('🔐 Password:', adminPassword);
    console.log('👤 Display Name:', adminName);
    console.log('\n🔗 Login at: http://localhost:3000/admin/login');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createAdminUser();
