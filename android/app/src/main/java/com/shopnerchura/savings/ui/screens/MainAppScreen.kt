package com.shopnerchura.savings.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.shopnerchura.savings.data.model.UserProfile
import com.shopnerchura.savings.data.repository.FirebaseRepository

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScreen() {
    val repository = remember { FirebaseRepository() }
    var selectedTab by remember { mutableStateOf(0) }
    var currentRole by remember { mutableStateOf("super_admin") } // super_admin, entry_operator, member
    
    val sampleUser = remember {
        UserProfile(
            uid = "SC-USR-101",
            displayName = "Md. Rafiqul Islam",
            memberId = "SC-101",
            role = currentRole,
            email = "rafiqul@shopnerchura.org",
            phone = "+880 1819-876543",
            currentCountry = "Bangladesh",
            membershipStartDate = "2024-01-15",
            status = "active"
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("স্বপ্নের চূড়া", style = MaterialTheme.typography.titleMedium, color = Color.White)
                        Text("Shopner Chura Savings Society", style = MaterialTheme.typography.bodySmall, color = Color(0xFF10B981))
                    }
                },
                actions = {
                    AssistChip(
                        onClick = {
                            currentRole = when (currentRole) {
                                "super_admin" -> "entry_operator"
                                "entry_operator" -> "member"
                                else -> "super_admin"
                            }
                        },
                        label = { Text(currentRole.uppercase()) },
                        leadingIcon = { Icon(Icons.Default.Security, contentDescription = null, modifier = Modifier.size(16.dp)) }
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        },
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.AccountBalanceWallet, contentDescription = null) },
                    label = { Text("সঞ্চয় (Member)") }
                )
                if (currentRole == "entry_operator" || currentRole == "super_admin") {
                    NavigationBarItem(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        icon = { Icon(Icons.Default.AddCircle, contentDescription = null) },
                        label = { Text("জমা (Operator)") }
                    )
                }
                if (currentRole == "super_admin") {
                    NavigationBarItem(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        icon = { Icon(Icons.Default.AdminPanelSettings, contentDescription = null) },
                        label = { Text("এডমিন (Admin)") }
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues).fillMaxSize()) {
            when (selectedTab) {
                0 -> MemberScreen(user = sampleUser, repository = repository)
                1 -> OperatorScreen(operator = sampleUser, repository = repository)
                2 -> AdminScreen(admin = sampleUser, repository = repository)
            }
        }
    }
}
