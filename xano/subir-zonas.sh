#!/bin/zsh
# Sube a Xano (workspace 6, grupo 40) los cambios de zonas del 11 nov: campo zona en user,
# GET/POST admin/usuarios con zona y el nuevo PATCH admin/usuarios/{usuario_id}.
# Copia de lo que había antes: ~/clone-web/suprafeel-xano/backup/2026-11-11-zonas
set -e
cd "$(dirname "$0")/xs"
M=~/clone-web/suprafeel-xano/scripts/meta.sh
$M PUT  /workspace/6/table/64              table/user.xs
$M PUT  /workspace/6/apigroup/40/api/796   api/admin_usuarios_get.xs
$M PUT  /workspace/6/apigroup/40/api/797   api/admin_usuarios_post.xs
$M POST /workspace/6/apigroup/40/api       api/admin_usuarios_id_patch.xs
echo "Listo. Ahora haz doble clic en «Instalar Suprafeel.command» para publicar la web."
