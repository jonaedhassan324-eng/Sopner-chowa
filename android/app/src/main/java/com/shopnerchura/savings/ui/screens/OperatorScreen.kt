package com.shopnerchura.savings.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.shopnerchura.savings.data.model.UserProfile
import com.shopnerchura.savings.data.repository.FirebaseRepository
import kotlinx.coroutines.launch

@Composable
fun OperatorScreen(operator: UserProfile, repository: FirebaseRepository) {
    val coroutineScope = rememberCoroutineScope()
    var members by remember { mutableStateOf<List<UserProfile>>(emptyList()) }
    var selectedMember by remember { mutableStateOf<UserProfile?>(null) }
    var amountText by remember { mutableStateOf("3000") }
    var quarter by remember { mutableStateOf("2026-Q1") }
    var paymentMethod by remember { mutableStateOf("cash") }
    var voucherRef by remember { mutableStateOf("") }
    var statusMessage by remember { mutableStateOf<String?>(null) }
    var isSubmitting by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        members = repository.getAllMembers()
        if (members.isNotEmpty()) {
            selectedMember = members.first()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            "ত্রৈমাসিক কিস্তি জমা এন্ট্রি কাউন্টার",
            style = MaterialTheme.typography.titleLarge,
            color = Color.White
        )

        statusMessage?.let {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF064E3B)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = it,
                    modifier = Modifier.padding(12.dp),
                    color = Color(0xFFA7F3D0)
                )
            }
        }

        // Member Selection Card
        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("সদস্য নির্বাচন করুন", style = MaterialTheme.typography.titleSmall, color = Color.White)
                Spacer(modifier = Modifier.height(8.dp))
                selectedMember?.let { m ->
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(m.displayName, style = MaterialTheme.typography.bodyMedium, color = Color.White)
                        Text(m.memberId, style = MaterialTheme.typography.bodyMedium, color = Color(0xFF10B981))
                    }
                }
            }
        }

        // Input Fields
        OutlinedTextField(
            value = amountText,
            onValueChange = { amountText = it },
            label = { Text("জমার পরিমাণ (৳ BDT)") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = quarter,
            onValueChange = { quarter = it },
            label = { Text("ত্রৈমাসিক (Quarter, e.g. 2026-Q1)") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = paymentMethod,
            onValueChange = { paymentMethod = it },
            label = { Text("পরিশোধ মাধ্যম (cash, bkash, nagad, bank)") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = voucherRef,
            onValueChange = { voucherRef = it },
            label = { Text("ভাউচার বা ট্রানজেকশন রেফারেন্স (ঐচ্ছিক)") },
            modifier = Modifier.fillMaxWidth()
        )

        Button(
            onClick = {
                val amt = amountText.toDoubleOrNull() ?: 0.0
                val targetMember = selectedMember
                if (targetMember != null && amt > 0) {
                    isSubmitting = true
                    coroutineScope.launch {
                        try {
                            val txn = repository.recordQuarterlyDeposit(
                                member = targetMember,
                                amount = amt,
                                quarter = quarter,
                                fiscalYear = quarter.split("-").firstOrNull() ?: "2026",
                                paymentMethod = paymentMethod,
                                paymentReference = voucherRef,
                                note = "Android Mobile Entry",
                                operator = operator
                            )
                            statusMessage = "সাফল্যের সাথে ৳$amt জমা হয়েছে! রশিদ নং: ${txn.transactionId}"
                            voucherRef = ""
                        } catch (e: Exception) {
                            statusMessage = "ত্রুটি: ${e.message}"
                        } finally {
                            isSubmitting = false
                        }
                    }
                }
            },
            enabled = !isSubmitting,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
            modifier = Modifier.fillMaxWidth().height(50.dp)
        ) {
            Icon(Icons.Default.CheckCircle, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("জমা নিশ্চিত করুন ও রশিদ সংরক্ষণ করুন", color = Color.Black)
        }
    }
}
