# Historial de Decisiones

| Fecha | Decisión | Quién |
|------|----------|:-----:|
| 2026-06-30 | Precio Básico $60K ARS (luego subió a $80K) | Ventas |
| 2026-06-30 | Suscripción $6K/mes (luego subió a $8K) | Ventas |
| 2026-06-30 | Primer cliente: librería, $60K entry + $6K/mes | Humano |
| 2026-06-30 | Precios actualizados post-validación: $80K / $8K / $160K | Ventas |
| 2026-06-30 | Monitor Premium adelantado para clienta premium | Ventas |
| 2026-06-30 | Monitor Cloud aprobado (push-based, URL fija) | Ventas |
| 2026-06-30 | Matriz de gating aprobada (Export Excel en todos los pagos) | Ventas |
| 2026-07-02 | Mercado Pago REST construido | DEV |
| 2026-07-02 | Validación cloud de licencias implementada | DEV |
| 2026-07-02 | Landing page desplegada en GitHub Pages | DEV |
| 2026-07-02 | Railway hobby plan decidido ($5/mes) | Humano |
| 2026-07-02 | Grace period: 7 días tras pago rechazado. Sistema no se bloquea. | Ventas |
| 2026-07-04 | Suscripciones MP vía Preapproval API | DEV |
| 2026-07-04 | Grace period + banner progresivo implementado | DEV |
| 2026-07-04 | Documentación legal completa | Legal |
| 2026-07-04 | EULA Clickwrap implementado | DEV |
| 2026-07-04 | Consentimiento registro cloud + baja de cuenta | DEV |
| 2026-07-06 | MP Suscripciones bloqueado: usar Plan compartido con link fijo en vez de preapproval API directa | DEV + Humano |
| 2026-07-06 | Suscripción vía Plan compartido implementada | DEV |
| 2026-07-06 | Bugs funcionales corregidos + auth timing-safe + cleanup | DEV |
| 2026-07-06 | Plan activo ID: `492a6877398e...` — link funcional y probado | DEV + Humano |
| 2026-07-06 | Modelo híbrido MP confirmado: Checkout Pro + Plan compartido. 2 apps separadas. | DEV + Humano + Dispatcher |
| 2026-07-07 | Error 400 al configurar webhook del Plan MP: "Properties to update are required". Posiblemente MP rechaza PUT si notification_url ya está seteado al mismo valor. Pendiente fix de DEV. | Humano + Dispatcher |
| 2026-07-10 | **NO a farmacia multi-sucursal**: Se rechaza oportunidad de farmacia con 3 sucursales ($15M/mes facturación). No estamos preparados técnica ni comercialmente. El gap es abismal: falta AFIP, ANMAT, obras sociales, multi-sucursal, lotes/vencimiento, multi-usuario. Requeriría 10-15 meses de desarrollo y $6.5M-9.75M ARS. Nos mantenemos en mercado original (kioscos, librerías, almacenes). | Humano + Dispatcher |
