package com.tustock.scanner

import android.content.SharedPreferences
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.*

class SettingsActivity : AppCompatActivity() {
    private val prefs by lazy { getSharedPreferences("tustock_prefs", MODE_PRIVATE) }
    private val scope = CoroutineScope(Dispatchers.Main + Job())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        val urlInput = findViewById<EditText>(R.id.urlInput)
        val saveButton = findViewById<Button>(R.id.saveButton)
        val testButton = findViewById<Button>(R.id.testButton)

        // Check if we came from scanner with a code to register
        val registerCode = intent.getStringExtra("register_code")
        if (registerCode != null) {
            findViewById<EditText>(R.id.registerCodeInput)?.setText(registerCode)
            findViewById<android.view.View>(R.id.registerSection)?.visibility = android.view.View.VISIBLE
        }

        val savedUrl = prefs.getString("server_url", "http://192.168.1.100:8090")
        urlInput.setText(savedUrl)

        saveButton.setOnClickListener {
            val url = urlInput.text.toString().trim()
            if (url.isNotEmpty()) {
                prefs.edit().putString("server_url", url).apply()
                ApiClient.baseUrl = url
                Toast.makeText(this, "URL guardada", Toast.LENGTH_SHORT).show()
                finish()
            }
        }

        testButton.setOnClickListener {
            val url = urlInput.text.toString().trim()
            if (url.isNotEmpty()) {
                ApiClient.baseUrl = url
                prefs.edit().putString("server_url", url).apply()
                scope.launch {
                    val ok = ApiClient.healthCheck()
                    Toast.makeText(
                        this@SettingsActivity,
                        if (ok) "Conexión exitosa" else "No se pudo conectar",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }

        // Register product handler
        findViewById<Button>(R.id.registerSubmitButton)?.setOnClickListener {
            val code = findViewById<EditText>(R.id.registerCodeInput)?.text?.toString()?.trim() ?: ""
            val name = findViewById<EditText>(R.id.registerNameInput)?.text?.toString()?.trim() ?: ""
            val price = findViewById<EditText>(R.id.registerPriceInput)?.text?.toString()?.toDoubleOrNull() ?: 0.0

            if (code.isEmpty() || name.isEmpty()) {
                Toast.makeText(this, "Código y nombre son requeridos", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            scope.launch {
                val result = ApiClient.createProduct(
                    CreateProductRequest(
                        code = code,
                        name = name,
                        selling_price = price
                    )
                )
                result.onSuccess {
                    Toast.makeText(this@SettingsActivity, "Producto registrado: ${it.name}", Toast.LENGTH_SHORT).show()
                    finish()
                }
                result.onFailure {
                    Toast.makeText(this@SettingsActivity, "Error: ${it.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    override fun onDestroy() {
        scope.cancel()
        super.onDestroy()
    }
}
