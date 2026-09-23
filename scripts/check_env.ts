import dotenv from 'dotenv';
dotenv.config();

console.log('ENV KEYS:', Object.keys(process.env).filter(k => k.includes('URL') || k.includes('SUPABASE') || k.includes('DB')));
