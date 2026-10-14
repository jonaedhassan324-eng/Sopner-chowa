package com.shopnerchura.savings.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.shopnerchura.savings.data.model.AuditLog
import com.shopnerchura.savings.data.model.UserProfile
import com.shopnerchura.savings.data.repository.FirebaseRepository
import kotlinx.coroutines.launch

@Composable
fun AdminScreen(admin: UserProfile, repository: FirebaseRepository) {
    val coroutineScope = rememberCoroutineScope()
    var members by remember { mutableStateOf<List<UserProfile>>(emptyList()) }
    var auditLogs by remember { mutableStateOf<List<AuditLog>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        coroutineScope.launch {
            try {
                members = repository.getAllMembers()
                auditLogs = repository.getAuditLogs()
            } finally {
                loading = false
            }
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("সুপার এডমিন কন্ট্রোল প্যানেল", style = MaterialTheme.typography.titleLarge, color = Color.White)
        }

        // Summary Metric
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    Column {
                        Text("মোট সদস্য", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                        Text("${members.size} জন", style = MaterialTheme.typography.titleLarge, color = Color.White)
                    }
                    Column {
                        Text("অডিট ইভেন্ট", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                        Text("${auditLogs.size} টি", style = MaterialTheme.typography.titleLarge, color = Color(0xFFA855F7))
                    }
                }
            }
        }

        item {
            Text("অপরিবর্তনীয় অডিট লগ (Audit Trails)", style = MaterialTheme.typography.titleMedium, color = Color.White)
        }

        if (loading) {
            item {
                CircularProgressIndicator(color = Color(0xFFA855F7))
            }
        } else {
            items(auditLogs.take(15)) { log ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(log.action, style = MaterialTheme.typography.labelSmall, color = Color(0xFFA855F7))
                            Text(log.timestamp.take(10), style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(log.details, style = MaterialTheme.typography.bodySmall, color = Color.LightGray)
                    }
                }
            }
        }
    }
}
