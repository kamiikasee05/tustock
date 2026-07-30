package com.tustock.scanner

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.*
import java.util.concurrent.Executors

class StockMainActivity : AppCompatActivity() {
    private val scope = CoroutineScope(Dispatchers.Main + Job())
    private val analyzerExecutor = Executors.newSingleThreadExecutor()
    private var isProcessing = false
    private var lastScannedCode: String? = null
    private var lastScanTime = 0L
    private var imageAnalysis: ImageAnalysis? = null
    private val prefs by lazy { getSharedPreferences("tustock_prefs", MODE_PRIVATE) }

    // Audit mode
    private var auditMode = false
    private var currentAuditId: Int? = null
    private var isSettingToggle = false
    private var auditScannedCount = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_stock_main)

        val savedUrl = prefs.getString("server_url", "http://192.168.1.100:8090")
        ApiClient.baseUrl = savedUrl ?: "http://192.168.1.100:8090"

        findViewById<Button>(R.id.configButton).setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        val auditToggle = findViewById<Switch>(R.id.auditToggle)
        auditToggle.setOnCheckedChangeListener { _, isChecked ->
            if (isSettingToggle) return@setOnCheckedChangeListener
            if (isChecked) startAuditMode() else finishAuditMode()
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), 300)
        } else {
            startCamera()
        }
    }

    private fun startAuditMode() {
        scope.launch {
            val result = ApiClient.createAudit()
            result.onSuccess { audit ->
                // Start the audit (status → in_progress)
                ApiClient.startAudit(audit.id)
                currentAuditId = audit.id
                auditMode = true
                auditScannedCount = 0
                Toast.makeText(this@StockMainActivity,
                    "Auditoría #${audit.id} iniciada — escaneá y decí cuántos hay",
                    Toast.LENGTH_LONG).show()
                hideAllCards()
                findViewById<TextView>(R.id.scanHint).visibility = View.VISIBLE
            }
            result.onFailure {
                isSettingToggle = true
                findViewById<Switch>(R.id.auditToggle).isChecked = false
                isSettingToggle = false
                Toast.makeText(this@StockMainActivity,
                    "Error al crear auditoría: ${it.message}",
                    Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun finishAuditMode() {
        val auditId = currentAuditId ?: run {
            auditMode = false
            return
        }
        scope.launch {
            val result = ApiClient.completeAudit(auditId)
            result.onSuccess { response ->
                val msg = if (response.corrections_applied)
                    "✅ Auditoría #$auditId completada — stock corregido"
                    else "Auditoría #$auditId completada (sin correcciones)"
                Toast.makeText(this@StockMainActivity, msg, Toast.LENGTH_LONG).show()
                auditMode = false
                currentAuditId = null
                auditScannedCount = 0
                hideAllCards()
                findViewById<TextView>(R.id.scanHint).visibility = View.VISIBLE
            }
            result.onFailure {
                Toast.makeText(this@StockMainActivity,
                    "Error al completar: ${it.message}",
                    Toast.LENGTH_LONG).show()
            }
        }
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

        val notFoundCard = findViewById<View>(R.id.notFoundCard)
        val notFoundCode = findViewById<TextView>(R.id.notFoundCode)
        val regNameInput = findViewById<EditText>(R.id.registerNameInput)
        val regPriceInput = findViewById<EditText>(R.id.registerPriceInput)
        val regQtyInput = findViewById<EditText>(R.id.registerQuantityInput)
        val regSubmitBtn = findViewById<Button>(R.id.registerSubmitButton)
        val notFoundAgainBtn = findViewById<Button>(R.id.notFoundAgainButton)

        var lastScanned: ProductResponse? = null

        scanAgainBtn.setOnClickListener {
            resultCard.visibility = View.GONE
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

        // --- Button: add stock (normal) OR save count (audit) ---
        addStockBtn.setOnClickListener {
            val qtyStr = quantityInput.text.toString()
            val qty = qtyStr.toDoubleOrNull() ?: if (auditMode) 0.0 else 1.0
            val product = lastScanned ?: return@setOnClickListener

            addStockBtn.isEnabled = false

            if (auditMode && currentAuditId != null) {
                // AUDIT MODE: save counted quantity
                addStockBtn.text = "Guardando..."
                scope.launch {
                    val result = ApiClient.updateAuditItem(currentAuditId!!, product.id, qty)
                    result.onSuccess { response ->
                        auditScannedCount++
                        val diff = response.difference
                        val sign = if (diff > 0) "+" else ""
                        Toast.makeText(this@StockMainActivity,
                            "${product.name}: ${qty.toInt()} (${sign}${diff.toInt()})",
                            Toast.LENGTH_SHORT).show()
                        resultCard.visibility = View.GONE
                        lastScannedCode = null
                        isProcessing = false
                        scanHint.visibility = View.VISIBLE
                    }
                    result.onFailure {
                        Toast.makeText(this@StockMainActivity, "Error: ${it.message}", Toast.LENGTH_LONG).show()
                    }
                    addStockBtn.isEnabled = true
                    addStockBtn.text = "Guardar conteo"
                }
            } else {
                // NORMAL MODE: add stock
                addStockBtn.text = "Cargando..."
                scope.launch {
                    val result = ApiClient.adjustStock(product.id, qty)
                    result.onSuccess {
                        val newStock = product.stock + qty
                        productStock.text = "Stock: $newStock ${product.unit}"
                        quantityInput.text.clear()
                        Toast.makeText(this@StockMainActivity, "+${qty.toInt()} ${product.name}", Toast.LENGTH_SHORT).show()
                    }
                    result.onFailure {
                        Toast.makeText(this@StockMainActivity, "Error: ${it.message}", Toast.LENGTH_SHORT).show()
                    }
                    addStockBtn.isEnabled = true
                    addStockBtn.text = "Agregar al stock"
                }
            }
        }

        // --- Button: register new product (both modes) ---
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
                                        scanHint.text = "Buscando $code..."
                                        scope.launch {
                                            val result = ApiClient.scanProduct(code)
                                            result.onSuccess { product ->
                                                lastScanned = product
                                                resultCard.visibility = View.GONE
                                                notFoundCard.visibility = View.GONE

                                                productName.text = product.name
                                                productCode.text = "Codigo: ${product.code}"

                                                if (auditMode && currentAuditId != null) {
                                                    // AUDIT: show theoretical stock, ask "cuantos hay?"
                                                    productPrice.text = "Stock en sistema: ${product.stock.toInt()}"
                                                    productStock.visibility = View.GONE
                                                    quantityInput.hint = "Cuantos hay?"
                                                    quantityInput.setText("")
                                                    addStockBtn.text = "Guardar conteo"
                                                } else {
                                                    // NORMAL: show price + stock
                                                    productPrice.text = "Precio: $${product.selling_price}"
                                                    productStock.visibility = View.VISIBLE
                                                    productStock.text = "Stock: ${product.stock} ${product.unit}"
                                                    quantityInput.hint = "Cant."
                                                    quantityInput.setText("1")
                                                    addStockBtn.text = "Agregar al stock"
                                                }

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
