# Monitor Premium TUSTOCK — Material de Ventas

> Feature completada por DEV el 2026-06-30. [ventas listo]

---

## ¿Qué es?

Un panel que la clienta abre desde el celular y ve **en tiempo real** qué está pasando en su negocio sin estar ahí. Ventas del día, stock bajo, métodos de pago, productos más vendidos, clientes con deuda.

## ¿Cómo funciona?

1. En la PC del negocio corre un servicio adicional (Monitor) en el puerto 8091
2. Se conecta con Cloudflare Tunnel → genera una URL pública tipo `https://xxx.trycloudflare.com`
3. La clienta abre esa URL desde cualquier celular, pone usuario y contraseña, y ve el dashboard
4. Los datos se actualizan solos cada 30 segundos

## ¿Qué ve?

- **Ventas hoy**: total, cantidad de transacciones, items vendidos
- **Ticket promedio**: cuánto gastó cada cliente en promedio hoy
- **Métodos de pago**: efectivo, tarjeta, transferencia — separado con montos
- **Stock bajo**: productos que se están por acabar (con alerta roja si ya no hay)
- **Más vendidos**: top 5 productos de los últimos 7 días
- **Deudores**: clientes que le deben plata, con el saldo exacto

## ¿Qué NO puede hacer?

Solo muestra información. No se puede modificar nada desde el celular. No se pueden registrar ventas, cambiar precios, ni borrar productos. Es solo para mirar.

## Seguridad

- Login propio (usuario y contraseña distintos al sistema)
- El túnel de Cloudflare es cifrado (HTTPS)
- No requiere abrir puertos en el router
- Si se corta la luz o internet, el monitor deja de funcionar pero el negocio sigue andando normal

## Beneficios para el cliente

| Dolor | Solución |
|-------|----------|
| "No puedo ir al negocio hoy y quiero saber cuánto se vendió" | Abrí el celular y ves las ventas al instante |
| "No sé si falta mercadería" | El monitor te muestra productos con stock bajo |
| "Los empleados no me dicen la verdad" | Ves las ventas en tiempo real, no hay forma de ocultar |
| "No sé quién me debe plata" | El monitor te lista los deudores con sus saldos |

## Speech de venta (30 segundos)

> "Además del sistema en la PC, tenemos un monitor que ves desde el celular. Estando en tu casa, de vacaciones, o en el depósito, abrís el celular y ves cuánto se vendió hoy, qué falta comprar y quién te debe plata. No podés modificar nada, solo mirar. Está conectado por Cloudflare, que es el mismo sistema que usan los bancos. Es seguro."

## Objeción: "¿Y si se ve lo que no quiero?"

> "Solo muestra números generales: total de ventas, stock bajo, deudores. No muestra productos específicos ni precios de costo si no querés. Además cada persona tiene su propia contraseña."

## Objeción: "¿Y si no tengo internet?"

> "El monitor necesita internet para verse desde el celular. Pero el negocio sigue funcionando igual aunque no haya internet. El monitor es un plus, no un requisito."

## Precio

- Incluido en **Plan Pro** ($120K ARS único)
- Disponible como **add-on** para Suscripción ($6K ARS/mes incluye monitor)
- **No disponible** en Plan Básico (solo sistema local)
