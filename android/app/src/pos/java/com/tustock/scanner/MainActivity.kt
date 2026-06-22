package com.tustock.scanner

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.*

class MainActivity : AppCompatActivity() {
    private val prefs by lazy { getSharedPreferences("tustock_prefs", MODE_PRIVATE) }
    private val scope = CoroutineScope(Dispatchers.Main + Job())

    private lateinit var statusIndicator: View
    private lateinit var statusText: TextView
    private lateinit var serverUrlInput: EditText
    private lateinit var connectButton: Button
    private lateinit var dniInput: EditText
    private lateinit var loginButton: Button
    private lateinit var loginError: TextView
    private var isConnected = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusIndicator = findViewById(R.id.statusIndicator)
        statusText = findViewById(R.id.statusText)
        serverUrlInput = findViewById(R.id.serverUrlInput)
        connectButton = findViewById(R.id.connectButton)
        dniInput = findViewById(R.id.dniInput)
        loginButton = findViewById(R.id.loginButton)
        loginError = findViewById(R.id.loginError)

        val savedUrl = prefs.getString("server_url", "http://192.168.1.100:8090")
        serverUrlInput.setText(savedUrl)
        ApiClient.baseUrl = savedUrl ?: "http://192.168.1.100:8090"

        connectButton.setOnClickListener { connect() }
        loginButton.setOnClickListener { login() }

        findViewById<Button>(R.id.configButton).setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        scope.launch {
            delay(500)
            connect()
        }
    }

    private fun connect() {
        statusText.text = "Verificando..."
        statusIndicator.setBackgroundColor(getColor(android.R.color.holo_orange_light))

        val url = serverUrlInput.text.toString().trim()
        if (url.isNotEmpty()) {
            ApiClient.baseUrl = url
            prefs.edit().putString("server_url", url).apply()
        }

        scope.launch {
            val ok = ApiClient.healthCheck()
            if (ok) {
                isConnected = true
                statusText.text = "Conectado a $url"
                statusIndicator.setBackgroundColor(getColor(android.R.color.holo_green_light))
                loginButton.isEnabled = true
                loginError.visibility = View.GONE
            } else {
                isConnected = false
                statusText.text = "Sin conexion - Verifique URL"
                statusIndicator.setBackgroundColor(getColor(android.R.color.holo_red_light))
                loginButton.isEnabled = false
            }
        }
    }

    private fun login() {
        val dni = dniInput.text.toString().trim()
        if (dni.isEmpty()) {
            loginError.text = "Ingrese su DNI"
            loginError.visibility = View.VISIBLE
            return
        }

        loginButton.isEnabled = false
        loginButton.text = "Ingresando..."
        loginError.visibility = View.GONE

        scope.launch {
            val result = ApiClient.vendorLogin(dni)
            loginButton.isEnabled = true
            loginButton.text = "Ingresar"

            result.onSuccess {
                startActivity(Intent(this@MainActivity, POSActivity::class.java))
            }
            result.onFailure {
                loginError.text = it.message ?: "DNI no registrado"
                loginError.visibility = View.VISIBLE
            }
        }
    }

    override fun onDestroy() {
        scope.cancel()
        super.onDestroy()
    }
}
