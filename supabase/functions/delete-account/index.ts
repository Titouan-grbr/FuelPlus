// Supabase Edge Function: deploy with JWT verification enabled (default).
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': 'https://fuelplus.pages.dev',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
Deno.serve(async (req) => {
  if(req.method==='OPTIONS') return new Response(null,{status:204,headers:cors});
  if(req.method!=='POST') return reply({error:'Méthode non autorisée'},405);
  if(req.headers.get('origin') && req.headers.get('origin')!=='https://fuelplus.pages.dev') return reply({error:'Origine interdite'},403);
  try {
    const body=await req.json();
    if(body?.confirmation!=='SUPPRIMER') return reply({error:'Confirmation requise'},400);
    const jwt=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
    if(!jwt) return reply({error:'Connexion requise'},401);
    const url=Deno.env.get('SUPABASE_URL');
    const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if(!url||!serviceKey) return reply({error:'Configuration serveur manquante'},500);
    const admin=createClient(url,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
    const {data:{user},error:authError}=await admin.auth.getUser(jwt);
    if(authError||!user) return reply({error:'Session invalide'},401);
    // Foreign keys ON DELETE CASCADE erase profiles, vehicles, fills and favorites.
    const {error}=await admin.auth.admin.deleteUser(user.id);
    if(error) return reply({error:'Suppression impossible'},500);
    return reply({ok:true});
  }catch{return reply({error:'Requête invalide'},400)}
});
