package com.tustock.scanner

import android.content.Context
import com.tustock.scanner.R

data class CatalogProduct(
    val barcode: String,
    val name: String,
    val brand: String,
    val category: String
)

object CatalogProvider {
    private val products = HashMap<String, CatalogProduct>()
    private var loaded = false

    fun load(context: Context) {
        if (loaded) return
        try {
            val inputStream = context.resources.openRawResource(R.raw.catalogo_arcor)
            val reader = inputStream.bufferedReader(Charsets.UTF_8)
            reader.useLines { lines ->
                lines.drop(1).forEach { line ->  // skip header
                    val parts = line.split(';', limit = 4)
                    if (parts.size >= 2) {
                        val barcode = parts[0].trim().removeSurrounding("\"")
                        val name = parts[1].trim().removeSurrounding("\"")
                        val brand = if (parts.size > 2) parts[2].trim().removeSurrounding("\"") else "ARCOR"
                        val category = if (parts.size > 3) parts[3].trim().removeSurrounding("\"") else ""
                        if (barcode.isNotEmpty()) {
                            products[barcode] = CatalogProduct(barcode, name, brand, category)
                        }
                    }
                }
            }
            loaded = true
        } catch (e: Exception) {
            // Silently fail — catalog unavailable
        }
    }

    fun lookup(barcode: String): CatalogProduct? {
        return products[barcode]
    }

    fun size(): Int = products.size

    fun isLoaded(): Boolean = loaded
}
