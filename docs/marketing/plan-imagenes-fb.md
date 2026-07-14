# Plan de Imágenes Facebook — TUSTOCK

> Generado: 10 de Julio de 2026
> Estado: Pendiente de exportación/generación

---

## 1. Diseños Canva (disponibles AHORA)

Los 3 diseños ya existen en Canva y están listos para exportar como PNG.

| Post | Título | Design ID | Copy asociado |
|:----:|--------|:---------:|---------------|
| 1 | ¿Cuánto stock tenés AHORA? | `DAHO86YdAPo` | Copy 1 — Dolor del inventario |
| 2 | Desde casa veo las ventas | `DAHO8_ERplA` | Copy 2 — Social proof + caso real |
| 3 | ¿Por qué TUSTOCK cuesta $80.000? | `DAHO87UvqA8` | Copy 3 — Precio vs competencia |

### Exportación PNG desde Canva

Para cada diseño, usar `export-design` con:
- format: `png`
- design_id: el correspondiente
- pages: `[1]` (solo página 1)

**Nota:** Los diseños son 1080x1350px (formato portrait para Facebook).

### Cuándo exportar

Exportar cuando el humano vaya a publicar cada post. Las imágenes se descargan como PNG y se suben directamente a Facebook.

---

## 2. Prompts Nano Banana (para cuando la API esté disponible)

> La API de Gemini Flash Image está rate-limited (429). Usar estos prompts cuando se desbloquee para generar versiones alternativas o superiores a las de Canva.

### Prompt Post 1 — Dolor del inventario

```
Social media post 1080x1350px, dark blue gradient background resembling an argentine kiosco at dusk. A frustrated kiosco owner in his 40s wearing a faded apron, standing in a messy back storage room with cardboard boxes of alfajores, bag of yerba, and cigarette cartons scattered around, holding a tattered notebook and a pen looking confused. Realistic argentine kiosco details: persianas de metal partially down, mosaico floor, Calendario de la lotería on the wall. Text overlay in bold white sans-serif: "¿Cuánto stock tenés AHORA?" Subtext in light gray: "No más o menos. No creo que quedan." Green checkmark icons listing: Stock en tiempo real · Ventas al instante · App Android. CTA button in cyan blue: "PROBALO 30 DÍAS GRATIS (hasta 100 productos)". Moody lighting, authentic argentine atmosphere, photo-realistic.
```

### Prompt Post 2 — Caso real / testimonial

```
Social media post 1080x1350px, dark blue gradient background. Warm interior of an argentine librería seen from the counter, estanterías de madera with colorful cuadernos Rayita, lápices in glass jars on the counter, sunlight streaming through the entrance door with a cartelito de "abierto" visible. A smartphone mockup in foreground showing a mobile dashboard with sales data. Quote text in cyan blue larger font: "Desde casa veo las ventas del día, el stock bajo y quién me debe plata." Below: "Clienta con librería — Hace unas semanas." Green checkmarks listing benefits. CTA button: "PROBALO 30 DÍAS GRATIS (hasta 100 productos)". Photo-realistic, warm tones, authentic argentine stationery shop atmosphere.
```

### Prompt Post 3 — Precio vs competencia

```
Social media post 1080x1350px, dark blue gradient background. Split screen visual: Left side in gray/red showing a cluttered desk with expensive-looking software boxes, complex spreadsheet printouts, and a calculator, with a large red X crossed over a text banner reading "cientos de miles por año". Right side in green/cyan showing a clean bright kiosco counter with a simple tablet running the POS system, warm lighting, a mate on the counter, text "$80.000 pago único" in large bold green numbers. In the middle, a VS badge. Bottom text: "O $8.000/mes con Monitor Cloud". CTA button. Authentic argentine kiosco details, photo-realistic.
```

### Cuándo usar Nano Banana

