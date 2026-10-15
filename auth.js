/* Fuel+ account integration: public anon/publishable key only. */
(()=>{
'use strict';
const URL='https://ucjhanjsmlzanawidtcd.supabase.co';
const KEY='sb_publishable_WWZyEAAvrllhAfvvpkEjCA_yXbakKQU';
const sb=window.supabase?.createClient(URL,KEY,{auth:{detectSessionInUrl:true,autoRefreshToken:true,persistSession:true}});
const keys=['fp-vehicles','fp-fills','fr-favorites','fp-profile-v1','fp-appearance-v1','fr-alerts'];
const $=id=>document.getElementById(id);
let user=null, syncing=false, timer=null, lastSaved='', currentAccount=null;
const msg=(s)=>{$('fp-auth-status').textContent=s};
function readLocal(){const result={};for(const k of keys){try{result[k]=JSON.parse(localStorage.getItem(k))}catch{result[k]=null}}return result}
function applyLocal(data){syncing=true;for(const k of keys){if(Object.hasOwn(data,k)&&data[k]!==null)localStorage.setItem(k,JSON.stringify(data[k]));else localStorage.removeItem(k)};try{
 favorites=Array.isArray(data['fr-favorites'])?data['fr-favorites']:[];
 vehicles=Array.isArray(data['fp-vehicles'])?data['fp-vehicles']:[];
 fills=Array.isArray(data['fp-fills'])?data['fp-fills']:[];
 alerts=Array.isArray(data['fr-alerts'])?data['fr-alerts']:[];
 const profile=data['fp-profile-v1']||{};for(const k of ['personal','prefs','habits'])profileData[k]=profile[k]||{};
 if(typeof fillProfileInputs==='function')fillProfileInputs();
 if(typeof refreshProfileHeader==='function')refreshProfileHeader();
 if(typeof drawVehicles==='function')drawVehicles();if(typeof drawFills==='function')drawFills();
 if(typeof render==='function')render();
 }catch(e){console.warn('Refresh Fuel+',e)}syncing=false}
function localHasData(data){return keys.some(k=>{const x=data[k];return Array.isArray(x)?x.length>0:x&&typeof x==='object'&&Object.keys(x).length>0})}
async function push(){if(!user||syncing)return;const snapshot=readLocal(),serialized=JSON.stringify(snapshot);if(serialized===lastSaved)return;const {error}=await sb.from('profiles').upsert({user_id:user.id,preferences:{snapshot,updated_at:new Date().toISOString()}},{onConflict:'user_id'});if(error){msg('Synchronisation impossible : '+error.message);return}lastSaved=serialized;msg('Données synchronisées ✓')}
function queue(){if(!user||syncing)return;clearTimeout(timer);timer=setTimeout(()=>push().catch(e=>msg(e.message)),1100)}
async function setupSession(session){const previous=currentAccount;user=session?.user||null;currentAccount=user?.id||null;$('fp-auth-email').textContent=user?.email||'Mode invité';$('fp-auth-logged').hidden=!user;$('fp-auth-login').hidden=!!user;$('fp-delete-area').hidden=!user;
 if(!user){if(previous){applyLocal({});lastSaved='';}return}
 msg('Connexion établie. Chargement des données…');
 const {data,error}=await sb.from('profiles').select('preferences').eq('user_id',user.id).maybeSingle();if(error){msg('Lecture du compte impossible : '+error.message);return}
 const remote=data?.preferences?.snapshot;
 const local=readLocal();
 if(remote){
   if(previous!==user.id&&localHasData(local)&&JSON.stringify(local)!==JSON.stringify(remote)){
     if(confirm('Des données existent sur cet appareil et dans ton compte. OK : conserver les données du compte (elles remplaceront les données locales). Annuler : garder les données de cet appareil et les envoyer sur ton compte.')){applyLocal(remote);lastSaved=JSON.stringify(readLocal())}else{lastSaved='';await push()}
   }else{applyLocal(remote);lastSaved=JSON.stringify(readLocal())}
 }else{lastSaved='';await push()}
 msg('Connecté · Synchronisation activée ✓');
}
function show(open=true){$('fp-auth-overlay').hidden=!open; if(open){msg('');$('fp-auth-email-input').focus()}}
function consent(){if(!$('fp-terms-check').checked){msg('Accepte les conditions d’utilisation et la politique de confidentialité pour créer un compte.');return false}return true}
async function run(label,fn){msg('Veuillez patienter…');try{const {data,error}=await fn();if(error)throw error;msg(label);return data}catch(e){msg(e.message||'Erreur de connexion');return null}}
if(!sb){console.error('Supabase client unavailable');return}
$('fp-open-auth').onclick=()=>show(true);
$('fp-close-auth').onclick=()=>{show(false);localStorage.setItem('fp-welcome-seen','1')};
$('fp-guest').onclick=()=>{localStorage.setItem('fp-welcome-seen','1');show(false)};
$('fp-auth-login-form').onsubmit=async e=>{e.preventDefault();const email=$('fp-auth-email-input').value.trim(),password=$('fp-auth-password').value;await run('Connexion en cours…',()=>sb.auth.signInWithPassword({email,password}))};
$('fp-signup').onclick=async()=>{if(!consent())return;const email=$('fp-auth-email-input').value.trim(),password=$('fp-auth-password').value;if(!email||password.length<8){msg('Indique un e-mail et un mot de passe d’au moins 8 caractères.');return}const data=await run('Compte créé. Vérifie ta boîte e-mail pour confirmer ton adresse.',()=>sb.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}}));if(data?.session)show(false)};
$('fp-google').onclick=async()=>{if(!consent())return;localStorage.setItem('fp-terms-accepted-at',new Date().toISOString());await run('Redirection vers Google…',()=>sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}}))};
$('fp-reset').onclick=async()=>{const email=$('fp-auth-email-input').value.trim();if(!email){msg('Indique ton adresse e-mail.');return}await run('Si ce compte existe, un e-mail de réinitialisation sera envoyé.',()=>sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname}))};
$('fp-logout').onclick=async()=>{clearTimeout(timer);await push();const {error}=await sb.auth.signOut();if(error)msg(error.message);else{applyLocal({});localStorage.setItem('fp-welcome-seen','1');msg('Déconnecté. Les données du compte ont été retirées de cet appareil.')}};
$('fp-export').onclick=async()=>{
  msg('Préparation de l’export…');
  let snapshot=readLocal();
  if(user){
    const {data,error}=await sb.from('profiles').select('preferences').eq('user_id',user.id).maybeSingle();
    if(error){msg('Export impossible : '+error.message);return}
    snapshot=data?.preferences?.snapshot||snapshot;
  }
  const payload={exported_at:new Date().toISOString(),account_id:user?.id||null,source:user?'supabase':'appareil',data:snapshot};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const href=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=href;link.download='fuelplus-mes-donnees.json';document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(href),3000);msg('Export téléchargé.');
};
$('fp-delete-account').onclick=async()=>{
  if(!user){msg('Connecte-toi pour supprimer ton compte.');return}
  if(!confirm('Supprimer définitivement ton compte Fuel+ et ses données synchronisées ? Cette action est irréversible.'))return;
  const typed=prompt('Pour confirmer, écris SUPPRIMER en majuscules :');
  if(typed!=='SUPPRIMER'){msg('Suppression annulée.');return}
  const {data:sessionData,error:sessionError}=await sb.auth.getSession();
  const token=sessionData?.session?.access_token;
  if(sessionError||!token){msg('Session expirée. Reconnecte-toi.');return}
  msg('Suppression en cours…');
  try{
    const response=await fetch(URL+'/functions/v1/delete-account',{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,'apikey':KEY},
      body:JSON.stringify({confirmation:'SUPPRIMER'})
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||'Erreur '+response.status+'. Vérifie le déploiement de la fonction Supabase.');
    clearTimeout(timer);user=null;currentAccount=null;lastSaved='';
    await sb.auth.signOut({scope:'local'}).catch(()=>{});
    applyLocal({});
    $('fp-auth-email').textContent='Mode invité';$('fp-auth-logged').hidden=true;
    $('fp-auth-login').hidden=false;$('fp-delete-area').hidden=true;
    localStorage.setItem('fp-welcome-seen','1');msg('Compte supprimé et données locales effacées.');
  }catch(e){msg('Suppression non effectuée : '+e.message)}
};
window.addEventListener('fp-data-change',queue);
window.addEventListener('focus',()=>{if(user&&!syncing)queue()});
window.addEventListener('beforeunload',()=>{if(user)queue()});
sb.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY'){show(true);$('fp-password-change').hidden=false;msg('Choisis un nouveau mot de passe.');return}if(['INITIAL_SESSION','SIGNED_IN','SIGNED_OUT'].includes(event))setTimeout(()=>setupSession(session).then(()=>{if(session?.user)show(false)}).catch(e=>msg(e.message)),0)});
$('fp-password-change').onclick=async()=>{const password=$('fp-auth-password').value;if(password.length<8){msg('Mot de passe : au moins 8 caractères.');return}await run('Mot de passe mis à jour.',()=>sb.auth.updateUser({password}));$('fp-password-change').hidden=true};
if(!localStorage.getItem('fp-welcome-seen'))show(true);
})();
