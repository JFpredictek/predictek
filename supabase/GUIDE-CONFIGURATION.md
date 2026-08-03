# Guide de configuration Supabase - Securisation Predictek

A faire une seule fois sur supabase.com (projet yzbauupamxbwcnnuiunf).
Duree estimee : 10 minutes.

## Etape 0 - Verifier que le projet est actif

1. Connecte-toi a https://supabase.com/dashboard
2. Ouvre le projet Predictek. S'il affiche "Paused", clique "Restore project"
   et attends 1-2 minutes.

## Etape 1 - Creer le compte administrateur (VRAI compte, mot de passe verifie)

1. Menu de gauche : **Authentication** > **Users**
2. Bouton **Add user** > **Create new user**
3. Email : admin@predictek.ca (ou ton courriel personnel)
4. Password : choisis un mot de passe FORT et NOUVEAU
   (PAS Admin2025! - il est public, il etait affiche sur le site)
5. Coche **Auto Confirm User** puis cree l'utilisateur.
6. Clique sur l'utilisateur cree > section **User Metadata** > edite et colle :
   {"nom": "Administrateur", "role": "admin"}
   puis sauvegarde. (L'app lit nom et role dans ces metadonnees.)

Repete pour chaque personne qui doit avoir acces (gestionnaires, etc.).

## Etape 2 - Activer la securite RLS sur les tables

1. Menu de gauche : **SQL Editor** > **New query**
2. Ouvre le fichier `supabase/securite-rls.sql` du projet, colle tout son
   contenu, clique **Run**.
3. Le tableau de verification a la fin doit montrer rowsecurity = true
   pour toutes les tables.

## Etape 3 - Tester

1. Sur http://localhost:3000 (ou le site en production apres deploiement) :
   - L'ecran de connexion n'affiche PLUS d'identifiants.
   - Connexion avec le compte cree a l'etape 1 : fonctionne.
   - Connexion avec un mauvais mot de passe : refusee.
2. Les anciens comptes demo (admin@predictek.ca / Admin2025! code en dur)
   n'existent plus dans le code.

## Ce que ca change concretement

- Connexion : le mot de passe est maintenant VERIFIE par Supabase Auth
  (avant : n'importe quel mot de passe passait pour un courriel existant,
  et les identifiants admin etaient affiches sur l'ecran public).
- Base de donnees : sans session valide, la cle publique ne permet plus
  de lire ni d'ecrire quoi que ce soit (avant : base entierement ouverte
  si RLS inactif).
- API /api/extract et /api/nas : refusent les appels sans session valide
  (avant : ouvertes a tout Internet, y compris ta cle Anthropic).
- Session : duree 1 h, rafraichie automatiquement au chargement de l'app.
- Mot de passe oublie : envoie maintenant un vrai courriel de
  reinitialisation via Supabase.

## Prochaines etapes prevues (phase 2)

- Politiques RLS par role et par syndicat (un gestionnaire ne voit que
  ses syndicats; un coproprietaire ne voit que son unite).
- Creation de comptes depuis l'app (module Utilisateurs) via une API
  serveur au lieu du tableau de bord Supabase.
- Persistance complete de l'onboarding (actuellement en memoire locale).
