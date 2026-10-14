package com.shopnerchura.savings.data.model

import com.google.firebase.firestore.IgnoreExtraProperties

@IgnoreExtraProperties
data class UserProfile(
    val uid: String = "",
    val email: String = "",
    val displayName: String = "",
    val role: String = "member", // super_admin, entry_operator, member
    val memberId: String = "",
    val phone: String = "",
    val permanentAddress: String = "",
    val currentCountry: String = "Bangladesh",
    val dateOfBirth: String = "",
    val photoUrl: String = "",
    val signatureUrl: String = "",
    val nomineeName: String = "",
    val nomineePhone: String = "",
    val nomineeRelation: String = "",
    val membershipStartDate: String = "",
    val status: String = "active", // active, inactive, suspended
    val createdAt: String = "",
    val updatedAt: String = ""
)

@IgnoreExtraProperties
data class Transaction(
    val id: String = "",
    val transactionId: String = "",
    val memberUid: String = "",
    val memberId: String = "",
    val memberName: String = "",
    val quarter: String = "2026-Q1",
    val fiscalYear: String = "2026",
    val amount: Double = 0.0,
    val depositDate: String = "",
    val entryTimestamp: String = "",
    val operatorUid: String = "",
    val operatorName: String = "",
    val paymentMethod: String = "cash",
    val paymentReference: String = "",
    val note: String = "",
    val status: String = "confirmed", // confirmed, reversed
    val isReversal: Boolean = false,
    val reversedTransactionId: String = "",
    val reversalReason: String = "",
    val createdAt: String = ""
)

@IgnoreExtraProperties
data class SocietyConfig(
    val societyNameBn: String = "স্বপ্নের চূড়া সঞ্চয় সমিতি",
    val societyNameEn: String = "Shopner Chura Savings Society",
    val registrationNo: String = "REG-DH-2024/914",
    val quarterlyDueAmount: Double = 3000.0,
    val currency: String = "BDT",
    val currencySymbol: String = "৳",
    val currentFiscalYear: String = "2026",
    val activeQuarter: String = "2026-Q1",
    val contactNumber: String = "+880 1712-345678",
    val email: String = "info@shopnerchura.org",
    val address: String = "Shopner Chura Bhaban, Mirpur DOHS, Dhaka, Bangladesh"
)

@IgnoreExtraProperties
data class AuditLog(
    val id: String = "",
    val action: String = "",
    val performedByUid: String = "",
    val performedByName: String = "",
    val performedByRole: String = "",
    val targetId: String = "",
    val targetType: String = "",
    val details: String = "",
    val timestamp: String = ""
)
