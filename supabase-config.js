const supabaseUrl = 'https://obgeqqlfozftgjcfhguh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZ2VxcWxmb3pmdGdqY2ZoZ3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MDkwNjMsImV4cCI6MjA5ODk4NTA2M30.Aw6GfUANI_P5yRRHuCWEsrhIpC2d2xBvKbcJ8duhdJo';

if (window.supabase) {
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
} else {
    console.error("Supabase CDN not loaded.");
}
