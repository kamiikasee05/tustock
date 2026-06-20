package com.tustock.scanner

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.*
import java.util.concurrent.Executors

class ScannerActivity : AppCompatActivity() {
    private var imageAnalysis: ImageAnalysis? = null
    private var lastScannedCode: String? = null
    private var lastScanTime = 0L
    private val scope = CoroutineScope(Dispatchers.Main + Job())
    private val analyzerExecutor = Executors.newSingleThreadExecutor()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_scanner)

        val previewView = findViewById<androidx.camera.view.PreviewView>(R.id.previewView)
        val overlayText = findViewById<android.view.View>(R.id.overlayText) as? android.widget.TextView
        val resultCard = findViewById<android.view.View>(R.id.resultCard)
        val productNameText = findViewById<android.widget.TextView>(R.id.productNameText)
        val productCodeText = findViewById<android.widget.TextView>(R.id.productCodeText)
        val productPriceText = findViewById<android.widget.TextView>(R.id.productPriceText)
        val productStockText = findViewById<android.widget.TextView>(R.id.productStockText)
        val registerButton = findViewById<android.widget.Button>(R.id.registerButton)
        val scanAgainButton = findViewById<android.widget.Button>(R.id.scanAgainButton)

        var lastScanned: ProductResponse? = null

        startCamera()

        scanAgainButton.setOnClickListener {
            resultCard.visibility = View.GONE
            lastScannedCode = null
            startCamera()
        }

        registerButton.setOnClickListener {
            val code = lastScanned?.code ?: lastScannedCode ?: return@setOnClickListener
            val intent = android.content.Intent(this, SettingsActivity::class.java).apply {
                putExtra("register_code", code)
            }
            startActivity(intent)
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
                        processImageProxy(imageProxy) { barcode ->
                            val code = barcode.rawValue ?: return@processImageProxy
                            val now = System.currentTimeMillis()
                            if (code == lastScannedCode && now - lastScanTime < 3000) {
                                imageProxy.close()
                                return@processImageProxy
                            }
                            lastScannedCode = code
                            lastScanTime = now

                            runOnUiThread {
                                imageAnalysis?.clearAnalyzer()
                                overlayText?.text = "Escaneado: $code\nConsultando servidor..."
                                overlayText?.visibility = View.VISIBLE

                                scope.launch {
                                    val result = ApiClient.scanProduct(code)
                                    overlayText?.visibility = View.GONE

                                    result.onSuccess { product ->
                                        lastScanned = product
                                        productNameText.text = product.name
                                        productCodeText.text = "Código: ${product.code}"
                                        productPriceText.text = "Precio: $${product.selling_price}"
                                        productStockText.text = "Stock: ${product.stock} ${product.unit}"
                                        resultCard.visibility = View.VISIBLE

                                        if (product.stock <= 5) {
                                            productStockText.setTextColor(
                                                if (product.stock == 0.0)
                                                    getColor(android.R.color.holo_red_dark)
                                                else
                                                    getColor(android.R.color.holo_orange_dark)
                                            )
                                        }
                                    }

                                    result.onFailure { error ->
                                        Toast.makeText(
                                            this@ScannerActivity,
                                            error.message ?: "Error",
                                            Toast.LENGTH_LONG
                                        ).show()
                                        overlayText?.text = "Producto no encontrado: $code\n¿Registrarlo?"
                                        overlayText?.visibility = View.VISIBLE
                                        registerButton.visibility = View.VISIBLE
                                    }
                                }
                            }
                        }
                        imageProxy.close()
                    }
                }

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    this,
                    CameraSelector.DEFAULT_BACK_CAMERA,
                    preview,
                    imageAnalysis
                )
            } catch (e: Exception) {
                Toast.makeText(this, "Error al iniciar cámara: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun processImageProxy(imageProxy: ImageProxy, onBarcodeDetected: (Barcode) -> Unit) {
        val mediaImage = imageProxy.image
        if (mediaImage != null) {
            val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
            val scanner = BarcodeScanning.getClient()

            scanner.process(image)
                .addOnSuccessListener { barcodes ->
                    if (barcodes.isNotEmpty()) {
                        onBarcodeDetected(barcodes[0])
                    }
                }
                .addOnFailureListener {
                    // Silently ignore scan failures
                }
        }
    }

    private fun startCamera() {
        // Camera is started in the ProcessCameraProvider listener
    }

    override fun onDestroy() {
        scope.cancel()
        analyzerExecutor.shutdown()
        super.onDestroy()
    }
}
