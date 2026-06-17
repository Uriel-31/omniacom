# Guide d'approche d'un projet Next.js

Ce guide est une feuille de route pour aborder sereinement le developpement d'une application Next.js comme OmniaCom. Il repond aux questions que toute developpeuse ou developpeur se pose en debut de projet.

---

## Sommaire

1. [Comprendre le projet](#1-comprendre-le-projet)
2. [Decouvrir la stack technique](#2-decouvrir-la-stack-technique)
3. [Explorer l'arborescence](#3-explorer-larborescence)
4. [Lancer le projet](#4-lancer-le-projet)
5. [Creer une page](#5-creer-une-page)
6. [Utiliser les composants shadcn/ui](#6-utiliser-les-composants-shadcnui)
7. [Faire un appel API](#7-faire-un-appel-api)
8. [Bonnes pratiques](#8-bonnes-pratiques)

---

## 1. Comprendre le projet

OmniaCom est un projet Next.js 16. Il sert de base pour construire une application web moderne. Tout ce qui est necessaire au developpement est deja en place. Vous n'avez qu'a ajouter les fonctionnalites.

### Principes

- **Composants prêts a l'emploi** : shadcn/ui fournit des dizaines de composants accessibles et stylises. Pas besoin de recrerer un bouton, un formulaire ou une boite de dialogue.
- **Structure claire** : l'App Router de Next.js organise le projet par dossiers. Chaque dossier est une route.
- **Typage fort** : TypeScript est configure et strict. Il vous aide a eviter les erreurs.
- **Styles semantiques** : Tailwind CSS utilise des couleurs semantiques (`bg-primary`, `text-muted-foreground`). Pas de valeurs brutes.

---

## 2. Decouvrir la stack technique

| Technologie         | A quoi ca sert                                      |
| ------------------- | --------------------------------------------------- |
| **Next.js 16**      | Framework React avec App Router, Server Components  |
| **TypeScript**      | Typage pour ecrire du code plus sur                 |
| **Tailwind CSS 4**  | Ecrire les styles directement dans le JSX           |
| **shadcn/ui**       | 55+ composants UI prets a l'emploi                  |
| **Axios**           | Bibliotheque HTTP pour appeler des API              |
| **Lucide React**    | Bibliotheque d'icones                               |
| **Sonner**          | Notifications toast ("Votre action a reussi")       |

### Faut-il tout connaitre ?

Non. Commencez par savoir que ces outils existent et lisez leur documentation au besoin.
- shadcn/ui : [ui.shadcn.com/docs](https://ui.shadcn.com/docs)
- Tailwind CSS : [tailwindcss.com/docs](https://tailwindcss.com/docs)
- Next.js (documentation officielle) : [nextjs.org/docs](https://nextjs.org/docs)

---

## 3. Explorer l'arborescence

```
omniacom/
├── app/                        # Les pages et routes de l'application
│   ├── layout.tsx              #   Layout principal (s'affiche sur toutes les pages)
│   ├── page.tsx                #   Page d'accueil (http://localhost:3000)
│   └── globals.css             #   Styles globaux et couleurs du theme
├── components/
│   └── ui/                     # Composants shadcn/ui (55 fichiers)
├── hooks/                      # Hooks React personnalises
├── lib/
│   ├── utils.ts                # Fonction cn() pour fusionner des classes CSS
│   └── axios.ts                # Configuration Axios (URL de l'API, timeout)
├── .env.example                # Modele pour les variables d'environnement
└── README.md                   # Ce guide
```

### A retenir

- `app/` contient TOUTES les pages. Un dossier = une route.
- `components/ui/` contient les composants shadcn. Ne pas modifier.
- `lib/` contient la logique partagee (configuration Axios, fonctions utiles).

---

## 4. Lancer le projet

```bash
# 1. Installer les dependances (une seule fois)
npm install

# 2. Copier le fichier d'environnement
cp .env.example .env.local

# 3. Editer .env.local avec l'URL de votre API
#    Exemple : NEXT_PUBLIC_API_URL=http://localhost:8000/api

# 4. Lancer le serveur de developpement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). La page d'accueil s'affiche.  
Modifiez `app/page.tsx` pour voir les changements en temps reel.

---

## 5. Creer une page

### Principe

Dans Next.js (App Router), chaque dossier dans `app/` represente une route.  
Un fichier `page.tsx` dans ce dossier definit le contenu de la page.

### Exemple : creer une page "a-propos"

```bash
# 1. Creer le dossier
mkdir -p app/a-propos

# 2. Ajouter le fichier page.tsx
```

```tsx
// app/a-propos/page.tsx
export default function APropos() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-3xl font-bold">A propos</h1>
      <p className="text-muted-foreground">
        Cette page a ete creee en 30 secondes.
      </p>
    </div>
  );
}
```

Rendez-vous sur `http://localhost:3000/a-propos`.

### Routes dynamiques

Si vous voulez une page qui depend d'un parametre (ex: un article, un profil) :

```bash
mkdir -p app/articles/[slug]
```

```tsx
// app/articles/[slug]/page.tsx
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>Article : {slug}</h1>;
}
```

---

## 6. Utiliser les composants shadcn/ui

Tous les composants sont deja installes. Il suffit de les importer.

### Un bouton

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default">Cliquez-moi</Button>
<Button variant="outline">Annuler</Button>
<Button variant="destructive">Supprimer</Button>
<Button variant="ghost">Plus d'infos</Button>
```

Variants disponibles : `default` | `secondary` | `outline` | `ghost` | `destructive`

### Un champ de formulaire

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="flex flex-col gap-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="vous@exemple.com" />
</div>
```

### Une carte

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Bienvenue</CardTitle>
    <CardDescription>Contenu de la carte</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Du contenu ici.</p>
  </CardContent>
</Card>
```

### Une notification toast

```tsx
import { toast } from "sonner";

toast.success("Operation reussie !");
toast.error("Une erreur est survenue.");
```

### Icones

Toutes les icones Lucide sont disponibles :

```tsx
import { SearchIcon, UserIcon, SettingsIcon } from "lucide-react";

<Button>
  <SearchIcon data-icon="inline-start" />
  Rechercher
</Button>
```

### Liste des composants disponibles

**Formulaire :** Input, InputGroup, InputOTP, Field (Label, Group, Error, Description), Label, Textarea, Select, Combobox, Checkbox, RadioGroup, Switch, Slider, ToggleGroup

**Retour :** Alert, AlertDialog, Sonner (toast), Progress, Skeleton, Spinner

**Navigation :** Tabs, Sidebar, Breadcrumb, Pagination, NavigationMenu, Menubar, ContextMenu, DropdownMenu

**Superposition :** Dialog, Sheet, Drawer, Popover, HoverCard, Tooltip

**Affichage :** Card, Table, Badge, Avatar, Separator, Empty, Kbd, AspectRatio, Chart

**Conteneurs :** Accordion, Collapsible, ScrollArea, Resizable, Carousel

---

## 7. Faire un appel API

L'instance Axios est prete a l'emploi.

```tsx
import { api } from "@/lib/axios";

// Recuperer des donnees (GET)
const { data } = await api.get("/utilisateurs");

// Envoyer des donnees (POST)
const { data } = await api.post("/utilisateurs", {
  nom: "Dupont",
  email: "dupont@exemple.com",
});
```

L'URL de base est definie dans `.env.local` (`NEXT_PUBLIC_API_URL`).  
Si elle n'est pas definie, l'instance utilisera une chaine vide : pensez a la configurer.

---

## 8. Bonnes pratiques

### Couleurs

Utilisez les couleurs semantiques, pas les couleurs brutes.

```tsx
// Correct
<div className="bg-primary text-primary-foreground" />

// A eviter
<div className="bg-blue-500 text-white" />
```

Couleurs disponibles : `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`.

### Espacement

Utilisez `gap-*` plutot que `space-x-*` ou `space-y-*`.

```tsx
// Correct
<div className="flex flex-col gap-4">
  <p>Element 1</p>
  <p>Element 2</p>
</div>

// A eviter
<div className="space-y-4">
  <p>Element 1</p>
  <p>Element 2</p>
</div>
```

### Taille

Quand largeur et hauteur sont egales, utilisez `size-*`.

```tsx
// Correct
<Avatar className="size-10" />

// A eviter
<Avatar className="w-10 h-10" />
```

### Mode sombre

Ne faites rien de special. Les couleurs semantiques s'adaptent automatiquement au theme. Pas de classes `dark:` a la main.

### Loading

Utilisez le composant Spinner pour les chargements :

```tsx
import { Spinner } from "@/components/ui/spinner";

{isLoading ? <Spinner /> : <p>Contenu charge</p>}
```

### Structure

- Chaque grande section de l'application dans un dossier dedie (`app/auth/`, `app/dashboard/`, etc.)
- Les composants reutilisables dans `components/`
- La logique metier dans `lib/`
- Les hooks personnalises dans `hooks/`

---

## En resume

1. Lancez `npm run dev`
2. Creez vos pages dans `app/`
3. Utilisez les composants shadcn/ui (`import { Button } from "@/components/ui/button"`)
4. Utilisez l'instance Axios pour les appels API (`import { api } from "@/lib/axios"`)
5. Utilisez les couleurs semantiques (`bg-primary`, `text-muted-foreground`)

Le projet est votre terrain de jeu. Amusez-vous bien.

---

## Contribution

Avant de contribuer, lisez le [Guide de contribution](CONTRIBUTING.md). Il definit les standards de code, les conventions de nommage et le workflow Git a respecter.
