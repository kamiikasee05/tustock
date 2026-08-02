# Análisis de Precios — 30 de Julio de 2026

## Resumen ejecutivo

**Conclusión:** La Suscripción a $8K/mes está significativamente subvaluada. Se recomienda subirla a **$12K/mes** (+50%). Básico y Pro suben moderadamente. Se crea tier **Multi-Sucursal** para el prospecto farmacia.

Justificación: producto validado (2 clientes + 2 prospectos), feature set maduro (POS Remoto, Monitor Cloud, fechas de vencimiento), competencia cobra 3x más por menos features, y la infraestructura cloud (Railway, dominio) tiene costos recurrentes.

Clientes actuales congelados: Librería ($60K+$6K), SU-Day ($8K/mes).

---

## 1. Situación actual

| Plan | Precio actual | Modelo | Incluye |
|------|:------------:|:------:|---------|
| Trial | Gratis | 30 días | 100 productos, sin informes, sin export |
| Básico | **$80K ARS** | Pago único | Sistema completo + app Android + informes + export Excel + 1 año updates |
| Suscripción | **$8K/mes** | Mensual | Todo + Monitor Cloud + soporte prioritario + updates continuos |
| Pro | **$160K ARS** | Pago único | Todo + Monitor Cloud + 1 año updates |

---

## 2. Argumentos para el aumento

### 2.1 Validación de mercado completa
- 2 clientes activos pagando
- 2 prospectos en pipeline (farmacia 3 sucursales + cosmética)
- Sin objeciones de precio en ninguna venta
- Dayana pagaba **$24K/mes** en otro sistema SOLO por POS remoto → hoy paga $8K/mes por TODO el sistema

### 2.2 Feature set creció desde la fijación de precios (Junio 2026)
| Feature | Junio | Julio |
|---------|:-----:|:-----:|
| POS Remoto desde celular | ❌ | ✅ |
| Inventario completo en Monitor Cloud | ❌ | ✅ |
| Fechas de vencimiento | ❌ | ✅ |
| Stock inicial al crear producto | ❌ | ✅ |
| Push real-time post-venta | ❌ | ✅ |
| Página de códigos + PDF imprimible | ❌ | ✅ |

### 2.3 Infraestructura cloud con costos reales
- Railway: $5/mes (pronto fuera de free tier)
- Dominio monitor.tustocksoft.com.ar: mantenimiento DNS
- PostgreSQL managed: persistence
- Soporte y mantenimiento continuo

### 2.4 Benchmark competitivo

| Aspecto | Competencia online | TUSTOCK |
|---------|:-----------------:|:-------:|
| POS Remoto (solo ese feature) | $24K/mes | Incluido |
| Dependencia de internet | Total | Cero |
| Precio mensual típico | $15K-$30K/mes | $8K/mes → $12K/mes |
| Pago único disponible | No | Sí ($80K / $160K) |
| Datos en tu PC | No | Sí |
| Licencia perpetua | No | Sí (Básico/Pro) |

---

## 3. Precios recomendados (nuevos clientes)

| Plan | Precio actual | **Nuevo precio** | Variación |
|------|:------------:|:----------------:|:---------:|
| Trial | Gratis | **Gratis** | Sin cambios |
| Básico | $80K | **$100K** único | +25% |
| Suscripción | $8K/mes | **$12K/mes** | **+50%** |
| Pro | $160K | **$200K** único | +25% |
| **Nuevo: Multi-Sucursal** | — | **$20K/mes** o **$300K único** | Nuevo tier |

### 3.1 Justificación plan por plan

**Suscripción $8K → $12K/mes (⬆ +50%)**
- Es el plan con mayor desajuste precio/valor
- Competencia cobra $24K/mes solo por POS remoto → nuestro sistema completo es 50% más barato aún al nuevo precio
- Incluye: Monitor Cloud (infraestructura mantenida), POS Remoto, soporte prioritario, updates continuos
- Break-even vs Básico: $100K / $12K = ~8 meses (antes 10 meses con $80K/$8K) — sigue siendo buen deal para el cliente
- Break-even vs Pro: $200K / $12K = ~17 meses (antes 20) — Pro sigue siendo atractivo para largo plazo

**Básico $80K → $100K único (⬆ +25%)**
- Mercado Libre ya lista a $80K — podemos actualizar el precio en la publicación
- Sigue siendo el plan más accesible del mercado para un sistema completo
- 1 año de updates + app Android + informes + export Excel
- 1 cliente ya pagó $60K (precio legacy) — $80K fue el primer ajuste, $100K es el segundo

