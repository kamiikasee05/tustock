"""Genera la guía de usuario de TUSTOCK en PDF."""

from fpdf import FPDF
import os

class GuidePDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(120, 120, 120)
            self.cell(0, 8, "TUSTOCK - Guia de Usuario", align="L")
            self.cell(0, 8, f"Pagina {self.page_no()}", align="R", new_x="LMARGIN", new_y="NEXT")
            self.line(10, 16, 200, 16)
            self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 7)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, "Generado el " + self.guide_date, align="C")

    def chapter_title(self, title):
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(33, 37, 41)
        self.cell(0, 12, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(13, 110, 253)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(6)

    def section_title(self, title):
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(13, 110, 253)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def body_text(self, text):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(33, 37, 41)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bullet(self, text):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(33, 37, 41)
        x = self.get_x()
        self.cell(6, 5.5, "-")
        self.multi_cell(0, 5.5, text)
        self.ln(1)

    def step(self, num, text):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(13, 110, 253)
        self.cell(0, 6, f"Paso {num}:", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 10)
        self.set_text_color(33, 37, 41)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def note_box(self, text):
        self.set_fill_color(255, 243, 205)
        self.set_text_color(102, 77, 3)
        self.set_font("Helvetica", "I", 9)
        y = self.get_y()
        self.set_x(12)
        self.multi_cell(186, 5, f"  NOTA: {text}", fill=True)
        self.ln(3)

    def tip_box(self, text):
        self.set_fill_color(209, 231, 221)
        self.set_text_color(15, 81, 50)
        self.set_font("Helvetica", "I", 9)
        self.set_x(12)
        self.multi_cell(186, 5, f"  CONSEJO: {text}", fill=True)
        self.ln(3)


def generate_pdf(path):
    pdf = GuidePDF()
    pdf.guide_date = ""

    import datetime
    pdf.guide_date = datetime.date.today().strftime("%d/%m/%Y")

    pdf.set_auto_page_break(auto=True, margin=20)

    # --- PORTADA ---
    pdf.add_page()
    pdf.ln(50)
    pdf.set_font("Helvetica", "B", 36)
    pdf.set_text_color(13, 110, 253)
    pdf.cell(0, 15, "TUSTOCK", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 18)
    pdf.set_text_color(73, 80, 87)
    pdf.cell(0, 12, "Sistema de Gestion de Stock", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)
    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(108, 117, 125)
    pdf.cell(0, 10, "Guia de Usuario", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 8, f"Version 1.0 - {pdf.guide_date}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(40)
    pdf.set_text_color(130, 130, 130)
    pdf.set_font("Helvetica", "I", 9)
    pdf.cell(0, 6, "Polirrubro - Merceria - Almacen", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, "Control de stock, ventas, clientes y codigos de barras", align="C", new_x="LMARGIN", new_y="NEXT")

    # --- TABLA DE CONTENIDOS ---
    pdf.add_page()
    pdf.chapter_title("Indice")
    toc = [
        ("1", "Introduccion"),
        ("2", "Requisitos del Sistema"),
        ("3", "Instalacion y Primer Uso"),
        ("4", "Inicio del Sistema"),
        ("5", "Pantalla Principal (Dashboard)"),
        ("6", "Gestion de Productos"),
        ("7", "Codigos de Barra"),
        ("8", "Control de Stock"),
        ("9", "Ventas (POS)"),
        ("10", "Ventas Fiado (a Credito)"),
        ("11", "Clientes"),
        ("12", "Vendedores"),
        ("13", "Informes y Reportes"),
        ("14", "Auditorias de Inventario"),
        ("15", "Presupuestos"),
        ("16", "Pedidos Pendientes"),
        ("17", "Conexion del Lector de Codigo de Barras"),
        ("18", "Uso con Dos Computadoras"),
        ("19", "Solucion de Problemas"),
        ("20", "Soporte Tecnico"),
    ]
    for num, title in toc:
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(33, 37, 41)
        pdf.cell(10, 7, num, align="R")
        pdf.cell(4, 7, "")
        pdf.cell(0, 7, title, new_x="LMARGIN", new_y="NEXT")

    # --- 1. INTRODUCCION ---
    pdf.add_page()
    pdf.chapter_title("1. Introduccion")
    pdf.body_text(
        "TUSTOCK es un sistema de gestion de stock y ventas disenado para polirrubros, "
        "mercerias, almacenes y comercios minoristas. Permite controlar el inventario, "
        "registrar ventas (contado y fiado), administrar clientes y vendedores, generar "
        "codigos de barras, y obtener reportes diarios."
    )
    pdf.body_text(
        "El sistema funciona ENTERAMENTE en red local, sin necesidad de conexion a Internet "
        "para operar. Todos los datos se almacenan en una base de datos local en la misma "
        "computadora donde se ejecuta el servidor."
    )
    pdf.body_text(
        "Caracteristicas principales:"
    )
    features = [
        "Registro de productos con codigos internos y codigos de barras generados automaticamente",
        "Control de stock con alertas de stock bajo",
        "Punto de venta (POS) con soporte para efectivo, tarjeta, transferencia y fiado",
        "Ventas a credito (fiado) con registro automatico de deudas",
        "Administracion de clientes con historial de deudas y pagos",
        "Generacion de codigos de barras Code128 imprimibles",
        "Reportes diarios y mensuales con exportacion a CSV",
        "Auditorias de inventario con conteo y correccion de diferencias",
        "Presupuestos y pedidos pendientes",
        "Soporte para lector de codigo de barras USB",
        "App Android complementaria (escaneo y pedidos moviles)",
    ]
    for f in features:
        pdf.bullet(f)

    # --- 2. REQUISITOS ---
    pdf.add_page()
    pdf.chapter_title("2. Requisitos del Sistema")
    pdf.body_text("Para utilizar TUSTOCK necesitas:")
    pdf.bullet("Computadora con Windows 10 o superior")
    pdf.bullet("Python 3.10 o superior instalado")
    pdf.bullet("4 GB de RAM (recomendado)")
    pdf.bullet("Resolucion de pantalla 1280x720 o superior")
    pdf.bullet("Acceso a la red local (si se usa desde otra PC)")
    pdf.bullet("Opcional: lector de codigo de barras USB")
    pdf.bullet("Opcional: impresora para etiquetas")

    pdf.note_box(
        "Si no tenes Python instalado, descargalo desde python.org. "
        "Durante la instalacion, tildá 'Add Python to PATH'."
    )

    # --- 3. INSTALACION ---
    pdf.add_page()
    pdf.chapter_title("3. Instalacion y Primer Uso")

    pdf.section_title("3.1 Descarga")
    pdf.body_text(
        "Descargá la ultima version del sistema desde GitHub. "
        "Descomprimí el contenido en una carpeta, por ejemplo C:\\TUSTOCK."
    )

    pdf.section_title("3.2 Instalacion Unica")
    pdf.body_text("La primera vez, ejecutá los siguientes pasos en orden:")

    pdf.step(1, 'Hace doble clic en el archivo "TUSTOCK.bat" (esta en la carpeta principal).')
    pdf.step(2, 'Si aparece un cartel de Windows sobre proteccion, hace clic en "Ejecutar de todas formas".')
    pdf.step(3, "El sistema abrira automaticamente el navegador en http://localhost:8090.")
    pdf.step(4, "Si no se instalo Python, segui las instrucciones que aparecen en pantalla.")

    pdf.tip_box(
        "La primera vez que ejecutes TUSTOCK.bat, se instalaran "
        "automaticamente las dependencias necesarias (FastAPI, SQLAlchemy, etc.)."
    )

    pdf.section_title("3.3 Configuracion Opcional")

    pdf.body_text("Acceso directo en el escritorio:")
    pdf.step(1, 'Ejecutá "Crear Acceso Directo.bat" dentro de la carpeta scripts.')
    pdf.step(2, "Se creara un acceso directo TUSTOCK en tu escritorio.")

    pdf.body_text("Inicio automatico con Windows:")
    pdf.step(1, 'Ejecutá "install-startup.bat" dentro de la carpeta scripts (como Administrador).')
    pdf.step(2, "El sistema arrancara solo cada vez que inicies la computadora.")

    pdf.note_box(
        "Para el inicio automatico necesitas permisos de Administrador. "
        "Hace clic derecho sobre el archivo y seleccioná 'Ejecutar como administrador'."
    )

    # --- 4. INICIO ---
    pdf.add_page()
    pdf.chapter_title("4. Inicio del Sistema")

    pdf.section_title("4.1 Encender el Sistema")
    pdf.body_text(
        "Para iniciar TUSTOCK, simplemente hace doble clic en el archivo "
        '"TUSTOCK.bat". Se abrira una ventana de comandos brevemente y luego '
        "se iniciara el servidor en segundo plano. Automaticamente se abrira "
        "el navegador con el sistema listo para usar."
    )

    pdf.section_title("4.2 Detener el Sistema")
    pdf.body_text(
        'Para apagar el sistema, ejecutá "scripts\\stop.bat" o cerra la ventana '
        "del servidor si esta visible. Tambien podes reiniciar la computadora."
    )

    pdf.section_title("4.3 Acceder desde Otra Computadora")
    pdf.body_text(
        "Si queres usar TUSTOCK desde otra computadora en la misma red:"
    )
    pdf.step(1, "Anotá la direccion IP que muestra el Dashboard (ej: 192.168.1.100).")
    pdf.step(2, "En la otra computadora, abri el navegador y escribi http://192.168.1.100:8090")
    pdf.step(3, "Reemplazá 192.168.1.100 por la IP de la maquina donde corre el servidor.")

    # --- 5. DASHBOARD ---
    pdf.add_page()
    pdf.chapter_title("5. Pantalla Principal (Dashboard)")
    pdf.body_text(
        "Al entrar al sistema, se muestra el Dashboard con un resumen del dia:"
    )
    pdf.bullet("Ventas del dia: monto total y cantidad de transacciones")
    pdf.bullet("Ticket promedio: promedio por venta")
    pdf.bullet("Productos vendidos hoy")
    pdf.bullet("Alertas de stock bajo (productos con stock por debajo del minimo)")
    pdf.bullet("Accesos rapidos a las funciones principales")
    pdf.body_text(
        "Desde el menu lateral podes navegar a las distintas secciones: "
        "Productos, Ventas, Stock, Clientes, Vendedores, Reportes, Auditorias, "
        "Presupuestos y Pedidos."
    )

    # --- 6. PRODUCTOS ---
    pdf.add_page()
    pdf.chapter_title("6. Gestion de Productos")

    pdf.section_title("6.1 Agregar un Producto")
    pdf.step(1, 'Anda a la seccion "Productos" desde el menu.')
    pdf.step(2, 'Hace clic en "+ Nuevo producto".')
    pdf.step(3, "Completá los campos: Codigo, Nombre, Precios, Stock minimo, Unidad y Categoria.")
    pdf.step(4, 'Para generar un codigo automatico, hace clic en "Generar" al lado del campo Codigo.')
    pdf.step(5, 'Hace clic en "Crear producto".')

    pdf.section_title("6.2 Editar un Producto")
    pdf.body_text(
        "En la tabla de productos, hace clic en el icono de lapiz (Editar) "
        "para modificar precio, nombre, categoria, etc."
    )

    pdf.section_title("6.3 Buscar y Filtrar")
    pdf.body_text(
        "Usá el campo de busqueda para encontrar productos por nombre o codigo. "
        "Tambien podes filtrar por categoria usando el selector desplegable."
    )

    pdf.section_title("6.4 Stock Rapido")
    pdf.body_text(
        "Desde la tabla de productos podes ajustar el stock rapidamente "
        'con los botones "+1" y "-1" en la columna de acciones.'
    )

    pdf.tip_box(
        "El stock minimo sirve para recibir alertas cuando el stock "
        "esta por debajo de ese valor. Ajustalo segun tu ritmo de venta."
    )

    # --- 7. CODIGOS DE BARRA ---
    pdf.add_page()
    pdf.chapter_title("7. Codigos de Barra")

    pdf.body_text(
        "TUSTOCK genera codigos de barra en formato Code128, compatibles con "
        "lectores USB y la app Android. Cada codigo tiene 12 digitos y empieza "
        "con el digito 2."
    )

    pdf.section_title("7.1 Generar Codigo de Barra desde el Formulario")
    pdf.step(1, 'Al crear o editar un producto, busca el campo "Codigo de barras".')
    pdf.step(2, 'Hace clic en el boton "Generar" (al lado del campo).')
    pdf.step(3, "Se asignara automaticamente un numero unico de 12 digitos.")
    pdf.step(4, "Tambien podes escribir un codigo manualmente si el producto ya tiene uno.")

    pdf.section_title("7.2 Generar Codigo de Barra desde la Tabla")
    pdf.step(1, "En la lista de productos, los que NO tienen codigo muestran un boton 'Generar'.")
    pdf.step(2, "Hace clic en 'Generar' y se creara el codigo automaticamente.")
    pdf.step(3, "La tabla mostrara la etiqueta completa con el codigo de barras.")

    pdf.section_title("7.3 Imprimir Etiquetas")
    pdf.body_text(
        "Cada codigo de barras en la tabla se muestra como una etiqueta que incluye:"
    )
    pdf.bullet("El codigo de barras (imagen Code128)")
    pdf.bullet("El numero del codigo debajo")
    pdf.bullet("El nombre del producto")
    pdf.bullet("El precio de venta")
    pdf.body_text(
        "Para imprimir una etiqueta: hace clic derecho sobre la imagen "
        'y seleccioná "Guardar imagen como..." para descargarla. Luego imprimila '
        "y pegala en el producto. Tambien podes abrir la imagen en una pestana nueva "
        "e imprimir directamente desde el navegador."
    )

    pdf.tip_box(
        "Usá papel autoadhesivo (tipo etiqueta) para pegar los codigos "
        "en tus productos. Cualquier lector USB de codigo de barras los va a leer."
    )

    # --- 8. STOCK ---
    pdf.add_page()
    pdf.chapter_title("8. Control de Stock")
    pdf.body_text(
        "La seccion de Stock muestra el nivel actual de todos los productos. "
        "Podes realizar movimientos manuales."
    )
    pdf.section_title("Registrar Movimiento")
    pdf.step(1, 'Anda a "Stock" en el menu.')
    pdf.step(2, 'Hace clic en "Registrar movimiento".')
    pdf.step(3, "Seleccioná producto, tipo (entrada/salida/ajuste), cantidad.")
    pdf.step(4, "Si es un ajuste, ingresá el nuevo stock deseado.")
    pdf.step(5, "Opcionalmente agregá una nota y guardá.")

    pdf.section_title("Alertas de Stock Bajo")
    pdf.body_text(
        "En el Dashboard se muestran los productos con stock por debajo del "
        "minimo configurado. Tambien hay un endpoint de alertas "
        "accesible desde la seccion Productos."
    )

    # --- 9. VENTAS ---
    pdf.add_page()
    pdf.chapter_title("9. Ventas (POS)")

    pdf.section_title("9.1 Realizar una Venta")
    pdf.step(1, 'Anda a "Ventas" y asegurate de estar en la pestana "Nueva venta".')
    pdf.step(2, "Escribi el codigo del producto en el campo de busqueda y presiona Enter.")
    pdf.step(3, "El producto se agrega al carrito. Repetí para cada producto.")
    pdf.step(4, "Ajustá las cantidades si es necesario.")
    pdf.step(5, "Ingresá el descuento si corresponde (en pesos).")
    pdf.step(6, "Seleccioná el metodo de pago: Efectivo, Tarjeta, Transferencia o Fiado.")
    pdf.step(7, 'Hace clic en "Cobrar X" para completar la venta.')

    pdf.section_title("9.2 Escaneo con Lector USB")
    pdf.body_text(
        "Conectá un lector de codigo de barras USB. Al escanear un producto, "
        "el codigo se escribe automaticamente en el campo de busqueda y se agrega "
        "al carrito. No necesitas configurar nada."
    )

    pdf.section_title("9.3 Historial de Ventas")
    pdf.body_text(
        "En la pestana 'Historial' de la seccion Ventas podes ver todas las "
        "ventas registradas, con fecha, total, metodo de pago y nombre del "
        "cliente si corresponde."
    )

    # --- 10. FIADO ---
    pdf.add_page()
    pdf.chapter_title("10. Ventas Fiado (a Credito)")

    pdf.body_text(
        "TUSTOCK permite vender 'fiado' a clientes registrados. "
        "La deuda se registra automaticamente en la cuenta del cliente."
    )

    pdf.section_title("10.1 Realizar una Venta Fiado")
    pdf.step(1, "En la pantalla de ventas, agregá los productos al carrito.")
    pdf.step(2, 'En "Metodo de pago", seleccioná "Fiado".')
    pdf.step(3, "Va a aparecer un selector de clientes. Elegí el cliente.")
    pdf.step(4, 'Hace clic en "Cobrar".')
    pdf.body_text(
        "El sistema crea automaticamente una deuda (CustomerTransaction tipo 'debt') "
        "por el monto total de la venta, asociada al cliente."
    )

    pdf.section_title("10.2 Cobrar Deuda (Pago)")
    pdf.step(1, 'Anda a la seccion "Clientes".')
    pdf.step(2, "Hace clic en el cliente que va a pagar.")
    pdf.step(3, 'En "Registrar Pago", ingresá el monto.')
    pdf.step(4, "El saldo del cliente se actualiza automaticamente.")

    pdf.tip_box(
        "El saldo del cliente se calcula como: Total de deudas - Total de pagos. "
        "Un saldo positivo significa que debe dinero."
    )

    # --- 11. CLIENTES ---
    pdf.add_page()
    pdf.chapter_title("11. Clientes")

    pdf.body_text(
        "Los clientes pueden registrarse opcionalmente. Son necesarios para "
        "las ventas fiado."
    )

    pdf.section_title("11.1 Agregar Cliente")
    pdf.step(1, 'Anda a "Clientes".')
    pdf.step(2, 'Completá nombre y opcionalmente DNI, telefono y notas.')
    pdf.step(3, 'Hace clic en "Agregar cliente".')

    pdf.section_title("11.2 Ver Detalle del Cliente")
    pdf.body_text(
        "Haciendo clic en un cliente se ve su informacion completa: "
        "datos de contacto, saldo actual, historial de transacciones "
        "(deudas y pagos) con fechas y montos."
    )

    pdf.section_title("11.3 Desactivar Cliente")
    pdf.body_text(
        "Para desactivar un cliente (sin eliminar su historial), "
        'hace clic en "Desactivar" en el detalle del cliente.'
    )

    # --- 12. VENDEDORES ---
    pdf.add_page()
    pdf.chapter_title("12. Vendedores")

    pdf.body_text(
        "Los vendedores se identifican por DNI y pueden realizar ventas "
        "y pedidos desde la app Android."
    )

    pdf.section_title("12.1 Agregar Vendedor")
    pdf.step(1, 'Anda a "Vendedores".')
    pdf.step(2, "Ingresá nombre y DNI.")
    pdf.step(3, 'Hace clic en "Agregar".')

    pdf.section_title("12.2 Login del Vendedor en Android")
    pdf.body_text(
        "En la app Android, el vendedor ingresa su DNI para identificarse "
        "y puede realizar pedidos que quedan registrados a su nombre."
    )

    # --- 13. INFORMES ---
    pdf.add_page()
    pdf.chapter_title("13. Informes y Reportes")

    pdf.body_text(
        "La seccion Reportes muestra un resumen diario: total de ventas, "
        "cantidad de transacciones, productos mas vendidos, "
        "desglose por metodo de pago."
    )

    pdf.section_title("13.1 Ver Reporte Diario")
    pdf.step(1, 'Anda a "Reportes".')
    pdf.step(2, "Se muestra el reporte del dia actual automaticamente.")
    pdf.step(3, "Usá el selector de fecha para ver dias anteriores.")

    pdf.section_title("13.2 Exportar a CSV")
    pdf.body_text(
        "Podes exportar los reportes mensuales a CSV para abrirlos en Excel:"
    )
    pdf.step(1, 'Anda a la pestana "Mensual" en Reportes.')
    pdf.step(2, 'Seleccioná mes y ano.')
    pdf.step(3, 'Hace clic en "Exportar CSV".')

    pdf.section_title("13.3 Generar Reporte")
    pdf.body_text(
        "Si el reporte de un dia no existe, se puede generar manualmente "
        "desde el boton 'Generar reporte'."
    )

    # --- 14. AUDITORIAS ---
    pdf.add_page()
    pdf.chapter_title("14. Auditorias de Inventario")

    pdf.body_text(
        "Las auditorias permiten comparar el stock teorico (del sistema) "
        "con el stock real (contado fisicamente) y aplicar correcciones."
    )

    pdf.section_title("14.1 Crear una Auditoria")
    pdf.step(1, 'Anda a "Auditorias".')
    pdf.step(2, 'Hace clic en "Nueva auditoria".')
    pdf.step(3, "Opcionalmente agregá una nota.")
    pdf.step(4, "Se crea la auditoria con todos los productos activos.")

    pdf.section_title("14.2 Realizar el Conteo")
    pdf.step(1, 'Hace clic en "Iniciar" en la auditoria.')
    pdf.step(2, "Escaneá o escribí el codigo de cada producto.")
    pdf.step(3, "Ingresá la cantidad real contada.")
    pdf.step(4, "El sistema calcula automaticamente la diferencia.")

    pdf.section_title("14.3 Completar Auditoria")
    pdf.step(1, 'Hace clic en "Completar".')
    pdf.step(2, "Se aplican las correcciones al stock (stock real = stock contado).")
    pdf.step(3, "Se genera un resumen con las diferencias encontradas.")

    pdf.tip_box(
        "Hacé auditorias periodicamente (ej: una vez por mes) "
        "para mantener el stock del sistema sincronizado con el stock real."
    )

    # --- 15. PRESUPUESTOS ---
    pdf.add_page()
    pdf.chapter_title("15. Presupuestos")

    pdf.body_text(
        "Los presupuestos permiten cotizar productos a clientes sin afectar el stock."
    )

    pdf.section_title("15.1 Crear Presupuesto")
    pdf.step(1, 'Anda a "Presupuestos".')
    pdf.step(2, "Agregá productos con sus cantidades.")
    pdf.step(3, "Opcionalmente ingresá el nombre del cliente.")
    pdf.step(4, 'Hace clic en "Crear presupuesto".')

    pdf.section_title("15.2 Aprobar o Rechazar")
    pdf.body_text(
        "Los presupuestos pueden aprobarse (se descuenta stock automaticamente) "
        "o rechazarse. El historial se conserva."
    )

    # --- 16. PEDIDOS ---
    pdf.add_page()
    pdf.chapter_title("16. Pedidos Pendientes")

    pdf.body_text(
        "Los vendedores pueden realizar pedidos desde la app Android "
        "que quedan pendientes de aprobacion."
    )

    pdf.section_title("16.1 Revisar Pedidos")
    pdf.step(1, 'Anda a "Pedidos pendientes".')
    pdf.step(2, "Se listan los pedidos recibidos con su estado.")

    pdf.section_title("16.2 Aprobar o Rechazar")
    pdf.step(1, "Hace clic en un pedido para ver su detalle.")
    pdf.step(2, "Seleccioná el metodo de pago: Efectivo, Tarjeta, Transferencia o Fiado.")
    pdf.step(3, 'Si elegís "Fiado", seleccioná el cliente al que se le registra la deuda.')
    pdf.step(4, 'Hace clic en "Aprobar y descontar stock" para generar la venta.')
    pdf.step(5, 'Hace clic en "Rechazar" si no corresponde.')
    pdf.body_text(
        "Al aprobar, se genera automaticamente una venta con el metodo de pago "
        "seleccionado. Si es fiado, se crea la deuda en el cliente. "
        "Tambien existe un boton 'Limpiar' para borrar todos los "
        "pedidos pendientes de un vendedor."
    )

    # --- 17. LECTOR ---
    pdf.add_page()
    pdf.chapter_title("17. Conexion del Lector de Codigo de Barras")

    pdf.body_text(
        "TUSTOCK es compatible con cualquier lector de codigo de barras USB "
        'que emule teclado (la mayoria del mercado).'
    )

    pdf.section_title("17.1 Instalacion")
    pdf.step(1, "Conectá el lector USB a la computadora.")
    pdf.step(2, "Windows lo reconoce automaticamente como teclado.")
    pdf.step(3, "No necesita drivers ni configuracion adicional.")

    pdf.section_title("17.2 Uso en Ventas")
    pdf.body_text(
        "Con el foco en el campo de busqueda de productos, escaneá el codigo "
        "de barras. El codigo se escribe solo y el producto se agrega al carrito."
    )

    pdf.section_title("17.3 Uso en Auditorias")
    pdf.body_text(
        "Durante una auditoria, escaneá el producto y luego ingresá "
        "la cantidad contada manualmente."
    )

    pdf.note_box(
        "Si el lector agrega un Enter al final (lo mas comun), "
        "el producto se agrega automaticamente. Si no, presiona Enter manualmente."
    )

    # --- 18. DOS PCS ---
    pdf.add_page()
    pdf.chapter_title("18. Uso con Dos Computadoras")

    pdf.body_text(
        "TUSTOCK permite usar una computadora como servidor (donde corre "
        "el sistema) y otra como cliente (solo navegador web)."
    )

    pdf.section_title("18.1 En la PC Servidor")
    pdf.step(1, "Iniciá TUSTOCK normalmente (doble clic en TUSTOCK.bat).")
    pdf.step(2, 'Anotá la direccion IP que aparece en el Dashboard (ej: 192.168.1.100).')

    pdf.section_title("18.2 En la PC Cliente")
    pdf.step(1, "Asegurate de que ambas PCs esten en la misma red WiFi o cable.")
    pdf.step(2, "Abri el navegador web (Chrome, Edge, etc.).")
    pdf.step(3, "Escribi http://192.168.1.100:8090 (reemplazá con la IP del servidor).")
    pdf.step(4, "El sistema se abre igual que en el servidor.")

    pdf.body_text(
        "La PC cliente NO necesita Python ni nada instalado, solo un navegador. "
        "Todas las funciones disponibles en el servidor tambien funcionan desde el cliente."
    )

    pdf.tip_box(
        "Para usar la app Android desde otra computadora, conectá el "
        "telefono a la misma red WiFi y configura la IP del servidor en "
        "la pantalla de Conexion de la app."
    )

    # --- 19. SOLUCION DE PROBLEMAS ---
    pdf.add_page()
    pdf.chapter_title("19. Solucion de Problemas")

    problems = [
        ("El sistema no abre el navegador",
         "Ejecutá manualmente scripts\\start.bat y esperá 5 segundos. "
         "Luego abri http://localhost:8090 manualmente."),
        ("Error: 'python' no se reconoce",
         "Python no esta instalado o no esta en el PATH. "
         "Descargalo desde python.org y durante la instalacion "
         "tildá 'Add Python to PATH'."),
        ("Pantalla en blanco o errores en el navegador",
         "Presioná F12 para abrir la consola del navegador. "
         "Los errores en rojo ayudan a diagnosticar. "
         "Verificá que el servidor este corriendo (revisá si hay un proceso pythonw)."),
        ("Error de conexion: no se puede conectar al servidor",
         "Verificá que el servidor este encendido. "
         "Ejecutá scripts\\start.bat y fijate si se abre el navegador. "
         "Si estas desde otra PC, verificá la IP y que ambas esten en la misma red."),
        ("El codigo de barras no se escanea",
         "Verificá que el producto tenga un codigo de barras asignado. "
         "En la tabla de productos, si no aparece imagen, hace clic en 'Generar'. "
         "El lector debe estar conectado antes de abrir el sistema."),
        ("Se crearon dos ventas sin querer",
         "Esperá a que el boton 'Cobrar' se active nuevamente. "
         "Tiene proteccion contra doble clic."),
        ("Error al guardar un producto: 'codigo ya esta en uso'",
         "El codigo interno (TST...) ya existe. Generá uno nuevo "
         "con el boton 'Generar' al lado del campo Codigo."),
        ("No aparecen los productos en la app Android",
         "Verificá la conexion WiFi y que la IP del servidor este bien "
         "configurada en la app. Probá desde el navegador del telefono "
         "accediendo a http://IP:8090."),
    ]

    for title, desc in problems:
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(220, 53, 69)
        pdf.cell(0, 7, title, new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(33, 37, 41)
        pdf.multi_cell(0, 5, desc)
        pdf.ln(4)

    # --- 20. SOPORTE ---
    pdf.add_page()
    pdf.chapter_title("20. Soporte Tecnico")
    pdf.body_text(
        "Para reportar errores o solicitar ayuda:"
    )
    pdf.bullet("GitHub: https://github.com/kamiikasee05/tustock")
    pdf.bullet("Reportá un issue en la seccion Issues del repositorio")
    pdf.body_text(
        "Incluí en tu reporte: descripcion del problema, pasos para reproducirlo, "
        "y el contenido del archivo server\\logs\\server.log si existe."
    )

    pdf.ln(10)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(130, 130, 130)
    pdf.cell(0, 6, "Documento generado automaticamente.", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, "TUSTOCK v1.0", align="C", new_x="LMARGIN", new_y="NEXT")

    # --- GUARDAR ---
    pdf.output(path)
    print(f"PDF generado: {path}")


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Guia de Usuario TUSTOCK.pdf")
    generate_pdf(out)
