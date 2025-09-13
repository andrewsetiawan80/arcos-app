#!/bin/bash
set -euo pipefail

OLD_NAME="uhpc-gfrc-calculator"
NEW_NAME="cretewerkz-app"
APP_TITLE="Cretewerkz App"
APP_SHORT="Cretewerkz"
SLUG="cretewerkz-app"

bold(){ printf "\033[1m%s\033[0m\n" "$*"; }
ok(){ echo "✅ $*"; }
warn(){ echo "⚠️  $*"; }
info(){ echo "• $*"; }

# locate project folder
CWD="$(pwd)"
if [ -d "$OLD_NAME" ]; then
  PDIR="$CWD"; SRC_DIR="$OLD_NAME"
elif [ -d "$NEW_NAME" ]; then
  PDIR="$CWD"; SRC_DIR="$NEW_NAME"
else
  BASE="$(basename "$CWD")"
  if [ "$BASE" = "$OLD_NAME" ] || [ "$BASE" = "$NEW_NAME" ]; then
    PDIR="$(dirname "$CWD")"; SRC_DIR="$BASE"
  else
    warn "Couldn't find '$OLD_NAME' or '$NEW_NAME' in: $CWD"
    warn "Run this script from the parent directory that contains your project."
    exit 1
  fi
fi

cd "$PDIR"

# rename folder if needed
if [ "$SRC_DIR" = "$OLD_NAME" ]; then
  mv "$OLD_NAME" "$NEW_NAME"
  ok "Renamed folder: $OLD_NAME → $NEW_NAME"
else
  info "Folder already named '$NEW_NAME'"
fi

cd "$NEW_NAME"

# helpers
inplace_sed () {
  local file="$2"
  sed -i.bak "$1" "$file" && rm -f "${file}.bak" 2>/dev/null || true
}
node_json () {
  local file="$1"; shift
  node -e "const fs=require('fs');const p='$file';
if(!fs.existsSync(p)){process.exit(0)}
const src=JSON.parse(fs.readFileSync(p,'utf8'));
const out=(()=>{ $* })();
fs.writeFileSync(p, JSON.stringify(out, null, 2)); console.log('updated', p);"
}

# package.json
if [ -f package.json ]; then
  node_json package.json "
    const o = src;
    o.name = '$NEW_NAME';
    o.description = (o.description && o.description.trim().length)
      ? o.description
      : '$APP_TITLE';
    return o;"
  ok "Updated package.json"
else
  warn "package.json not found (skipping)"
fi

# index.html title
if [ -f index.html ]; then
  inplace_sed 's|<title>[^<]*</title>|<title>'"$APP_TITLE"'</title>|' index.html
  ok "Updated index.html title"
elif [ -f public/index.html ]; then
  inplace_sed 's|<title>[^<]*</title>|<title>'"$APP_TITLE"'</title>|' public/index.html
  ok "Updated public/index.html title"
else
  info "No index.html found (skipping title)"
fi

# PWA manifest
if [ -f public/manifest.json ]; then
  node_json public/manifest.json "
    const o = src;
    o.short_name = '$APP_SHORT';
    o.name = '$APP_TITLE';
    o.start_url = o.start_url || '.';
    o.display = o.display || 'standalone';
    o.theme_color = o.theme_color || '#000000';
    o.background_color = o.background_color || '#0b0f13';
    return o;"
  ok "Updated public/manifest.json"
fi

# Expo config (optional)
if [ -f app.json ]; then
  node_json app.json "
    const o = src; o.expo = o.expo || {};
    o.expo.name = '$APP_TITLE';
    o.expo.slug = '$SLUG';
    return o;"
  ok "Updated Expo app.json"
fi
if [ -f app.config.js ]; then
  inplace_sed "s/name: *['\"][^'\"]*['\"]/name: '$APP_TITLE'/" app.config.js
  inplace_sed "s/slug: *['\"][^'\"]*['\"]/slug: '$SLUG'/" app.config.js
  ok "Updated Expo app.config.js"
fi
if [ -f app.config.ts ]; then
  inplace_sed "s/name: *['\"][^'\"]*['\"]/name: '$APP_TITLE'/" app.config.ts
  inplace_sed "s/slug: *['\"][^'\"]*['\"]/slug: '$SLUG'/" app.config.ts
  ok "Updated Expo app.config.ts"
fi

# git commit if repo exists
if [ -d .git ]; then
  git add .
  git commit -m "chore: rename to $APP_TITLE; update web & Expo config" || info "Nothing to commit"
  ok "Git commit created (or nothing changed)"
else
  warn "No .git repo found — to initialize and push:"
  echo "  git init"
  echo "  git add ."
  echo "  git commit -m 'chore: bootstrap $APP_TITLE'"
  echo "  git branch -M main"
  echo "  git remote add origin https://github.com/<you>/$NEW_NAME.git"
  echo "  git push -u origin main"
fi

bold "🎉 Done. Project is now \"$APP_TITLE\"."
