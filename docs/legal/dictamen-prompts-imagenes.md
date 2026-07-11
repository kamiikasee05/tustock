# DICTAMEN LEGAL — Auditoría de Cumplimiento Normativo

**Emisor:** Agente Legal — TUSTOCK
**Fecha:** 10 de julio de 2026
**Marco normativo:** Ley 24.240 (Defensa del Consumidor), arts. 4, 8, 9, 10 bis
**Alcance:** 3 prompts de imagen (Nano Banana) + 3 copies de Facebook Groups
**Archivos auditados:** `obsidian/TU STOCK/06-Marketing/Campaña Salida al Mercado.md`

---

## PRINCIPIO GENERAL

La publicidad engañosa (art. 8, Ley 24.240) sanciona:
> "Se entenderá por publicidad engañosa toda aquella que sea susceptible de inducir a error a los consumidores... cuando la publicidad haga afirmaciones falsas... u omisiones sobre las características esenciales del producto."

El art. 9 prohíbe "toda modalidad de publicidad engañosa o que sea susceptible de inducir a error... por cualquier medio." El art. 10 bis exige que la oferta contenga información "veraz y suficiente" sobre las características esenciales.

**Criterio aplicado:** Toda afirmación visual o textual debe ser verificable contra la Sección 3 de MEMORY.md (features construidas y funcionales). Cualquier claim que exceda la realidad factual es un riesgo de publicidad engañosa.

---

## I. PROMPTS DE IMAGEN (NANO BANANA)

### Prompt Post 1 — "¿Cuánto stock tenés AHORA?"

| # | Elemento | Afirmación | Verificación (Sección 3 MEMORY) | Riesgo | Directiva |
|---|----------|------------|--------------------------------|--------|-----------|
| 1.1 | Texto overlay | "¿Cuánto stock tenés AHORA?" | Pregunta retórica, no es afirmación factual. | ✅ Sin riesgo | Aprobado sin cambios |
| 1.2 | Subtexto | "No más o menos. No creo que quedan." | Reformula el dolor del inventario inexacto. No es claim sobre el producto. | ✅ Sin riesgo | Aprobado sin cambios |
| 1.3 | Item: "Stock en tiempo real" | Afirmación de feature | **Verificado.** Sección 3: "Stock: actual, movimientos (entrada/salida/ajuste), alertas." | ✅ Sin riesgo | Aprobado sin cambios |
| 1.4 | Item: "Ventas en 3 segundos" | Afirmación de velocidad del POS | **Parcialmente verificado.** Sección 3: "Ventas POS: carrito, métodos de pago, descuentos." El POS existe pero "3 segundos" es una claim de velocidad no verificada. Es hyperbole de marketing, no una feature literal. | ⚠️ Bajo | **Corregir:** Cambiar a "Registrás ventas rápido" o "Ventas al instante". "3 segundos" es una afirmación numérica específica que puede requerir prueba (art. 8 Ley 24.240). |
| 1.5 | Item: "App Android" | Afirmación de feature | **Verificado.** Sección 3: "App Android: POS (tomar pedidos como vendedor) y Stock (escanear y contar)." | ✅ Sin riesgo | Aprobado sin cambios |
| 1.6 | CTA: "PROBALO 30 DÍAS GRATIS" | Afirmación de trial | **Verificado.** Trial de 30 días existe. **PERO** falta información material: el trial tiene límite de 100 productos. | ⚠️ Medio | **Corregir:** Agregar aclaración visible: "30 días gratis (hasta 100 productos)". La omisión del límite de 100 productos es una omisión de información relevante bajo art. 8 Ley 24.240. |

### Prompt Post 2 — "Desde casa veo las ventas del día"

