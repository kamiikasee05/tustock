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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_stock_main)

        val savedUrl = prefs.getString("server_url", "http://192.168.1.100:8090")
        ApiClient.baseUrl = savedUrl ?: "http://192.168.1.100:8090"

        findViewById<Button>(R.id.configButton).setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), 300)
        } else {
            startCamera()
        }
    }

    override fun onResume() {
        super.onResume()
        isProcessing = false
        lastScannedCode = null
        findViewById<View>(R.id.resultCard).visibility = View.GONE
        findViewById<View>(R.id.notFoundCard).visibility = View.GONE
        findViewById<TextView>(R.id.scanHint).visibility = View.VISIBLE
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

        addStockBtn.setOnClickListener {
            val qtyStr = quantityInput.text.toString()
            val qty = qtyStr.toDoubleOrNull() ?: 1.0
            val product = lastScanned ?: return@setOnClickListener

            addStockBtn.isEnabled = false
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
                    CreateProductRequest(code = code, name = name, selling_price = price)
                )
                result.onSuccess { product ->
                    if (qty > 0) {
                        ApiClient.adjustStock(product.id, qty)
                    }
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
                                                productPrice.text = "Precio: $${product.selling_price}"
                                                productStock.text = "Stock: ${product.stock} ${product.unit}"
                                                quantityInput.text.clear()
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
