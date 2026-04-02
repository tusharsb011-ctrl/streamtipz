// Quick test to check if 'username' column exists in Supabase profiles table
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pefbtibpovosunxkramv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZmJ0aWJwb3Zvc3VueGtyYW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODIxMDksImV4cCI6MjA4Nzk1ODEwOX0.sJcrHs1T4tpBIYIh1tpWv_t02eg9SU027p0Go6fbnwg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    // Test 1: Try to select all profiles
    console.log('--- Test 1: Query all profiles ---');
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);
    
    if (profileError) {
        console.error('Profile query error:', profileError.message);
    } else {
        console.log('Profiles found:', profiles?.length);
        if (profiles && profiles.length > 0) {
            console.log('Columns:', Object.keys(profiles[0]));
            console.log('Profiles:', JSON.stringify(profiles, null, 2));
        } else {
            console.log('No profiles in table');
        }
    }

    // Test 2: Try querying by username specifically
    console.log('\n--- Test 2: Query for tusharsb04 by username ---');
    const { data: tushar, error: tusharError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', 'tusharsb04')
        .single();
    
    if (tusharError) {
        console.error('Username query error:', JSON.stringify(tusharError));
    } else {
        console.log('Found:', tushar);
    }
}

test().catch(console.error);
