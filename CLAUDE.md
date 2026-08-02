# Predictek - Contexte projet pour Claude (Cowork / Claude Code)

## Vue d'ensemble
SaaS de gestion de copropriete quebecoise (syndicats de copropriete).
- **Stack**: React (CRA), deploye sur Vercel (auto-deploy au push sur main), Supabase (BD), API Anthropic pour extraction de documents.
- **Production**: https://predictek-d9sy.vercel.app
- **Repo**: github.com/JFpredictek/predictek
- **Langue**: interface en francais quebecois, SANS accents dans le code JSX (voir Pieges).

## Architecture des fichiers
- `src/Hub.jsx` (~2440 lignes) : COEUR de l'app. Contient CreerSyndicat, Onboarding (5 etapes), la liste des syndicats, et le composant Hub principal (export default).
- `src/App.jsx` (~200 lignes) : navigation 3 sections (Predictek / Conseil d'administration / Portail Coproprietaire), mapping module id -> composant. Un module sans `{active==="id"&&<Comp/>}` = page vide au clic.
- `src/HubDashboard.jsx` : accueil avec raccourcis (dont "Ajouter un syndicat" -> nav "onboarding").
- `api/extract.js` : endpoint Vercel serverless. Modes: "syndicat" (texte OU pdf base64) et "quoteparts" (pdf + unites[]). Utilise claude-haiku-4-5-20251001 avec blocs document base64 (lit les PDF scannes). Cle ANTHROPIC_API_KEY dans env Vercel.
- `api/nas.js` : chiffrement NAS AES-256-GCM + validation Luhn. Actions: encrypt, verify (jamais de dechiffrement complet vers le client). Requiert NAS_SECRET_KEY (64 hex) dans env Vercel.

## Onboarding - 5 etapes (structure critique)
1. **Syndicat** : zone texte REQ + upload PDF REQ (envoye en base64 a /api/extract, Claude vision lit les scans) + upload declaration de copropriete (stockee dans window._acteFile + window._acteB64, reutilisee a l'etape 3). Code client auto-genere: 1er mot significatif du nom + no civique (ex: Piedmont531), bouton "Auto".
2. **CA** : administrateurs (extraits du REQ par l'IA).
3. **Coproprietaires** : import Excel/CSV via handleCSV -> parseCSV. Validation croisee des quote-parts avec la declaration (bouton, mode "quoteparts", tolerance 0.002, tableau des ecarts). Tableau 28 colonnes avec scroll horizontal.
4. **Documents** : la declaration affiche un badge "Fournie a l etape 1" (viaEtape1).
5. **Confirmation** : resume + bouton "Activer le syndicat".

## Pieges connus (IMPORTANT - source de bugs recurrents)
- **2 copies de parseCSV et handleCSV** : une dans CreerSyndicat (~L230), une dans Onboarding (~L947). TOUTE modification doit etre faite aux DEUX endroits.
- **Zero caractere >127 dans le code** : un nettoyage ASCII agressif a deja mutile des accents. Les textes UI sont en francais sans accents. Ne pas reintroduire d'accents.
- **JSX**: jamais de booleen rendu directement `{c.estCA}` -> toujours `{c.estCA?"Oui":"Non"}`. Dans copros.map(function(c,i){...}), utiliser `c`, jamais `copros[i]`.
- **Excel quebecois**: virgules decimales. sheet_to_csv DOIT utiliser `{FS:"\t"}` (TSV) sinon les cellules quotees decalent les colonnes.
- **parseCSV**: headers normalises NFD (accents retires, apostrophes -> espaces). Fractions: virgule->point, % et $ retires, detection proportions (somme<=1.5 -> x100, valeurs>=0.9 exclues), toFixed(3). Lignes "Total" et unites vides ignorees.
- **Etat React**: verifier que toute constante referencee dans un useState initial existe (crash COMPOSANTES_LOI16 = 3 sessions de debug).

## Etat actuel / TODO
- [ ] Audit RLS Supabase (projet yzbauupamxbwcnnuiunf possiblement EN PAUSE - aucune persistance actuellement, tout est en state local)
- [ ] Ajouter NAS_SECRET_KEY dans env Vercel (cle generee, voir gestionnaire de mots de passe du proprietaire)
- [ ] Connecter le champ NAS du formulaire admins (etape 2) a /api/nas action encrypt
- [ ] Champs urgence (urgNom/urgLien/urgTel) affiches dans le tableau mais non editables individuellement
- [ ] Tester la validation croisee quote-parts avec la vraie declaration du client
- [ ] Loi 25: politique de confidentialite, responsable protection des renseignements, registre incidents
- [ ] Revoquer le token GitHub "predictek-deploy" apres stabilisation et supprimer les vieux fichiers HTML de fix

## Commandes
```bash
npm install          # premiere fois
npm start             # dev local (http://localhost:3000)
npm run build        # DOIT passer avant tout push (c'est ce que Vercel execute)
git add -A && git commit -m "..." && git push   # deploie automatiquement en production
```

## Conventions de travail
- Root-cause d'abord: isoler l'erreur exacte (console navigateur), corriger minimalement, valider le build localement, puis push.
- Commits atomiques avec messages FIX/FEAT descriptifs en francais.
- Toujours tester le parcours onboarding complet apres modification de Hub.jsx.
