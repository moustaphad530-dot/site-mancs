# Site de l'équipe de recherche

Site statique (HTML/CSS/JS, aucun framework) avec 6 pages : Accueil, Équipe,
Publications, Projets, Actualités, Contact. Le contenu (membres, publications,
projets, actualités) est stocké dans des fichiers JSON simples dans `content/`,
séparés du code, pour que les mises à jour n'exigent jamais de toucher au HTML.

## Personnaliser avant de publier

1. Remplacez `Mathématiques Fondamentales et Applications` par le vrai nom, dans les 6 fichiers `.html`
   (balise `<title>` et `.brand .name`).
2. Remplacez `contact@mfa.univ-exemple.fr` et l'adresse postale (fichiers `.html`,
   section footer et `contact.html`).
3. Éditez le contenu dans `content/team.json`, `content/publications.json`,
   `content/projects.json`, `content/posts.json` (voir format ci-dessous).
4. Optionnel : ajoutez un logo dans `images/` et remplacez le texte `.brand`
   par une balise `<img>`.

## Modifier le contenu à la main

Chaque fichier dans `content/` a la forme `{ "entries": [ {...}, {...} ] }`.
Copiez un objet existant, changez ses valeurs, gardez un `id` unique par
entrée. Exemple pour ajouter une actualité dans `content/posts.json` :

```json
{
  "id": "post-2026-09",
  "date": "2026-09-01",
  "title": "Titre de l'annonce",
  "excerpt": "Une ou deux phrases résumant l'annonce.",
  "body": "Texte complet, plus détaillé.",
  "author": "Nom Prénom"
}
```

Aucune étape de build n'est nécessaire : rechargez la page, le changement
apparaît.

## Édition sans code (recommandé pour l'équipe)

Le dossier `admin/` contient un éditeur visuel (Decap CMS, gratuit et
open-source) : un formulaire web où n'importe quel membre de l'équipe peut
ajouter une publication ou une actualité sans toucher au JSON. Pour l'activer
(nécessite l'hébergement Netlify recommandé ci-dessous) :

1. Déployez le site sur Netlify (voir plus bas).
2. Dans le tableau de bord Netlify du site : **Site configuration → Identity
   → Enable Identity**.
3. Toujours dans Identity : **Services → Git Gateway → Enable Git Gateway**.
4. Dans `admin/config.yml`, remplacez la ligne `branch: main` si votre
   branche s'appelle différemment.
5. Invitez vos collègues : **Identity → Invite users**, avec leur e-mail.
6. Chacun peut alors se rendre sur `https://votre-site.netlify.app/admin/`,
   se connecter, et éditer le contenu via des formulaires — les changements
   sont enregistrés automatiquement dans le dépôt Git et le site se
   redéploie tout seul.

Sans cette étape, le site fonctionne très bien : seule l'édition par
formulaire web nécessite Netlify Identity.

## Où héberger

Le site est 100% statique (pas de base de données, pas de serveur backend),
ce qui ouvre plusieurs options simples et gratuites :

| Option | Coût | Bon pour | Limite |
|---|---|---|---|
| **Netlify** *(recommandé)* | Gratuit | Déploiement en un clic, formulaire de contact intégré (`data-netlify="true"`, déjà en place dans `contact.html`), éditeur sans code via Decap CMS | Aucune vraiment, pour ce cas d'usage |
| **Vercel** | Gratuit | Équivalent de Netlify, très bon pour l'hébergement statique | Pas de formulaire intégré ; pas de Git Gateway pour Decap CMS |
| **GitHub Pages** | Gratuit | Simple si le code est déjà sur GitHub | Pas de formulaire ni d'éditeur sans code intégrés ; domaine personnalisé un peu moins direct |
| **Hébergement de votre université/institut** | Souvent gratuit pour vous | Cohérent avec le nom de domaine de l'institution (ex. `labo.univ-exemple.fr`), parfois requis par les chartes internes | Demande de contacter le service informatique ; mises à jour parfois plus lentes (FTP/SSH) |

**Recommandation** : commencez par Netlify. C'est gratuit, ça prend cinq
minutes, ça inclut le formulaire de contact fonctionnel et l'éditeur sans
code — ce qui correspond directement à votre besoin de mise à jour fréquente
par des non-développeurs. Vous pourrez brancher un nom de domaine personnalisé
(ex. `labo-recherche.fr` ou un sous-domaine de votre université) sur Netlify
sans rien changer au site.

### Déployer sur Netlify (glisser-déposer, sans Git)

1. Allez sur [app.netlify.com](https://app.netlify.com) et créez un compte.
2. Sur la page d'accueil du tableau de bord, glissez-déposez le dossier
   complet du site dans la zone prévue ("Deploy manually").
3. Le site est en ligne en quelques secondes, avec une adresse du type
   `nom-aleatoire.netlify.app`. Vous pouvez la renommer dans les réglages.

Cette méthode fonctionne mais chaque futur changement de fichier devra être
re-déposé à la main. Pour des mises à jour fréquentes, préférez la méthode
Git ci-dessous : elle permet aussi l'éditeur sans code (Decap CMS).

### Déployer sur Netlify via Git (recommandé si vous voulez l'éditeur sans code)

1. Créez un dépôt sur [github.com](https://github.com) et poussez-y ce
   dossier.
2. Sur Netlify : **Add new site → Import an existing project**, connectez
   votre compte GitHub et choisissez le dépôt.
3. Laissez les réglages de build vides (site 100% statique, pas de build).
4. Déployez, puis suivez la section "Édition sans code" ci-dessus pour
   activer l'éditeur.

## Aperçu local

Comme le site charge le contenu via `fetch()`, ouvrir directement les
fichiers `.html` dans le navigateur (`file://…`) peut être bloqué par le
navigateur. Lancez un petit serveur local depuis ce dossier :

```bash
python3 -m http.server 8000
```

puis ouvrez `http://localhost:8000`.

## Structure du projet

```
index.html            page d'accueil
equipe.html            page équipe
publications.html       page publications
projets.html            page projets
actualites.html         page actualités / blog
contact.html            page contact + formulaire
css/style.css           tous les styles
js/main.js              affichage dynamique du contenu JSON
content/*.json          contenu éditable (équipe, pubs, projets, actus)
admin/                  éditeur sans code (Decap CMS)
```
