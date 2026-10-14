package com.shopnerchura.savings.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.shopnerchura.savings.data.model.Transaction
import com.shopnerchura.savings.data.model.UserProfile
import com.shopnerchura.savings.data.repository.FirebaseRepository
import kotlinx.coroutines.launch

@Composable
fun MemberScreen(user: UserProfile, repository: FirebaseRepository) {
    val coroutineScope = rememberCoroutineScope()
    var transactions by remember { mutableStateOf<List<Transaction>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }

    LaunchedEffect(user.uid) {
        coroutineScope.launch {
            try {
                transactions = repository.getMemberTransactions(user.uid)
            } finally {
                loading = false
            }
        }
    }

    val totalDeposited = transactions.filter { it.status == "confirmed" && !it.isReversal }.sumOf { it.amount }
    val reversals = transactions.filter { it.isReversal }.sumOf { Math.abs(it.amount) }
    val netBalance = totalDeposited - reversals

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Banking Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF064E3B)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("স্বপ্নের চূড়া সঞ্চয় হিসাব", style = MaterialTheme.typography.labelMedium, color = Color(0xFFA7F3D0))
                        AssistChip(
                            onClick = {},
                            label = { Text(user.memberId, color = Color.White) }
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("মোট জমাকৃত সঞ্চয়", style = MaterialTheme.typography.bodySmall, color = Color.LightGray)
                    Text(
                        "৳ ${"%,.0f".format(netBalance)} BDT",
                        style = MaterialTheme.typography.headlineLarge,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Divider(color = Color(0xFF047857))
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("পরবর্তী কিস্তি: ২০২৬-Q1", style = MaterialTheme.typography.bodySmall, color = Color.LightGray)
                        Text("নির্ধারিত: ৳৩,০০০", style = MaterialTheme.typography.bodySmall, color = Color(0xFF34D399))
                    }
                }
            }
        }

        // Recent Transactions Section Header
        item {
            Text(
                "সাম্প্রতিক জমা ও ডিজিটাল রশিদ",
                style = MaterialTheme.typography.titleMedium,
                color = Color.White
            )
        }

        if (loading) {
            item {
                Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFF10B981))
                }
            }
        } else if (transactions.isEmpty()) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp).fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(Icons.Default.ReceiptLong, contentDescription = null, tint = Color.Gray, modifier = Modifier.size(40.dp))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("কোনো লেনদেন রেকর্ড পাওয়া যায়নি", style = MaterialTheme.typography.bodyMedium, color = Color.LightGray)
                    }
                }
            }
        } else {
            items(transactions) { txn ->
                val isRev = txn.status == "reversed" || txn.isReversal
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp).fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(txn.transactionId, style = MaterialTheme.typography.bodyMedium, color = Color(0xFF10B981))
                            Text("${txn.quarter} • ${txn.depositDate}", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                "${if (isRev) "-" else "+"}৳ ${"%,.0f".format(Math.abs(txn.amount))}",
                                style = MaterialTheme.typography.titleMedium,
                                color = if (isRev) Color.Red else Color(0xFF34D399)
                            )
                            Text(
                                if (isRev) "সংশোধিত" else "গৃহীত",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (isRev) Color.Red else Color.LightGray
                            )
                        }
                    }
                }
            }
        }
    }
}
