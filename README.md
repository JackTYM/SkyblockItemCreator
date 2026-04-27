# Skyblock Item Creator

A web-based tool for designing custom items, crafting recipes, mayors, and milestones for Hypixel Skyblock. Built with Nuxt 4 and Vue 3.

## Features

### Item Creator
Design custom items with full Skyblock or vanilla Minecraft styling:
- **Rarity system** - All Skyblock rarities (Common through Admin) plus custom rarities
- **Stats** - 40+ Skyblock stats with proper symbols and colors
- **Abilities** - Item abilities, full set bonuses, piece bonuses, and tiered bonuses
- **Gemstone slots** - 12 gemstone types with 5 quality tiers
- **Pet mode** - Create pets with levels, XP, types, and held items
- **Texture picker** - Browse vanilla Minecraft textures, player heads, or use custom URLs
- **Enchant glint** - Toggle enchantment shimmer effect
- **Dungeonized items** - Mark items as dungeon gear

### Recipe Designer
Create crafting recipes with:
- Vanilla Minecraft crafting grid
- Skyblock-styled crafting interface
- Custom result items with quantities

### Mayor Creator
Design custom Skyblock mayors with:
- Custom perks and descriptions
- Proper tooltip formatting
- Mayor-style UI

### Milestone Creator
Build milestone reward menus with:
- Progress tracking
- Reward tiers
- Skyblock milestone styling

## Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com) with Vue 3
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with custom Minecraft theme
- **Font**: Minecraft/Monocraft monospace font
- **Export**: [html-to-image](https://github.com/nickasd/html-to-image) for PNG export
- **Deployment**: Cloudflare Pages

## Project Structure

```
app/
├── components/
│   ├── item/          # Item editor, preview, texture picker
│   ├── mayor/         # Mayor editor and grid
│   ├── milestone/     # Milestone editor, grid, tooltip
│   ├── recipe/        # Crafting slot, grid, designer
│   └── ui/            # Reusable Minecraft-styled components
├── composables/
│   ├── useExport.ts   # PNG export, JSON copy, /give commands
│   ├── useMinecraftFormat.ts  # Minecraft color code parsing
│   └── useTextures.ts # Texture fetching from CDN
├── layouts/
├── pages/
│   ├── index.vue      # Landing page
│   ├── item.vue       # Item creator
│   ├── recipe.vue     # Recipe designer
│   ├── mayor.vue      # Mayor creator
│   └── milestone.vue  # Milestone creator
└── types/             # TypeScript definitions
```

## Getting Started

### Prerequisites
- Node.js (see `.nvmrc` for version)
- npm, pnpm, yarn, or bun

### Installation

```bash
npm install
```

### Development

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

### Production

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Export Options

- **PNG** - Download the item tooltip as an image
- **JSON** - Copy item data as JSON
- **/give Command** - Generate a Minecraft give command (vanilla items and player heads only)
- **Share URL** - Copy a shareable link with encoded item data

## Texture Sources

The texture picker supports three sources:

1. **Vanilla** - Minecraft item and block textures from [mcasset.cloud](https://mcasset.cloud) CDN (cached locally for 24 hours)
2. **Player Heads** - Any Minecraft username via [mc-heads.net](https://mc-heads.net)
3. **Custom** - Any image URL (display only, won't work in /give commands)

## Minecraft Formatting

The lore editor supports standard Minecraft formatting codes:
- Colors: `§0`-`§9`, `§a`-`§f`
- Formatting: `§l` (bold), `§o` (italic), `§n` (underline), `§m` (strikethrough), `§k` (obfuscated)
- Reset: `§r`

Select text and click a color/format button to wrap it, or click to insert at cursor.

## Deployment

Configured for Cloudflare Pages deployment via `wrangler.jsonc`. The build output is generated to `./dist`.

## License

This project is not affiliated with Hypixel Inc. or Mojang Studios. Hypixel Skyblock is a trademark of Hypixel Inc. Minecraft is a trademark of Mojang Studios.
