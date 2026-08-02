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
    val unit: String,
    val barcode: String? = null
)

data class ProductListResponse(
    val products: List<ProductResponse>,
    val total: Int,
    val page: Int,
    val page_size: Int,
    val total_pages: Int
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
    val unit: String = "unidad",
    val barcode: String? = null,
    val initial_stock: Double = 0.0
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
                .url("$baseUrl/api/products/scan/${java.net.URLEncoder.encode(code, "UTF-8")}")
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

    suspend fun fetchProducts(page: Int, pageSize: Int): Result<ProductListResponse> = withContext(Dispatchers.IO) {
        try {
            val request = authorizedBuilder()
                .url("$baseUrl/api/products?page=$page&page_size=$pageSize")
                .get()
                .build()
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val body = response.body?.string() ?: throw Exception("Respuesta vacia")
                Result.success(gson.fromJson(body, ProductListResponse::class.java))
            } else {
                Result.failure(Exception("Error al descargar catalogo (${response.code})"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Error de conexion: ${e.message}"))
        }
    }

    suspend fun downloadCatalog(): Result<List<ProductResponse>> = withContext(Dispatchers.IO) {
        try {
            val all = mutableListOf<ProductResponse>()
            var page = 1
            var totalPages = 1
            do {
                val request = authorizedBuilder()
                    .url("$baseUrl/api/products?page=$page&page_size=200")
                    .get()
                    .build()
                val response = client.newCall(request).execute()
                if (!response.isSuccessful) throw Exception("Error al descargar catalogo (${response.code})")
                val body = response.body?.string() ?: throw Exception("Respuesta vacia")
                val listResp = gson.fromJson(body, ProductListResponse::class.java)
                all.addAll(listResp.products)
                totalPages = listResp.total_pages
                page++
            } while (page <= totalPages)
            Result.success(all)
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

    // --- Audits ---

    data class AuditCreateResponse(
        val id: Int,
        val status: String,
        val items_count: Int
    )

    data class AuditItemUpdateRequest(
        val product_id: Int,
        val counted_qty: Double
    )

    data class AuditItemUpdateResponse(
        val product_id: Int,
        val theoretical: Double,
        val counted: Double,
        val difference: Double
    )

    data class AuditCompleteResponse(
        val id: Int,
        val status: String,
        val corrections_applied: Boolean
    )

    suspend fun createAudit(): Result<AuditCreateResponse> = withContext(Dispatchers.IO) {
        try {
            val json = gson.toJson(mapOf("created_by" to "app-stock"))
            val request = authorizedBuilder()
                .url("$baseUrl/api/audits")
                .post(json.toRequestBody(jsonType))
                .build()
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val body = response.body?.string() ?: throw Exception("Respuesta vacia")
                Result.success(gson.fromJson(body, AuditCreateResponse::class.java))
            } else {
                Result.failure(Exception("Error al crear auditoria"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Error: ${e.message}"))
        }
    }

    suspend fun startAudit(auditId: Int): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val request = authorizedBuilder()
                .url("$baseUrl/api/audits/$auditId/start")
                .post("{}".toRequestBody(jsonType))
                .build()
            val response = client.newCall(request).execute()
            if (response.isSuccessful) Result.success(Unit)
            else Result.failure(Exception("Error al iniciar auditoria"))
        } catch (e: Exception) {
            Result.failure(Exception("Error: ${e.message}"))
        }
    }

    suspend fun updateAuditItem(auditId: Int, productId: Int, countedQty: Double): Result<AuditItemUpdateResponse> = withContext(Dispatchers.IO) {
        try {
            val json = gson.toJson(AuditItemUpdateRequest(product_id = productId, counted_qty = countedQty))
            val request = authorizedBuilder()
                .url("$baseUrl/api/audits/$auditId/items")
                .put(json.toRequestBody(jsonType))
                .build()
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val body = response.body?.string() ?: throw Exception("Respuesta vacia")
                Result.success(gson.fromJson(body, AuditItemUpdateResponse::class.java))
            } else {
                Result.failure(Exception("Error al guardar conteo"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Error: ${e.message}"))
        }
    }

    suspend fun completeAudit(auditId: Int): Result<AuditCompleteResponse> = withContext(Dispatchers.IO) {
        try {
            val request = authorizedBuilder()
                .url("$baseUrl/api/audits/$auditId/complete?apply_corrections=true")
                .post("{}".toRequestBody(jsonType))
                .build()
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val body = response.body?.string() ?: throw Exception("Respuesta vacia")
                Result.success(gson.fromJson(body, AuditCompleteResponse::class.java))
            } else {
                Result.failure(Exception("Error al completar auditoria"))
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
