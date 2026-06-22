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

data class VendorResponse(
    val id: Int,
    val dni: String,
    val name: String
)

data class OrderItem(
    val product_id: Int,
    val code: String,
    val name: String,
    val quantity: Double,
    val unit_price: Double
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
    var currentVendor: VendorResponse? = null

    private fun authorizedBuilder(): Request.Builder =
        Request.Builder().addHeader("Authorization", "Bearer $token")

    // --- Products ---

    suspend fun scanProduct(code: String): Result<ProductResponse> = withContext(Dispatchers.IO) {
        try {
            val request = authorizedBuilder()
                .url("$baseUrl/api/products/scan/$code")
                .get()
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val body = response.body?.string() ?: throw Exception("Respuesta vacia")
                val product = gson.fromJson(body, ProductResponse::class.java)
                Result.success(product)
            } else {
                Result.failure(Exception("Producto no encontrado"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Error de conexion: ${e.message}"))
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
                val respBody = response.body?.string() ?: throw Exception("Respuesta vacia")
                val created = gson.fromJson(respBody, ProductResponse::class.java)
                Result.success(created)
            } else {
                Result.failure(Exception("Error al crear producto"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Error: ${e.message}"))
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
            val body = StockAdjustRequest(product_id = productId, quantity = quantity, movement_type = "entry", notes = "Carga inicial desde app")
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

    // --- Vendors ---

    suspend fun vendorLogin(dni: String): Result<VendorResponse> = withContext(Dispatchers.IO) {
        try {
            val json = gson.toJson(mapOf("dni" to dni))
            val request = authorizedBuilder()
                .url("$baseUrl/api/vendors/login")
                .post(json.toRequestBody(jsonType))
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val body = response.body?.string() ?: throw Exception("Respuesta vacia")
                val vendor = gson.fromJson(body, VendorResponse::class.java)
                currentVendor = vendor
                Result.success(vendor)
            } else {
                Result.failure(Exception("DNI no registrado"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Error: ${e.message}"))
        }
    }

    // --- Pending Orders ---

    data class PendingOrderRequest(
        val vendor_id: Int,
        val items: List<OrderItem>
    )

    data class PendingOrderResponse(
        val id: Int,
        val total: Double,
        val status: String
    )

    suspend fun submitOrder(items: List<OrderItem>): Result<PendingOrderResponse> = withContext(Dispatchers.IO) {
        try {
            val vendorId = currentVendor?.id ?: return@withContext Result.failure(Exception("No hay vendedor logueado"))
            val req = PendingOrderRequest(vendor_id = vendorId, items = items)
            val json = gson.toJson(req)
            val request = authorizedBuilder()
                .url("$baseUrl/api/pending-orders")
                .post(json.toRequestBody(jsonType))
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val body = response.body?.string() ?: throw Exception("Respuesta vacia")
                val result = gson.fromJson(body, PendingOrderResponse::class.java)
                Result.success(result)
            } else {
                Result.failure(Exception("Error al enviar pedido"))
            }
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