- Si Canva no logra el look deseado (fotos más realistas)
- Para A/B testing: una versión Canva + una versión Gemini
- Cuando la API se desbloquee, generar las 3 y comparar con Canva
- Nano Banana produce imágenes más "fotográficas" vs el estilo más "gráfico" de Canva

---

## 3. Checklist de publicación

### Pre-publicación (una sola vez)

- [ ] Verificar que la cuenta de Facebook está unida a los grupos de kiosqueros/almaceneros
- [ ] Tener el link de WhatsApp Business configurado: `https://wa.me/5493826403110`
- [ ] Tener la landing page verificada: `https://tustocksoft.com.ar`

### Post 1 — Copy 1 + Imagen "¿Cuánto stock tenés AHORA?"

- [ ] Exportar imagen `DAHO86YdAPo` como PNG desde Canva
- [ ] Copiar Copy 1 completo de `docs/marketing/copies-facebook-grupos.md`
- [ ] Pegar imagen + copy en grupo de Facebook
- [ ] Verificar que el link de WhatsApp funciona
- [ ] Horario sugerido: 8-10 AM o 7-9 PM

### Post 2 — Copy 2 + Imagen "Desde casa veo las ventas"

- [ ] Exportar imagen `DAHO8_ERplA` como PNG desde Canva
- [ ] Copiar Copy 2 completo de `docs/marketing/copies-facebook-grupos.md`
- [ ] Pegar imagen + copy en grupo de Facebook
- [ ] Verificar que el link de WhatsApp funciona
- [ ] Horario sugerido: 8-10 AM o 7-9 PM

### Post 3 — Copy 3 + Imagen "¿Por qué TUSTOCK cuesta $80.000?"

- [ ] Exportar imagen `DAHO87UvqA8` como PNG desde Canva
- [ ] Copiar Copy 3 completo de `docs/marketing/copies-facebook-grupos.md`
- [ ] Pegar imagen + copy en grupo de Facebook
- [ ] Verificar que el link de WhatsApp funciona
- [ ] Horario sugerido: 8-10 AM o 7-9 PM

---

## 4. Timeline de publicación

| Semana | Fecha sugerida | Post | Imagen | Copy | Grupo |
|:------:|:--------------:|:----:|:------:|:----:|:-----:|
| 1 | Semana del 14 Jul | Post 1 | ¿Cuánto stock? (Canva) | Copy 1 — Dolor | Grupo A |
| 2 | Semana del 21 Jul | Post 2 | Desde casa veo (Canva) | Copy 2 — Caso real | Grupo B |
| 3 | Semana del 28 Jul | Post 3 | Precio vs competencia (Canva) | Copy 3 — Precio | Grupo A |

### Reglas de spacing

- **Mínimo 5 días** entre publicaciones en el **mismo grupo**
- **Rotar grupos**: si hay más de un grupo, alternar para no spamear
- **Máximo 1 post por semana** por grupo (las moderaciones banean spammers)
- Si un post genera comentarios, **responder rápido** y derivar a WhatsApp

### Orden lógico

1. **Post 1 (dolor)** va primero: identifica al target (dueño con problema de stock)
2. **Post 2 (social proof)** va segundo: muestra que ya hay clientes reales
3. **Post 3 (precio)** va tercero: cierra la objeción del precio

### Después de la Semana 3

- Revisar métricas: ¿cuántos clicks en WhatsApp? ¿cuántas consultas?
- Si hay engagement, repetir el ciclo con los mismos 3 posts
- Cuando Nano Banana esté disponible, generar versiones alternativas y hacer A/B test

---

## 5. Referencias

| Archivo | Contenido |
|---------|-----------|
| `docs/marketing/copies-facebook-grupos.md` | 3 copies listos para copy-paste |
| `docs/marketing/guia-mercadolibre.md` | Guía para publicar en ML |
| `docs/index.html` | Landing page (GitHub Pages) |
| `legal/terminos-y-condiciones.html` | Términos y condiciones |
| `legal/politica-de-privacidad.html` | Política de privacidad |
