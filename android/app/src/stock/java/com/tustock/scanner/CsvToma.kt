package com.tustock.scanner

import android.content.Context
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object CsvToma {
    private val tsFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US)
    private val fileFormat = SimpleDateFormat("yyyyMMdd-HHmm", Locale.US)

    fun tomasDir(context: Context): File =
        File(context.filesDir, "tomas").apply { mkdirs() }

    fun catalogFile(context: Context): File =
        File(tomasDir(context), "catalogo.json")

    fun createCsvFile(context: Context): File {
        val dir = tomasDir(context)
        val name = "toma-stock-${fileFormat.format(Date())}.csv"
        val file = File(dir, name)
        FileOutputStream(file, true).use { out ->
            out.write("\uFEFF".toByteArray(Charsets.UTF_8))
            out.write("barcode;cantidad;nombre;precio;fecha\n".toByteArray(Charsets.UTF_8))
        }
        return file
    }

    fun appendLine(file: File, barcode: String, qty: Int, name: String, price: Double) {
        val timestamp = tsFormat.format(Date())
        val fields = listOf(barcode, qty.toString(), name, formatPrice(price), timestamp)
        val line = fields.joinToString(";") { quote(it) }
        FileOutputStream(file, true).use { out ->
            out.write((line + "\n").toByteArray(Charsets.UTF_8))
        }
    }

    private fun formatPrice(price: Double): String {
        return if (price == price.toLong().toDouble()) price.toLong().toString() else price.toString()
    }

    private fun quote(field: String): String {
        if (field.contains(';') || field.contains('"') || field.contains('\n') || field.contains('\r')) {
            return "\"" + field.replace("\"", "\"\"") + "\""
        }
        return field
    }

    data class CsvInfo(val lines: Int, val distinctBarcodes: List<String>)

    fun readCsv(file: File): CsvInfo {
        var lines = 0
        val seen = HashSet<String>()
        var first = true
        file.readLines(Charsets.UTF_8).forEach { raw ->
            val line = raw.removePrefix("\uFEFF").trimEnd('\r')
            if (line.isBlank()) return@forEach
            if (first) {
                first = false
                if (line.startsWith("barcode;")) return@forEach
            }
            lines++
            val bc = line.substringBefore(';').trim()
            if (bc.isNotEmpty()) seen.add(bc)
        }
        return CsvInfo(lines, seen.toList())
    }
}
