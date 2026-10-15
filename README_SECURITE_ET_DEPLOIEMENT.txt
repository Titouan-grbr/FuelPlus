FUEL+ — VERSION RENFORCÉE POUR GITHUB / CLOUDFLARE PAGES

CONTENU À METTRE À LA RACINE DU DÉPÔT :
index.html
sw.js
icon.svg
manifest.webmanifest
_headers
instantane/PrixCarburants_instantane.xml

1. Sur GitHub, ouvre ton dépôt FuelPlus.
2. Remplace les anciens fichiers à la racine par ceux du ZIP.
3. Ajoute aussi _headers (IMPORTANT : nom avec underscore).
4. Ajoute ou remplace le dossier instantane et son fichier XML.
5. Commit changes, puis attends le déploiement Cloudflare Pages.
6. Ouvre https://fuelplus.pages.dev, recharge avec Ctrl+F5 et teste les onglets.
7. Teste la carte, les itinéraires, la géolocalisation (seulement après clic) et les favoris.
8. Active la double authentification sur GitHub et Cloudflare.

MESURES INCLUSES :
- En-têtes de sécurité Cloudflare Pages (_headers), dont CSP restrictive avec hash du script inline.
- Restrictions sur les scripts et connexions externes autorisés.
- Intégrité SRI pour Leaflet 1.9.4 (JS et CSS).
- Protection contre l'ouverture du site dans une iframe (clickjacking).
- Protection MIME sniffing, HTTPS strict, politique de permissions et referrer.
- Cache du service worker nettoyé lors des mises à jour.
- Export CSV : protection des cellules commençant par des caractères de formule.
- Liens de partage malformés gérés sans exception.

IMPORTANT :
- Cette version N'A PAS de vrais comptes utilisateurs et ne protège pas un backend inexistant.
- Le profil, garage, favoris et autres données sont enregistrés dans le navigateur local.
- Ne stocke pas de secrets/API keys privées dans le dépôt.
- Ne collecte pas encore de données personnelles réelles d'utilisateurs.
- Supabase Auth demandera des règles RLS par utilisateur, un backend correctement configuré et des tests spécifiques.
- Les librairies externes Leaflet.heat et Chart.js restent chargées depuis CDN sans SRI : envisager de les héberger localement.
- Ce renforcement réduit des risques, il ne constitue pas une certification ni un pentest.
- Si les scripts ne chargent pas, inspecter la console navigateur et la CSP avant d'assouplir les restrictions.