| # | Elemento | Afirmación | Verificación (Sección 3 MEMORY) | Riesgo | Directiva |
|---|----------|------------|--------------------------------|--------|-----------|
| 2.1 | Cita: "Desde casa veo las ventas del día, el stock bajo y quién me debe plata." | Testimonial de clienta | **Verificado.** Sección 3: Monitor Cloud con dashboard mobile. Sección 8: caso real aprobado para contar. | ✅ Sin riesgo | Aprobado sin cambios |
| 2.2 | Subtexto: "Clienta con librería — Hace 2 semanas" | Contexto temporal del caso real | **Verificado.** Sección 6: "PRIMER CLIENTE: Librería." Fecha de venta: ~30 junio 2026. | ✅ Sin riesgo | Aprobado sin cambios |
| 2.3 | Mockup: "dashboard with sales graphs" | Visual de dashboard con gráficos | **Atención.** El Monitor Cloud muestra métricas (ventas, stock bajo, deudores). Si el mockup muestra gráficos elaborados (charts, líneas de tendencia), eso podría no existir literalmente. El dashboard es un HTML vanilla responsive con datos, no necesariamente con charts gráficos tipo Recharts. | ⚠️ Medio | **Corregir:** Asegurarse de que el mockup muestre el dashboard real de TUSTOCK (métricas en texto/cards), NO gráficos de líneas o barras que no existen. Si el diseño de Canva ya muestra el dashboard real, está bien. Verificar contra `cloud/dashboard.html`. |
| 2.4 | Items: "Green checkmarks listing benefits" | Features genéricas | Depende de qué benefits se listen. Si listan "Stock en tiempo real", "Sin internet", "App Android" — todos verificados. | ✅ Sin riesgo | Aprobado sin cambios (verificar que los items coincidan con features reales) |
| 2.5 | CTA: "PROBALO 30 DÍAS GRATIS" | Mismo que Post 1 | Mismo riesgo: falta límite de 100 productos. | ⚠️ Medio | **Corregir:** Mismo caso que 1.6. Agregar aclaración. |

### Prompt Post 3 — "¿Por qué TUSTOCK cuesta $80.000 y no $500.000?"

| # | Elemento | Afirmación | Verificación (Sección 3 MEMORY) | Riesgo | Directiva |
|---|----------|------------|--------------------------------|--------|-----------|
| 3.1 | Left side: "$300.000+/año" crossed out | Precio de competidores | **Riesgoso.** No hay evidencia de que exista un competidor específico que cobre "$300.000+/año". Esta cifra es una referencia genérica del mercado. Si un competidor demanda, debe poder probarse que al menos uno cobra eso. | ⚠️ Medio-Alto | **Corregir:** Cambiar a "Sistemas que cobran cientos de miles por año" o "Sistemas caros y complicados". Evitar un número específico que pueda ser impugnado. Alternativamente, agregar un asterisco: "*Precios de referencia de sistemas enterprise en el mercado argentino." |
| 3.2 | Right side: "$80.000 pago único" | Precio del plan Básico | **Verificado.** Sección 2: Básico $80,000 ARS único. | ✅ Sin riesgo | Aprobado sin cambios |
| 3.3 | Bottom text: "O $8.000/mes con Monitor Cloud" | Precio de Suscripción + feature | **Verificado.** Sección 2: Suscripción $8,000/mes. Sección 3: Monitor Cloud construido. | ✅ Sin riesgo | Aprobado sin cambios |

---

## II. COPIES DE FACEBOOK GROUPS

### Copy 1 — Gancho: Dolor del inventario

| # | Elemento | Afirmación | Verificación (Sección 3 MEMORY) | Riesgo | Directiva |
|---|----------|------------|--------------------------------|--------|-----------|
| C1.1 | "TUSTOCK es un sistema que instalás en tu PC en 15 minutos. Sin técnico, sin complicaciones." | Tiempo de instalación | **Verificado.** Sección 1: "Sin técnico — lo instala el dueño en 15 minutos." Speech de Ventas idéntico. | ✅ Sin riesgo | Aprobado sin cambios |
| C1.2 | "Sabés cuánto tenés de cada cosa en tiempo real" | Stock en tiempo real | **Verificado.** Sección 3. | ✅ Sin riesgo | Aprobado sin cambios |
| C1.3 | "Registrás ventas en 3 segundos con el carrito POS" | Velocidad del POS | **Parcialmente verificado.** Mismo caso que 1.4. POS existe, "3 segundos" es hyperbole no verificada. | ⚠️ Bajo | **Corregir:** Cambiar a "Registrás ventas al instante" o "Vendés rápido con el carrito POS". |
| C1.4 | "Escaneás códigos de barras con tu celular (app Android incluida)" | App Android con escáner | **Verificado.** Sección 3. | ✅ Sin riesgo | Aprobado sin cambios |
| C1.5 | "Generás informes de ventas, métodos de pago y top productos" | Informes | **Verificado.** Sección 3: "Informes diarios: totales, métodos de pago, top productos." | ✅ Sin riesgo | Aprobado sin cambios |
| C1.6 | "Exportás todo a Excel" | Exportación Excel | **Verificado para planes pagos.** Sección 3: "Exportación CSV y XLSX." Trial NO incluye exportación. | ⚠️ Bajo | **Corregir:** Aclarar que la exportación es del plan Básico en adelante, o agregar "con el plan Básico". Si se menciona en contexto general del producto (no del trial), el riesgo es bajo. |
| C1.7 | "funciona sin internet. Tus datos están en tu PC, no en la nube." | Offline-first + datos locales | **Verificado.** Sección 1 y 3. | ✅ Sin riesgo | Aprobado sin cambios |
| C1.8 | "Probá 30 días gratis sin poner un peso" | Trial gratuito | **Verificado.** Trial existe. **PERO** omite límite de 100 productos. | ⚠️ Medio | **Corregir:** Agregar "30 días gratis (hasta 100 productos)". Omisión de limitación material. |

