package com.tustock.scanner

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

data class ProductResponse(
    val id: Int,
    val code: String,
    val name: String,
    val description: String?,
    val selling_price: Double,
    val stock: Double,
    val unit: String
)

data class CreateProductRequest(
    val code: String,
    val name: String,
    val description: String = "",
    val cost_price: Double = 0.0,
    val selling_price: Double = 0.0,
    val min_stock: Int = 5,
    val unit: String = "unidad"
)

data class ErrorResponse(val detail: String?)

object ApiClient {
    private val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val jsonType = "application/json; charset=utf-8".toMediaType()

    var baseUrl: String = "http://192.168.1.100:8090"
    var token: String = "tustock-local-token"

    private fun authorizedBuilder(): Request.Builder =
        Request.Builder().addHeader("Authorization", "Bearer $token")

    suspend fun scanProduct(code: String): Result<ProductResponse> = withContext(Dispatchers.IO) {
        try {
            val request = authorizedBuilder()
                .url("$baseUrl/api/products/scan/$code")
                .get()
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val body = response.body?.string() ?: throw Exception("Respuesta vacía")
                val product = gson.fromJson(body, ProductResponse::class.java)
                Result.success(product)
            } else {
                val errorBody = response.body?.string() ?: ""
                val error = try {
                    gson.fromJson(errorBody, ErrorResponse::class.java)
                } catch (e: Exception) {
                    ErrorResponse("Error de conexión")
                }
                Result.failure(Exception(error.detail ?: "Producto no encontrado"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("No se puede conectar al servidor: ${e.message}"))
        }
    }

    suspend fun createProduct(product: CreateProductRequest): Result<ProductResponse> = withContext(Dispatchers.IO) {
        try {
            val json = gson.toJson(product)
            val body = json.toRequestBody(jsonType)
            val request = authorizedBuilder()
                .url("$baseUrl/api/products")
                .post(body)
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val respBody = response.body?.string() ?: throw Exception("Respuesta vacía")
                val created = gson.fromJson(respBody, ProductResponse::class.java)
                Result.success(created)
            } else {
                val errorBody = response.body?.string() ?: ""
                val error = try {
                    gson.fromJson(errorBody, ErrorResponse::class.java)
                } catch (e: Exception) {
                    ErrorResponse("Error al crear producto")
                }
                Result.failure(Exception(error.detail ?: "Error desconocido"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("No se puede conectar al servidor: ${e.message}"))
        }
    }

    data class StockAdjustRequest(
        val product_id: Int,
        val quantity: Double,
        val movement_type: String,
        val notes: String? = null
    )

    suspend fun adjustStock(productId: Int, quantity: Double): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val body = StockAdjustRequest(
                product_id = productId,
                quantity = quantity,
                movement_type = "entry",
                notes = "Carga inicial desde app"
            )
            val json = gson.toJson(body)
            val request = authorizedBuilder()
                .url("$baseUrl/api/stock/adjust")
                .post(json.toRequestBody(jsonType))
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) Result.success(Unit)
            else Result.failure(Exception("Error al cargar stock"))
        } catch (e: Exception) {
            Result.failure(Exception("Error: ${e.message}"))
        }
    }

    suspend fun healthCheck(): Boolean = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/api/health")
                .get()
                .build()
            client.newCall(request).execute().isSuccessful
        } catch (e: Exception) {
            false
        }
    }
}
