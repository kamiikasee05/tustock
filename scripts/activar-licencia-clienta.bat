@echo off
title TUSTOCK - Activar Licencia Premium
cd /d "%~dp0..\server"
echo ========================================
echo  Activando Licencia Premium para Clienta
echo ========================================
echo.
echo Esta accion asigna la licencia premium
echo a esta instalacion de TUSTOCK.
echo.
python -c "
from database import SessionLocal, init_db
from models.license import License
init_db()
db = SessionLocal()
lic = db.query(License).filter(License.active == True).first()
if lic:
    if lic.plan == 'premium':
        print('La licencia ya es Premium. Listo.')
    else:
        lic.plan = 'premium'
        lic.max_products = 999999
        lic.reports_enabled = True
        lic.export_enabled = True
        lic.monitor_enabled = True
        lic.key = 'TST-PREM-4EVA-CLIENT'
        lic.customer_name = 'Clienta Premium'
        lic.expires_at = None
        db.commit()
        print('Licencia activada: PREMIUM')
        print('Monitor remoto habilitado.')
else:
    # crear licencia premium
    from services.license_service import _generate_key
    lic = License(key='TST-PREM-4EVA-CLIENT', plan='premium', active=True,
        max_products=999999, reports_enabled=True, export_enabled=True,
        monitor_enabled=True, customer_name='Clienta Premium')
    db.add(lic)
    db.commit()
    print('Licencia premium creada.')
db.close()
"
echo.
echo Listo. Reinicia TUSTOCK para aplicar los cambios.
pause