### Copy 2 — Gancho: Social proof + caso real

| # | Elemento | Afirmación | Verificación (Sección 3 MEMORY) | Riesgo | Directiva |
|---|----------|------------|--------------------------------|--------|-----------|
| C2.1 | "Desde casa veo las ventas del día, el stock bajo y quién me debe plata." | Cita de clienta | **Verificado.** Sección 8. Caso real aprobado. | ✅ Sin riesgo | Aprobado sin cambios |
| C2.2 | "Una librería compró TUSTOCK hace unas semanas." | Caso real | **Verificado.** Sección 6. | ✅ Sin riesgo | Aprobado sin cambios |
| C2.3 | "Sus empleados toman pedidos escaneando códigos con el celu" | Empleados usando app Android | **Verificado.** Sección 3: App Android con POS. | ⚠️ Bajo | **Corregir:** Precisar "empleados" puede generar expectativa de multi-usuario. El sistema NO tiene múltiples perfiles de cajero (Sección 4). Cambiar a "Toma pedidos escaneando códigos con el celu" (sin atribuir a empleados múltiples). |
| C2.4 | "Ella ve las ventas desde su casa sin estar en el negocio" | Monitor Cloud remoto | **Verificado.** Sección 3: Monitor Cloud. | ✅ Sin riesgo | Aprobado sin cambios |
| C2.5 | "Sabe exactamente qué falta y qué sobra" | Stock en tiempo real | **Verificado.** Sección 3. | ✅ Sin riesgo | Aprobado sin cambios |
| C2.6 | "No pierde tiempo revisando cuadernos por el fiado" | Sistema de fiado | **Verificado.** Sección 3: "Clientes: registro, saldo 'fiado', transacciones." | ✅ Sin riesgo | Aprobado sin cambios |
| C2.7 | "No necesita internet para funcionar" | Offline-first | **Verificado.** Sección 1. | ✅ Sin riesgo | Aprobado sin cambios |
| C2.8 | "Se paga una sola vez ($80.000) o por mes ($8.000/mes)" | Precios | **Verificado.** Sección 2. | ✅ Sin riesgo | Aprobado sin cambios |
| C2.9 | "30 días de prueba gratis. Sin compromiso." | Trial | **Verificado.** Omite límite de 100 productos. | ⚠️ Medio | **Corregir:** Agregar "(hasta 100 productos)" después de "30 días de prueba gratis." |

### Copy 3 — Gancho: Precio vs competencia

