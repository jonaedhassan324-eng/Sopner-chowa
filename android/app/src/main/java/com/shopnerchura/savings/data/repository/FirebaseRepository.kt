package com.shopnerchura.savings.data.repository

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.shopnerchura.savings.data.model.*
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.*

class FirebaseRepository {
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()

    val currentUserId: String?
        get() = auth.currentUser?.uid

    val currentUserEmail: String?
        get() = auth.currentUser?.email

    suspend fun getUserProfile(uid: String): UserProfile? {
        return try {
            val snap = db.collection("users").document(uid).get().await()
            if (snap.exists()) snap.toObject(UserProfile::class.java) else null
        } catch (e: Exception) {
            null
        }
    }

    suspend fun saveUserProfile(profile: UserProfile) {
        db.collection("users").document(profile.uid).set(profile).await()
        if (profile.role == "super_admin") {
            db.collection("admins").document(profile.uid).set(mapOf("uid" to profile.uid, "email" to profile.email)).await()
        } else if (profile.role == "entry_operator") {
            db.collection("operators").document(profile.uid).set(mapOf("uid" to profile.uid, "email" to profile.email)).await()
        }
    }

    suspend fun getAllMembers(): List<UserProfile> {
        val snap = db.collection("users").get().await()
        return snap.toObjects(UserProfile::class.java).sortedBy { it.memberId }
    }

    suspend fun getMemberTransactions(memberUid: String): List<Transaction> {
        val snap = db.collection("transactions")
            .whereEqualTo("memberUid", memberUid)
            .get()
            .await()
        return snap.toObjects(Transaction::class.java).sortedByDescending { it.entryTimestamp }
    }

    suspend fun getAllTransactions(): List<Transaction> {
        val snap = db.collection("transactions")
            .get()
            .await()
        return snap.toObjects(Transaction::class.java).sortedByDescending { it.entryTimestamp }
    }

    suspend fun recordQuarterlyDeposit(
        member: UserProfile,
        amount: Double,
        quarter: String,
        fiscalYear: String,
        paymentMethod: String,
        paymentReference: String,
        note: String,
        operator: UserProfile
    ): Transaction {
        val dateStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        val timeStr = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()).format(Date())
        val rand = (1000..9999).random()
        val txnId = "TXN-${quarter.replace("-", "")}-$rand"

        val txn = Transaction(
            id = txnId,
            transactionId = txnId,
            memberUid = member.uid,
            memberId = member.memberId,
            memberName = member.displayName,
            quarter = quarter,
            fiscalYear = fiscalYear,
            amount = amount,
            depositDate = dateStr,
            entryTimestamp = timeStr,
            operatorUid = operator.uid,
            operatorName = operator.displayName,
            paymentMethod = paymentMethod,
            paymentReference = paymentReference,
            note = note,
            status = "confirmed",
            createdAt = timeStr
        )

        db.collection("transactions").document(txnId).set(txn).await()

        // Log audit event
        val logId = "LOG-${System.currentTimeMillis()}"
        val auditLog = AuditLog(
            id = logId,
            action = "DEPOSIT_RECORDED",
            performedByUid = operator.uid,
            performedByName = operator.displayName,
            performedByRole = operator.role,
            targetId = txnId,
            targetType = "transaction",
            details = "Recorded ৳$amount deposit for ${member.displayName} ($quarter)",
            timestamp = timeStr
        )
        db.collection("audit_logs").document(logId).set(auditLog).await()

        return txn
    }

    suspend fun reverseTransaction(txn: Transaction, reason: String, admin: UserProfile) {
        val timeStr = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()).format(Date())
        
        // 1. Mark original as reversed
        db.collection("transactions").document(txn.transactionId)
            .update(
                mapOf(
                    "status" to "reversed",
                    "reversalReason" to reason
                )
            ).await()

        // 2. Insert audited reversal record
        val revId = "REV-${txn.transactionId}"
        val reversalTxn = Transaction(
            id = revId,
            transactionId = revId,
            memberUid = txn.memberUid,
            memberId = txn.memberId,
            memberName = txn.memberName,
            quarter = txn.quarter,
            fiscalYear = txn.fiscalYear,
            amount = -Math.abs(txn.amount),
            depositDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date()),
            entryTimestamp = timeStr,
            operatorUid = admin.uid,
            operatorName = admin.displayName,
            paymentMethod = txn.paymentMethod,
            note = "Correction Reversal: $reason",
            status = "reversed",
            isReversal = true,
            reversedTransactionId = txn.transactionId,
            reversalReason = reason,
            createdAt = timeStr
        )
        db.collection("transactions").document(revId).set(reversalTxn).await()

        // 3. Log audit event
        val logId = "LOG-${System.currentTimeMillis()}"
        val auditLog = AuditLog(
            id = logId,
            action = "TRANSACTION_REVERSED",
            performedByUid = admin.uid,
            performedByName = admin.displayName,
            performedByRole = "super_admin",
            targetId = txn.transactionId,
            targetType = "transaction",
            details = "Reversed ৳${txn.amount} for member ${txn.memberId}. Reason: $reason",
            timestamp = timeStr
        )
        db.collection("audit_logs").document(logId).set(auditLog).await()
    }

    suspend fun getSocietyConfig(): SocietyConfig {
        return try {
            val snap = db.collection("society_config").document("general").get().await()
            if (snap.exists()) snap.toObject(SocietyConfig::class.java) ?: SocietyConfig() else SocietyConfig()
        } catch (e: Exception) {
            SocietyConfig()
        }
    }

    suspend fun getAuditLogs(): List<AuditLog> {
        val snap = db.collection("audit_logs").get().await()
        return snap.toObjects(AuditLog::class.java).sortedByDescending { it.timestamp }
    }
}
