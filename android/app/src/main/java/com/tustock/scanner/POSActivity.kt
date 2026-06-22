package com.tustock.scanner

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
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

class POSActivity : AppCompatActivity() {
    private val scope = CoroutineScope(Dispatchers.Main + Job())
    private val analyzerExecutor = Executors.newSingleThreadExecutor()
    private var isProcessing = false
    private var lastScannedCode: String? = null
    private var lastScanTime = 0L

    private val cartItems = mutableListOf<OrderItem>()
    private var imageAnalysis: ImageAnalysis? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_pos)

        val vendor = ApiClient.currentVendor
        findViewById<TextView>(R.id.vendorLabel).text = vendor?.name ?: "Vendedor"

        findViewById<Button>(R.id.logoutButton).setOnClickListener { finish() }
        findViewById<Button>(R.id.clearButton).setOnClickListener { clearCart() }
        findViewById<Button>(R.id.sendButton).setOnClickListener { sendOrder() }

        updateCartUI()

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), 200)
        } else {
            startCamera()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int, permissions: Array<out String>, grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 200 && grantResults.isNotEmpty()
            && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            startCamera()
        }
    }

    override fun onResume() {
        super.onResume()
        isProcessing = false
        lastScannedCode = null
    }

    private fun startCamera() {
        val previewView = findViewById<androidx.camera.view.PreviewView>(R.id.previewView)
        val scanHint = findViewById<TextView>(R.id.scanHint)

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
                                        scanHint.text = "Escaneado: $code"
                                        scope.launch {
                                            val result = ApiClient.scanProduct(code)

                                            result.onSuccess { product ->
                                                val existing = cartItems.find { it.product_id == product.id }
                                                if (existing != null) {
                                                    val idx = cartItems.indexOf(existing)
                                                    cartItems[idx] = existing.copy(quantity = existing.quantity + 1)
                                                } else {
                                                    cartItems.add(OrderItem(
                                                        product_id = product.id,
                                                        code = product.code,
                                                        name = product.name,
                                                        quantity = 1.0,
                                                        unit_price = product.selling_price
                                                    ))
                                                }
                                                updateCartUI()
                                                scanHint.text = "+1 ${product.name}"
                                                isProcessing = false
                                            }

                                            result.onFailure {
                                                scanHint.text = "No encontrado: $code"
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
                    this@POSActivity,
                    CameraSelector.DEFAULT_BACK_CAMERA,
                    preview,
                    imageAnalysis
                )
            } catch (e: Exception) {
                Toast.makeText(this, "Error camara: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun updateCartUI() {
        val container = findViewById<LinearLayout>(R.id.cartItemsContainer)
        val totalText = findViewById<TextView>(R.id.cartTotal)
        val countText = findViewById<TextView>(R.id.cartCount)
        val sendButton = findViewById<Button>(R.id.sendButton)

        container.removeAllViews()
        var total = 0.0

        for (item in cartItems) {
            val row = LayoutInflater.from(this).inflate(R.layout.cart_item_row, container, false)
            row.findViewById<TextView>(R.id.itemName).text = item.name
            row.findViewById<TextView>(R.id.itemQty).text = "x${item.quantity.toInt()}"
            val subtotal = item.quantity * item.unit_price
            row.findViewById<TextView>(R.id.itemSubtotal).text = "$${String.format("%.0f", subtotal)}"

            row.findViewById<Button>(R.id.itemRemove).setOnClickListener {
                cartItems.remove(item)
                updateCartUI()
            }

            row.setOnClickListener {
                val idx = cartItems.indexOf(item)
                cartItems[idx] = item.copy(quantity = item.quantity + 1)
                updateCartUI()
            }

            container.addView(row)
            total += subtotal
        }

        totalText.text = "$${String.format("%.0f", total)}"
        countText.text = "${cartItems.size} items"
        sendButton.isEnabled = cartItems.isNotEmpty()
        sendButton.alpha = if (cartItems.isNotEmpty()) 1.0f else 0.5f
    }

    private fun sendOrder() {
        if (cartItems.isEmpty()) return
        android.app.AlertDialog.Builder(this)
            .setTitle("Enviar pedido")
            .setMessage("Enviar ${cartItems.size} productos?")
            .setPositiveButton("Si") { _, _ -> doSendOrder() }
            .setNegativeButton("No", null)
            .show()
    }

    private fun doSendOrder() {
        val btn = findViewById<Button>(R.id.sendButton)
        btn.isEnabled = false
        btn.text = "Enviando..."

        scope.launch {
            val result = ApiClient.submitOrder(cartItems.toList())
            result.onSuccess {
                Toast.makeText(this@POSActivity, "Pedido #${it.id} enviado", Toast.LENGTH_SHORT).show()
                cartItems.clear()
                updateCartUI()
            }
            result.onFailure {
                Toast.makeText(this@POSActivity, "Error: ${it.message}", Toast.LENGTH_LONG).show()
            }
            btn.isEnabled = true
            btn.text = "Enviar pedido"
        }
    }

    private fun clearCart() {
        if (cartItems.isEmpty()) return
        android.app.AlertDialog.Builder(this)
            .setTitle("Limpiar")
            .setMessage("Descartar ${cartItems.size} productos?")
            .setPositiveButton("Si") { _, _ ->
                cartItems.clear()
                updateCartUI()
            }
            .setNegativeButton("No", null)
            .show()
    }

    override fun onDestroy() {
        scope.cancel()
        analyzerExecutor.shutdown()
        super.onDestroy()
    }
}
