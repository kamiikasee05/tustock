package com.tustock.scanner

import android.Manifest
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.*
import java.io.File
import java.util.concurrent.Executors

class StockMainActivity : AppCompatActivity() {
    private val scope = CoroutineScope(Dispatchers.Main + Job())
    private val analyzerExecutor = Executors.newSingleThreadExecutor()
    private val gson = Gson()
    private var isProcessing = false
    private var lastScannedCode: String? = null
    private var lastScanTime = 0L
    private var imageAnalysis: ImageAnalysis? = null
    private val prefs by lazy { getSharedPreferences("tustock_prefs", MODE_PRIVATE) }
    private var lastNewName: String = ""

    // CSV take session
    private var csvActive = false
    private var activeCsvFile: File? = null
    private var csvLines = 0
    private val csvItems = HashSet<String>()
    private val catalogList = mutableListOf<ProductResponse>()
    private val catalogByKey = HashMap<String, ProductResponse>()

    // UI refs
    private lateinit var startTakeButton: Button
    private lateinit var sessionBar: View
    private lateinit var sessionInfo: TextView
    private lateinit var sessionCsvName: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_stock_main)

        val savedUrl = prefs.getString("server_url", "http://192.168.1.100:8090")
        ApiClient.baseUrl = savedUrl ?: "http://192.168.1.100:8090"

        startTakeButton = findViewById(R.id.startTakeButton)
        sessionBar = findViewById(R.id.sessionBar)
        sessionInfo = findViewById(R.id.sessionInfo)
        sessionCsvName = findViewById(R.id.sessionCsvName)

        findViewById<Button>(R.id.configButton).setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        startTakeButton.setOnClickListener { startTake() }
        findViewById<Button>(R.id.shareButton).setOnClickListener { shareCsv() }
        findViewById<Button>(R.id.newTakeButton).setOnClickListener { newTake() }

        restoreSession()

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), 300)
        } else {
            startCamera()
        }
    }

    private fun startTake() {
        scope.launch {
            startTakeButton.isEnabled = false
            startTakeButton.text = "Descargando..."
            val (catalog, status) = downloadCatalogForTake()
            val file = CsvToma.createCsvFile(this@StockMainActivity)
            activeCsvFile = file
            csvLines = 0
            csvItems.clear()
            csvActive = true
            persistSession()
            updateSessionUi()
            startTakeButton.text = "Iniciar toma"
            startTakeButton.isEnabled = true
            startTakeButton.visibility = View.GONE
            sessionBar.visibility = View.VISIBLE
            val msg = when (status) {
                "cache" -> "Toma iniciada — sin red, usando catálogo guardado (${catalog.size} productos)"
                "none" -> "Toma iniciada — sin catálogo: todo se guarda como (no registrado)"
                else -> "Toma iniciada — catálogo descargado (${catalog.size} productos)"
            }
            Toast.makeText(this@StockMainActivity, msg, Toast.LENGTH_LONG).show()
        }
    }

    private suspend fun downloadCatalogForTake(): Pair<List<ProductResponse>, String> {
        val online = ApiClient.downloadCatalog()
        if (online.isSuccess) {
            catalogList.clear()
            catalogList.addAll(online.getOrThrow())
            buildCatalogIndex()
            saveCatalogCache()
            return Pair(catalogList.toList(), "online")
        }
        val cached = loadCatalogCache()
        if (cached != null) {
            catalogList.clear()
            catalogList.addAll(cached)
            buildCatalogIndex()
            return Pair(catalogList.toList(), "cache")
        }
        return Pair(emptyList(), "none")
    }

    private fun buildCatalogIndex() {
        catalogByKey.clear()
        for (p in catalogList) indexProduct(p)
    }

    private fun indexProduct(p: ProductResponse) {
        catalogByKey[p.code] = p
        catalogByKey[p.code.lowercase()] = p
        val b = p.barcode
        if (!b.isNullOrBlank()) {
            catalogByKey[b] = p
            catalogByKey[b.lowercase()] = p
        }
    }

    private fun saveCatalogCache() {
        scope.launch {
            withContext(Dispatchers.IO) {
                runCatching { CsvToma.catalogFile(this@StockMainActivity).writeText(gson.toJson(catalogList)) }
            }
        }
    }

    private fun loadCatalogCache(): List<ProductResponse>? {
        return runCatching {
            val type = object : TypeToken<List<ProductResponse>>() {}.type
            gson.fromJson<List<ProductResponse>>(CsvToma.catalogFile(this).readText(), type)
        }.getOrNull()
    }

    private fun persistSession() {
        val e = prefs.edit()
        val file = activeCsvFile
        if (csvActive && file != null) e.putString("csv_active_path", file.absolutePath)
        else e.remove("csv_active_path")
        e.apply()
    }

    private fun restoreSession() {
        val path = prefs.getString("csv_active_path", null) ?: return
        val file = File(path)
        if (!file.exists()) {
            prefs.edit().remove("csv_active_path").apply()
            return
        }
        val info = CsvToma.readCsv(file)
        activeCsvFile = file
        csvLines = info.lines
        csvItems.clear()
        csvItems.addAll(info.distinctBarcodes)
        csvActive = true
        startTakeButton.visibility = View.GONE
        sessionBar.visibility = View.VISIBLE
        updateSessionUi()
        Toast.makeText(this, "Toma en curso retomada — ${file.name}", Toast.LENGTH_LONG).show()
    }

    private fun updateSessionUi() {
        sessionInfo.text = "Líneas: $csvLines · Productos: ${csvItems.size}"
        sessionCsvName.text = activeCsvFile?.name ?: ""
    }

    private fun appendCsvLine(barcode: String, qty: Int, name: String) {
        val file = activeCsvFile ?: return
        scope.launch {
            withContext(Dispatchers.IO) { CsvToma.appendLine(file, barcode, qty, name) }
            csvLines++
            csvItems.add(barcode)
            updateSessionUi()
            persistSession()
        }
    }

    private fun shareCsv() {
        val file = activeCsvFile ?: return
        if (!file.exists()) {
            Toast.makeText(this, "El archivo CSV no existe", Toast.LENGTH_SHORT).show()
            return
        }
        val uri: Uri = FileProvider.getUriForFile(this, "${packageName}.fileprovider", file)
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/csv"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, "Toma de stock ${file.name}")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        startActivity(Intent.createChooser(intent, "Enviar CSV de toma de stock"))
    }

    private fun newTake() {
        val msg = if (csvLines > 0)
            "La toma actual tiene $csvLines líneas. ¿Empezar una nueva?"
            else "¿Empezar una nueva toma?"
        AlertDialog.Builder(this)
            .setTitle("Nueva toma")
            .setMessage("$msg\nSi querés guardar la actual, enviá el CSV antes de empezar.")
            .setPositiveButton("Nueva toma") { _, _ ->
                val file = CsvToma.createCsvFile(this)
                activeCsvFile = file
                csvLines = 0
                csvItems.clear()
                persistSession()
                updateSessionUi()
                Toast.makeText(this, "Nueva toma iniciada", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    override fun onResume() {
        super.onResume()
        isProcessing = false
        lastScannedCode = null
        hideAllCards()
        findViewById<TextView>(R.id.scanHint).visibility = View.VISIBLE
    }

    private fun hideAllCards() {
        findViewById<View>(R.id.resultCard).visibility = View.GONE
        findViewById<View>(R.id.notFoundCard).visibility = View.GONE
    }

    override fun onRequestPermissionsResult(
        requestCode: Int, permissions: Array<out String>, grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 300 && grantResults.isNotEmpty()
            && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            startCamera()
        }
    }

    private fun startCamera() {
        val previewView = findViewById<androidx.camera.view.PreviewView>(R.id.previewView)
        val scanHint = findViewById<TextView>(R.id.scanHint)
        val resultCard = findViewById<View>(R.id.resultCard)
        val productName = findViewById<TextView>(R.id.productNameText)
        val productCode = findViewById<TextView>(R.id.productCodeText)
        val productPrice = findViewById<TextView>(R.id.productPriceText)
        val productStock = findViewById<TextView>(R.id.productStockText)
        val addStockBtn = findViewById<Button>(R.id.addStockButton)
        val quantityInput = findViewById<EditText>(R.id.quantityInput)
        val scanAgainBtn = findViewById<Button>(R.id.scanAgainButton)
        val registerBtn = findViewById<Button>(R.id.registerProductButton)
        val newNameInput = findViewById<EditText>(R.id.newProductNameInput)

        val notFoundCard = findViewById<View>(R.id.notFoundCard)
        val notFoundCode = findViewById<TextView>(R.id.notFoundCode)
        val regNameInput = findViewById<EditText>(R.id.registerNameInput)
        val regPriceInput = findViewById<EditText>(R.id.registerPriceInput)
        val regQtyInput = findViewById<EditText>(R.id.registerQuantityInput)
        val regSubmitBtn = findViewById<Button>(R.id.registerSubmitButton)
        val notFoundAgainBtn = findViewById<Button>(R.id.notFoundAgainButton)

        var lastScanned: ProductResponse? = null
        var lastScannedName: String = ""

        scanAgainBtn.setOnClickListener {
            resultCard.visibility = View.GONE
            newNameInput.visibility = View.GONE
            lastScannedCode = null
            isProcessing = false
            scanHint.visibility = View.VISIBLE
        }

        notFoundAgainBtn.setOnClickListener {
            notFoundCard.visibility = View.GONE
            lastScannedCode = null
            isProcessing = false
            scanHint.visibility = View.VISIBLE
        }

        // "Registrar en el sistema" from the result card (product not in offline catalog)
        registerBtn.setOnClickListener {
            val code = lastScannedCode ?: return@setOnClickListener
            resultCard.visibility = View.GONE
            notFoundCode.text = "Codigo: $code"
            regNameInput.text.clear()
            regPriceInput.text.clear()
            regQtyInput.text.clear()
            notFoundCard.visibility = View.VISIBLE
            scanHint.visibility = View.GONE
        }

        // --- Button: save CSV line (take mode) OR adjust stock (normal mode) ---
        addStockBtn.setOnClickListener {
            val qtyStr = quantityInput.text.toString()
            val product = lastScanned
            val code = lastScannedCode ?: return@setOnClickListener

            if (csvActive) {
                val qty = qtyStr.toIntOrNull()
                if (qty == null || qty < 1) {
                    Toast.makeText(this, "Ingresá una cantidad válida (mínimo 1)", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }
                val name = if (product == null) {
                    val typed = newNameInput.text.toString().trim()
                    if (typed.length < 2) {
                        Toast.makeText(this, "Ingresá el nombre del producto (mínimo 2 letras)", Toast.LENGTH_SHORT).show()
                        return@setOnClickListener
                    }
                    lastNewName = typed
                    typed
                } else lastScannedName
                appendCsvLine(code, qty, name)
                Toast.makeText(this, "✓ $name x$qty", Toast.LENGTH_SHORT).show()
                resultCard.visibility = View.GONE
                newNameInput.visibility = View.GONE
                lastScannedCode = null
                isProcessing = false
                quantityInput.setText("")
                scanHint.visibility = View.VISIBLE
            } else {
                val qty = qtyStr.toDoubleOrNull() ?: 1.0
                val prod = product ?: return@setOnClickListener
                addStockBtn.isEnabled = false
                addStockBtn.text = "Cargando..."
                scope.launch {
                    val result = ApiClient.adjustStock(prod.id, qty)
                    result.onSuccess {
                        val newStock = prod.stock + qty
                        productStock.text = "Stock: $newStock ${prod.unit}"
                        quantityInput.text.clear()
                        Toast.makeText(this@StockMainActivity, "+${qty.toInt()} ${prod.name}", Toast.LENGTH_SHORT).show()
                    }
                    result.onFailure {
                        Toast.makeText(this@StockMainActivity, "Error: ${it.message}", Toast.LENGTH_SHORT).show()
                    }
                    addStockBtn.isEnabled = true
                    addStockBtn.text = "Agregar al stock"
                }
            }
        }

        // --- Button: register new product (online, both modes) ---
        regSubmitBtn.setOnClickListener {
            val code = lastScannedCode ?: return@setOnClickListener
            val name = regNameInput.text.toString().trim()
            val price = regPriceInput.text.toString().toDoubleOrNull() ?: 0.0
            val qty = regQtyInput.text.toString().toDoubleOrNull() ?: 0.0

            if (name.isEmpty()) {
                Toast.makeText(this, "Ingrese el nombre", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            regSubmitBtn.isEnabled = false
            regSubmitBtn.text = "Registrando..."

            scope.launch {
                val result = ApiClient.createProduct(
                    CreateProductRequest(
                        code = "TST-${System.currentTimeMillis()}",
                        name = name,
                        selling_price = price,
                        barcode = code,
                        initial_stock = qty
                    )
                )
                result.onSuccess { product ->
                    catalogList.add(product)
                    indexProduct(product)
                    Toast.makeText(this@StockMainActivity, "${product.name} registrado", Toast.LENGTH_SHORT).show()
                    notFoundCard.visibility = View.GONE
                    lastScannedCode = null
                    isProcessing = false
                    scanHint.visibility = View.VISIBLE
                }
                result.onFailure {
                    Toast.makeText(this@StockMainActivity, "Error: ${it.message}", Toast.LENGTH_LONG).show()
                }
                regSubmitBtn.isEnabled = true
                regSubmitBtn.text = "Registrar producto"
            }
        }

        // --- Camera + ML Kit setup ---
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(previewView.surfaceProvider)
            }

            imageAnalysis = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also { analysis ->
                    analysis.setAnalyzer(analyzerExecutor) { imageProxy ->
                        if (isProcessing) { imageProxy.close(); return@setAnalyzer }

                        val mediaImage = imageProxy.image ?: run { imageProxy.close(); return@setAnalyzer }

                        val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
                        val scanner = BarcodeScanning.getClient()

                        scanner.process(image)
                            .addOnSuccessListener { barcodes ->
                                if (barcodes.isNotEmpty()) {
                                    val code = barcodes[0].rawValue ?: return@addOnSuccessListener
                                    val now = System.currentTimeMillis()
                                    if (code == lastScannedCode && now - lastScanTime < 2000) {
                                        imageProxy.close(); return@addOnSuccessListener
                                    }
                                    lastScannedCode = code
                                    lastScanTime = now
                                    isProcessing = true

                                    runOnUiThread {
                                        scanHint.text = "Procesando $code..."
                                        if (csvActive) {
                                            // TAKE MODE: resolve locally from catalog, no round-trip
                                            val product = catalogByKey[code] ?: catalogByKey[code.lowercase()]
                                            lastScanned = product
                                            lastScannedName = product?.name ?: ""
                                            resultCard.visibility = View.GONE
                                            notFoundCard.visibility = View.GONE
                                            productName.text = product?.name ?: "Producto nuevo"
                                            productCode.text = "Codigo: $code"
                                            if (product != null) {
                                                productPrice.text = "Stock en sistema: ${product.stock.toInt()}"
                                                newNameInput.visibility = View.GONE
                                            } else {
                                                productPrice.text = "No esta en el catalogo - cargá el nombre"
                                                newNameInput.setText(lastNewName)
                                                newNameInput.setSelection(0, newNameInput.text.length)
                                                newNameInput.visibility = View.VISIBLE
                                                newNameInput.requestFocus()
                                            }
                                            productStock.visibility = View.GONE
                                            quantityInput.hint = "Cuantos hay?"
                                            quantityInput.setText("")
                                            addStockBtn.text = "Guardar"
                                            registerBtn.visibility = if (product == null) View.VISIBLE else View.GONE
                                            resultCard.visibility = View.VISIBLE
                                            scanHint.visibility = View.GONE
                                            isProcessing = false
                                        } else {
                                            // NORMAL MODE: online lookup
                                            scope.launch {
                                                val result = ApiClient.scanProduct(code)
                                                result.onSuccess { product ->
                                                    lastScanned = product
                                                    resultCard.visibility = View.GONE
                                                    notFoundCard.visibility = View.GONE

                                                    productName.text = product.name
                                                    productCode.text = "Codigo: ${product.code}"
                                                    productPrice.text = "Precio: $${product.selling_price}"
                                                    productStock.visibility = View.VISIBLE
                                                    productStock.text = "Stock: ${product.stock} ${product.unit}"
                                                    quantityInput.hint = "Cant."
                                                    quantityInput.setText("1")
                                                    addStockBtn.text = "Agregar al stock"
                                                    registerBtn.visibility = View.GONE

                                                    resultCard.visibility = View.VISIBLE
                                                    scanHint.visibility = View.GONE
                                                    isProcessing = false
                                                }
                                                result.onFailure {
                                                    resultCard.visibility = View.GONE
                                                    notFoundCard.visibility = View.GONE

                                                    notFoundCode.text = "Codigo: $code"
                                                    regNameInput.text.clear()
                                                    regPriceInput.text.clear()
                                                    regQtyInput.text.clear()
                                                    notFoundCard.visibility = View.VISIBLE
                                                    scanHint.visibility = View.GONE
                                                    isProcessing = false
                                                }
                                            }
                                        }
                                    }
                                }
                                imageProxy.close()
                            }
                            .addOnFailureListener { imageProxy.close() }
                    }
                }

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(this@StockMainActivity, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageAnalysis)
            } catch (e: Exception) {
                Toast.makeText(this, "Error camara: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }, ContextCompat.getMainExecutor(this))
    }

    override fun onDestroy() {
        scope.cancel()
        analyzerExecutor.shutdown()
        super.onDestroy()
    }
}
