package com.tustock.scanner

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
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

        val savedUrl = prefs.getString("server_url", "http://192.168.1.100:8090")
        urlInput.setText(savedUrl)
        if (savedUrl != null) ApiClient.baseUrl = savedUrl

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
                        if (ok) "Conexion exitosa" else "No se pudo conectar",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }

        val registerCode = intent.getStringExtra("register_code")
        val registerSection = findViewById<View>(R.id.registerSection)
        val codeInput = findViewById<EditText>(R.id.registerCodeInput)
        val nameInput = findViewById<EditText>(R.id.registerNameInput)
        val priceInput = findViewById<EditText>(R.id.registerPriceInput)
        val submitBtn = findViewById<Button>(R.id.registerSubmitButton)

        if (registerCode != null) {
            registerSection.visibility = View.VISIBLE
            codeInput.setText(registerCode)
            nameInput.requestFocus()
        }

        submitBtn.setOnClickListener {
            val code = codeInput.text.toString().trim()
            val name = nameInput.text.toString().trim()
            val price = priceInput.text.toString().toDoubleOrNull() ?: 0.0

            if (code.isEmpty() || name.isEmpty()) {
                Toast.makeText(this, "Codigo y nombre son requeridos", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            submitBtn.isEnabled = false
            submitBtn.text = "Registrando..."
            Toast.makeText(this, "Enviando a $savedUrl...", Toast.LENGTH_SHORT).show()

            scope.launch {
                val result = ApiClient.createProduct(
                    CreateProductRequest(code = code, name = name, selling_price = price)
                )
                submitBtn.isEnabled = true
                submitBtn.text = "Registrar producto"

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