| # | Elemento | Afirmación | Verificación (Sección 3 MEMORY) | Riesgo | Directiva |
|---|----------|------------|--------------------------------|--------|-----------|
| C3.1 | "Hay opciones que te cobran $300.000+ por año" | Precio de competidores | **Riesgoso.** Mismo caso que 3.1. Afirmación numérica específica sobre competidores sin fuente verificable. | ⚠️ Medio-Alto | **Corregir:** Cambiar a "Hay opciones que te cobran cientos de miles por año" o "Sistemas que te cobran carísimo". Evitar número específico. |
| C3.2 | "Tienen contabilidad, e-commerce, facturación... cosas que un kiosco o almacén no usa." | Características de competidores | **Verificado como negativo propio.** Sección 1: "No competimos en: features enterprise, contabilidad integrada, e-commerce, facturación electrónica (AFIP)." La afirmación describe correctamente qué NO ofrece TUSTOCK (y lo que sí ofrecen otros). | ✅ Sin riesgo | Aprobado sin cambios |
| C3.3 | "$80.000 pago único — te quedás el sistema para siempre" | Precio + perpetuidad | **Verificado.** Sección 2 y Términos y Condiciones cláusula 3: licencia limitada. "Te quedás el sistema para siempre" es una afirmación de perpetuidad. Legalmente es una "licencia perpetua" (T&C cláusula 6: "licencia perpetua con 1 año de actualizaciones"). Es preciso. | ✅ Sin riesgo | Aprobado sin cambios |
| C3.4 | "O $8.000/mes si preferís no pagar todo de una" | Precio Suscripción | **Verificado.** | ✅ Sin riesgo | Aprobado sin cambios |
| C3.5 | "Sin internet — no se cae cuando se va la luz" | Offline-first | **Verificado.** Sección 1. | ✅ Sin riesgo | Aprobado sin cambios |
| C3.6 | "App Android incluida — escaneás códigos con el celu" | App Android | **Verificado.** | ✅ Sin riesgo | Aprobado sin cambios |
| C3.7 | "Tus datos en tu PC — no los ve nadie más" | Datos locales | **Verificado.** Sección 1. | ✅ Sin riesgo | Aprobado sin cambios |
| C3.8 | "Lo instalás vos en 15 minutos, sin técnico" | Instalación fácil | **Verificado.** Sección 1. | ✅ Sin riesgo | Aprobado sin cambios |
| C3.9 | "el plan Suscripción incluye Monitor Cloud con URL fija" | Monitor Cloud en Suscripción | **Verificado.** Sección 2: Suscripción incluye Monitor Cloud. Sección 3: Monitor Cloud desplegado. | ✅ Sin riesgo | Aprobado sin cambios |
| C3.10 | "Probá 30 días gratis antes de decidir" | Trial | **Verificado.** Omite límite de 100 productos. | ⚠️ Medio | **Corregir:** Agregar "(hasta 100 productos)". |

---

## III. RESUMEN DE DIRECTIVAS VINCULANTES

### Directivas de corrección obligatoria

| # | Elemento afectado | Problema | Directiva específica |
|---|-------------------|----------|---------------------|
| **D1** | Prompts 1.4, Copy 1 C1.3 | "Ventas en 3 segundos" — afirmación numérica no verificada | **Corregir** a "Ventas al instante" o "Registrás ventas rápido" en TODOS los prompts y copies donde aparezca. |
| **D2** | Prompts 1.6, 2.5, Copies C1.8, C2.9, C3.10 | "30 días gratis" sin mencionar límite de 100 productos | **Corregir** en TODAS las menciones del trial: agregar "(hasta 100 productos)" o "Trial: 30 días o 100 productos". La omisión del límite es una información material que el consumidor necesita para decidir (art. 8 Ley 24.240). |
| **D3** | Prompt 3.1, Copy 3 C3.1 | "$300.000+/año" — precio específico de competidor sin sustento verificable | **Corregir** a "Sistemas que cobran cientos de miles por año" o "Sistemas caros". Evitar número concreto. |
| **D4** | Copy 2 C2.3 | "Sus empleados toman pedidos" — sugiere multi-usuario | **Corregir** a "Toma pedidos escaneando códigos con el celu" (sin "sus empleados"). El sistema NO tiene múltiples perfiles de cajero (Sección 4 MEMORY). |

### Directivas de verificación (verificar antes de publicar)

