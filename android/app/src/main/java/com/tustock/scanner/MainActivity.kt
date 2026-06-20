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
    private lateinit var scanButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusIndicator = findViewById(R.id.statusIndicator)
        statusText = findViewById(R.id.statusText)
        serverUrlInput = findViewById(R.id.serverUrlInput)
        connectButton = findViewById(R.id.connectButton)
        scanButton = findViewById(R.id.scanButton)

        val savedUrl = prefs.getString("server_url", "http://192.168.1.100:8090")
        serverUrlInput.setText(savedUrl)
        ApiClient.baseUrl = savedUrl ?: "http://192.168.1.100:8090"

        connectButton.setOnClickListener { checkConnection() }
        scanButton.setOnClickListener { startScanner() }

        findViewById<Button>(R.id.settingsButton).setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        scope.launch {
            delay(500)
            checkConnection()
        }
    }

    private fun checkConnection() {
        statusText.text = "Verificando conexion..."
        statusIndicator.setBackgroundColor(getColor(android.R.color.holo_orange_light))

        val url = serverUrlInput.text.toString().trim()
        if (url.isNotEmpty()) {
            ApiClient.baseUrl = url
            prefs.edit().putString("server_url", url).apply()
        }

        scope.launch {
            val ok = ApiClient.healthCheck()
            if (ok) {
                statusText.text = "Conectado a $url"
                statusIndicator.setBackgroundColor(getColor(android.R.color.holo_green_light))
                scanButton.isEnabled = true
                Toast.makeText(this@MainActivity, "Servidor conectado", Toast.LENGTH_SHORT).show()
            } else {
                statusText.text = "Sin conexion - Verifique la URL y que el servidor este corriendo"
                statusIndicator.setBackgroundColor(getColor(android.R.color.holo_red_light))
                scanButton.isEnabled = false
            }
        }
    }

    private fun startScanner() {
        startActivity(Intent(this, ScannerActivity::class.java))
    }

    override fun onDestroy() {
        scope.cancel()
        super.onDestroy()
    }
}
