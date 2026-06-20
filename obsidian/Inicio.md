---
tags:
  - tustock
  - inicio
---

# TUSTOCK

> Sistema de gestión de stock para polirrubros. 100% local, sin internet, sin servidores externos.

## ¿Qué es TUSTOCK?

Un sistema completo para manejar el inventario de tu negocio, registrar ventas, hacer auditorías de stock y generar informes diarios. Todo corre en tu PC, sin depender de internet ni pagar suscripciones.

## Índice

- [[Guía de Usuario]] — Manual paso a paso de todas las funciones
- [[Instalación y Configuración]] — Cómo instalar y arrancar el sistema
- [[App Android - Scanner]] — Usar el celular como lector de códigos
- [[Auditorías de Stock]] — Cómo encontrar faltantes y sobrantes
- [[Backup y Restauración]] — Respaldos de la base de datos
- [[Arquitectura del Sistema]] — Detalles técnicos para desarrolladores

## Funcionalidades principales

| Módulo | ¿Qué hace? |
|--------|------------|
| **Dashboard** | Pantalla principal: ventas del día, alertas de stock bajo |
| **Productos** | Alta, baja, modificación de productos con código, precio y stock mínimo |
| **Ventas** | Punto de venta: escaneás el código, se arma el carrito, cobrás |
| **Auditorías** | Contás el stock físico y el sistema te dice qué falta o sobra |
| **Informes** | Reporte diario con total de ventas, métodos de pago y productos más vendidos |
| **Scanner Android** | App en el celular que lee códigos QR y de barras con la cámara |

## Modo de uso rápido

1. [[Instalación y Configuración|Instalá el sistema]] en la PC del local
2. Abrí `http://localhost:8090` en el navegador
3. [[Guía de Usuario#Productos|Cargá tus productos]] (código, nombre, precio, stock mínimo)
4. [[Guía de Usuario#Ventas|Registrá ventas]] escaneando códigos o con lector de barras USB
5. Al final del día, [[Guía de Usuario#Informes|generá el informe diario]]

## Versión Pro *(próximamente)*

La versión gratuita es 100% funcional y local. La versión Pro agregará:

- ☁️ Backup automático en la nube
- 🏪 Sincronización entre sucursales
- 📈 Reportes avanzados (márgenes, rotación, proyecciones)