| # | Elemento | Acción requerida |
|---|----------|-----------------|
| **V1** | Prompt 2.3 — Mockup "dashboard with sales graphs" | Verificar que el mockup del dashboard en el diseño Canva muestre el dashboard REAL de TUSTOCK (cards/métricas en texto), NO gráficos de líneas o barras que no existen en `cloud/dashboard.html`. Si hay charts, reemplazar por screenshot real o cards de métricas. |
| **V2** | Copy 1 C1.6 — "Exportás todo a Excel" | Si se menciona sin contexto de plan, considerar aclarar "con el plan Básico o superior". El trial NO incluye exportación. Riesgo bajo si se lee en contexto de producto general, pero preferible aclarar. |
| **V3** | Prompts 1.3, 1.5 — Items "Stock en tiempo real" / "App Android" | Verificar que los checkmarks del diseño final contengan EXACTAMENTE las features reales. Si el agente de imagen agrega texto adicional no listado, puede incluir features inexistentes. |

### Aprobados sin cambios (todos los elementos restantes)

- ✅ Preguntas retóricas ("¿Cuánto stock tenés AHORA?")
- ✅ Dolor del inventario (subtextos)
- ✅ Testimonio de clienta librería
- ✅ Case real "Hace 2 semanas"
- ✅ Features: stock en tiempo real, informes, app Android, escáner de código de barras, fiado, offline
- ✅ Precios: $80.000 único, $8.000/mes, $160.000 Pro
- ✅ Monitor Cloud en plan Suscripción
- ✅ "Funciona sin internet", "Datos en tu PC"
- ✅ "Instalás en 15 minutos sin técnico"
- ✅ CTA "PROBALO 30 DÍAS GRATIS" (tras corrección D2)
- ✅ Descripción de competidores como "contabilidad, e-commerce, facturación" (negativo propio verificado)
- ✅ "Te quedás el sistema para siempre" (licencia perpetua, verificado en T&C)
- ✅ Links de WhatsApp y landing page
- ✅ Datos del proveedor (CUIT, email)
- ✅ Hashtags

---

## IV. OBSERVACIONES ADICIONALES

### 1. Omisión sistemática del límite de 100 productos en el trial

Este es el patrón de riesgo más repetido. TODAS las menciones del trial (3 en prompts + 3 en copies) omiten el límite de 100 productos. Esto constituye una **omisión de información relevante** bajo art. 8 de la Ley 24.240, que sanciona "afirmaciones falsas u omisiones sobre las características esenciales del producto." El límite de 100 productos es una característica esencial del trial porque determina si el comerciante puede evaluar el sistema (un kiosco promedio tiene 500-2000 productos).

### 2. El caso real de la librería está bien documentado

El copy 2 y el prompt 2 usan el caso real de la clienta premium. Esto es **correcto** porque:
- La venta es real (Sección 6 MEMORY)
- Las capacidades mencionadas (monitor, stock, fiado) son verificables
- No se exageran features
- Se identifica como "clienta con librería" (dato real)
- La temporalidad "hace 2 semanas" es razonable

### 3. La referencia a "$500.000" en el título del Post 3

El título del diseño Canva ("¿Por qué TUSTOCK cuesta $80.000 y no $500.000?") contiene un número mayor al "$300.000+/año" del copy. Si el $500.000 se refiere a un acumulado de 2-3 años de un competidor, debe aclararse. Si es solo un número redondo para impacto visual, riesgo es bajo (es una pregunta retórica, no una afirmación factual sobre un competidor específico).

### 4. "Hace 2 semanas" — temporalidad

Si los copies se publican semanas después del 10 de julio, la frase "Hace 2 semanas" dejará de ser precisa. **Recomendación:** Cambiar a "Hace unas semanas" (más genérico y siempre preciso) o actualizar la temporalidad al momento de publicar.

---

## V. CLASIFICACIÓN FINAL

| Categoría | Cantidad |
|-----------|:--------:|
| ✅ Aprobados sin cambios | 28 elementos |
| ⚠️ Corrección obligatoria | 4 directivas (D1-D4) |
| 🔍 Verificación requerida | 3 items (V1-V3) |
| ❌ Eliminar | 0 elementos |

**Conclusión:** No hay contenido que deba eliminarse. Las 4 directivas de corrección son menores y se resuelven con refraseo. El patrón más crítico es la omisión del límite de 100 productos en el trial (afecta 6 de 6 publicaciones). Una vez aplicadas las correcciones, TODO el material cumple con la Ley 24.240.

---

*Dictamen emitido por el Agente Legal — TUSTOCK*
*Fecha: 10 de julio de 2026*
*Vigente hasta: Revisión posterior o cambio de features/precios*
