# Sanity Studio pour Journal du Lycée

## Configuration du Studio

Le Sanity Studio est configuré pour gérer les contenus du journal du lycée.

## Lancement du Studio

Pour lancer le Sanity Studio, utilisez l'une des commandes suivantes :

```bash
# Avec npm
npm run dev

# Ou avec yarn
yarn dev
```

Le studio sera accessible à l'adresse : `http://localhost:3000/studio`

## Variables d'Environnement Requises

Assurez-vous d'avoir les variables suivantes dans votre `.env.local` :
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`

## Schémas Disponibles
- Article
- Edition
- Contenu de Bloc (Block Content)