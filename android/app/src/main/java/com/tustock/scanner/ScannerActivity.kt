package com.tustock.scanner

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.*
import java.util.concurrent.Executors

class ScannerActivity : AppCompatActivity() {
    private var imageAnalysis: ImageAnalysis? = null
    private var lastScannedCode: String? = null
    private var lastScanTime = 0L
    private val scope = CoroutineScope(Dispatchers.Main + Job())
    private val analyzerExecutor = Executors.newSingleThreadExecutor()
    private var isProcessing = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_scanner)

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), 100)
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
        findViewById<TextView>(R.id.overlayText).visibility = View.VISIBLE
    }

    override fun onRequestPermissionsResult(
        requestCode: Int, permissions: Array<out String>, grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 100 && grantResults.isNotEmpty()
            && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            startCamera()
        } else {
            Toast.makeText(this, "Permiso de camara necesario", Toast.LENGTH_LONG).show()
            finish()
        }
    }

    private fun startCamera() {
        val previewView = findViewById<androidx.camera.view.PreviewView>(R.id.previewView)
        val overlayText = findViewById<TextView>(R.id.overlayText)
        val resultCard = findViewById<View>(R.id.resultCard)
        val productNameText = findViewById<TextView>(R.id.productNameText)
        val productCodeText = findViewById<TextView>(R.id.productCodeText)
        val productPriceText = findViewById<TextView>(R.id.productPriceText)
        val productStockText = findViewById<TextView>(R.id.productStockText)
        val scanAgainButton = findViewById<Button>(R.id.scanAgainButton)

        val notFoundCard = findViewById<View>(R.id.notFoundCard)
        val notFoundCode = findViewById<TextView>(R.id.notFoundCode)
        val registerButton = findViewById<Button>(R.id.registerButton)
        val scanAgainFromNotFound = findViewById<Button>(R.id.scanAgainFromNotFoundButton)

        scanAgainButton.setOnClickListener {
            resultCard.visibility = View.GONE
            lastScannedCode = null
            isProcessing = false
            overlayText.visibility = View.VISIBLE
        }

        scanAgainFromNotFound.setOnClickListener {
            notFoundCard.visibility = View.GONE
            lastScannedCode = null
            isProcessing = false
            overlayText.visibility = View.VISIBLE
        }

        registerButton.setOnClickListener {
            val intent = android.content.Intent(this, SettingsActivity::class.java).apply {
                putExtra("register_code", lastScannedCode ?: "")
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
                        if (isProcessing) {
                            imageProxy.close()
                            return@setAnalyzer
                        }

                        val mediaImage = imageProxy.image ?: run {
                            imageProxy.close()
                            return@setAnalyzer
                        }

                        val image = InputImage.fromMediaImage(
                            mediaImage, imageProxy.imageInfo.rotationDegrees
                        )
                        val scanner = BarcodeScanning.getClient()

                        scanner.process(image)
                            .addOnSuccessListener { barcodes ->
                                if (barcodes.isNotEmpty()) {
                                    val code = barcodes[0].rawValue ?: return@addOnSuccessListener
                                    val now = System.currentTimeMillis()

                                    if (code == lastScannedCode && now - lastScanTime < 2000) {
                                        imageProxy.close()
                                        return@addOnSuccessListener
                                    }

                                    lastScannedCode = code
                                    lastScanTime = now
                                    isProcessing = true

                                    runOnUiThread {
                                        overlayText.text = "Escaneado: $code\nConsultando..."
                                        overlayText.visibility = View.VISIBLE

                                        scope.launch {
                                            val result = ApiClient.scanProduct(code)
                                            overlayText.visibility = View.GONE

                                            result.onSuccess { product ->
                                                resultCard.visibility = View.GONE
                                                notFoundCard.visibility = View.GONE

                                                productNameText.text = product.name
                                                productCodeText.text = "Codigo: ${product.code}"
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
                                                isProcessing = false
                                            }

                                            result.onFailure {
                                                resultCard.visibility = View.GONE
                                                notFoundCard.visibility = View.GONE

                                                notFoundCode.text = "Codigo: $code"
                                                notFoundCard.visibility = View.VISIBLE
                                                isProcessing = false
                                            }
                                        }
                                    }
                                }
                                imageProxy.close()
                            }
                            .addOnFailureListener {
                                imageProxy.close()
                            }
                    }
                }

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    this@ScannerActivity,
                    CameraSelector.DEFAULT_BACK_CAMERA,
                    preview,
                    imageAnalysis
                )
            } catch (e: Exception) {
                Toast.makeText(this, "Error al iniciar camara: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }, ContextCompat.getMainExecutor(this))
    }

    override fun onDestroy() {
        scope.cancel()
        analyzerExecutor.shutdown()
        super.onDestroy()
    }
}