**Pro $160K → $200K único (⬆ +25%)**
- Premium: Monitor Cloud + updates + soporte
- El "cloud backup" que listaba se elimina definitivamente de la propuesta (feature no existe — riesgo legal)
- A $200K, break-even vs Suscripción es ~17 meses — el cliente que paga único se beneficia a largo plazo

**Multi-Sucursal (NUEVO TIER)**
- Para negocios con 2+ sucursales (farmacia, polirrubro, cosmética)
- Cada sucursal corre su instancia independiente
- Dashboard cloud consolidado con vista de todas las sucursales
- Precio: $300K único o $20K/mes
- Si desarrollamos multi-sucursal (~38h), este tier recupera la inversión con 1 cliente
- Alternativa: vender licencias individuales (3× Básico = $300K sin consolidated view)

### 3.2 ¿Por qué +50% en Suscripción y solo +25% en único?

La Suscripción es un compromiso mensual. El cliente que elige Suscripción valora el soporte continuo, el Monitor Cloud y no tener que pensar en updates. Es el plan que más carga operativa genera (soporte, infraestructura cloud, Railway). Por eso el aumento es mayor.

Los planes únicos (Básico/Pro) son autosuficientes: el cliente recibe el software y 1 año de updates. Menos carga operativa. Aumento moderado.

---

## 4. Estrategia de comunicación

### 4.1 Para clientes existentes
**No se tocan.** Punto. Librería ($60K+$6K) y SU-Day ($8K/mes) mantienen sus precios de por vida.

Si preguntan: *"Los precios actualizamos para clientes nuevos. Vos tenés tu plan congelado, no te afecta."*

### 4.2 Para nuevos prospectos
El speech de ventas actualizado refleja los nuevos precios. La respuesta estándar si preguntan por precio anterior:

> *"Los precios se actualizaron en julio porque agregamos varias features nuevas: ahora podés hacer ventas desde el celular con el POS Remoto, tenés el inventario completo en el Monitor Cloud, y trackeás fechas de vencimiento. Pero si entrás ahora, los congelás."*

### 4.3 En Mercado Libre
- Actualizar listing MLA3596381120 de $80K a **$100K** (Básico)
- Descripción actualizada: "Plan Básico: sistema completo + app Android. Pago único. Sin mensualidades."
- Agregar opción de Suscripción en la descripción ($12K/mes con Monitor Cloud + POS Remoto)

### 4.4 Para el prospecto Farmacia (3 sucursales)
Opciones a presentar:
1. **3 licencias Básico** ($300K total, sin consolidated view) — si solo necesitan control por sucursal
2. **Multi-Sucursal Suscripción** ($20K/mes con consolidated view) — si necesitan ver todo junto
3. **Multi-Sucursal Único** ($300K único con consolidated view) — si prefieren pago único

---

## 5. Acciones requeridas

| # | Acción | Quién |
|---|--------|:-----:|
| 1 | Actualizar MEMORY.md §2 con nuevos precios | Dispatcher |
| 2 | Actualizar landing page (`docs/index.html`) con nuevos precios | 🎨 UI |
| 3 | Actualizar ML listing de $80K a $100K | 🧑 HUMANO |
| 4 | Actualizar Upgrade.tsx (frontend) con nuevos precios + corregir "cloud backup" en Pro | 🖥 DEV |
| 5 | Actualizar speech de ventas en MEMORY.md §8 | Ventas |
| 6 | Sincronizar con Obsidian | Dispatcher |
| 7 | Notificar a Marketing para que actualice copies | Marketing |

---

## 6. Resumen visual

```
                          ANTES            DESPUÉS
Trial                    Gratis             Gratis   ← sin cambios
Básico               $80K único         $100K único  ← +25%
Suscripción          $8K/mes            $12K/mes     ← +50%
Pro                  $160K único        $200K único  ← +25%
Multi-Sucursal           —          $300K único      ← NUEVO
                                    ó $20K/mes
```

**Clientes actuales congelados:**
- Librería: $60K entry + $6K/mes ✅
- SU-Day (Dayana): $8K/mes ✅

---

*Análisis preparado por Ventas — 30 de Julio de 2026*
*Basado en: 2 clientes activos, 2 prospectos, validación de mercado completa, feature set actual, benchmark competitivo.*
