#!/bin/bash
# À lancer depuis services/backend, venv activé.
# Corrige la migration vide générée pendant que db/base.py était cassé.
set -e

echo "=== 1. Retour à la migration précédente (avant la migration vide) ==="
alembic downgrade c52934dc7adc

echo ""
echo "=== 2. Suppression du fichier de migration vide ==="
rm -f alembic/versions/4f602a5cfc31_add_invoices_and_invoice_lines_tables.py

echo ""
echo "=== 3. Vérification que db/base.py voit bien les 10 tables maintenant ==="
python3 -c "
from app.db.base import Base
n = len(Base.metadata.tables)
print(f'{n} tables enregistrées : {sorted(Base.metadata.tables.keys())}')
if n < 10:
    print('⚠️  Toujours incomplet — ne continuez pas, remplacez db/base.py d\'abord.')
    exit(1)
"

echo ""
echo "=== 4. Régénération de la migration (cette fois avec les vrais modèles) ==="
alembic revision --autogenerate -m "add invoices and invoice_lines tables"

echo ""
echo "=== 5. Application ==="
alembic upgrade head

echo ""
echo "=== 6. Vérification finale en base ==="
python3 -c "
from app.db.session import engine
from sqlalchemy import inspect
tables = sorted(inspect(engine).get_table_names())
print('Tables en base :', tables)
if 'invoices' in tables and 'invoice_lines' in tables:
    print('✅ invoices et invoice_lines sont bien présentes.')
else:
    print('❌ Toujours absentes — collez la sortie complète de ce script.')
"