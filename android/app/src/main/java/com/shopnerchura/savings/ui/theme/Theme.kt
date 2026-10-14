package com.shopnerchura.savings.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val DarkGreen = Color(0xFF064E3B)
val EmeraldPrimary = Color(0xFF10B981)
val TealAccent = Color(0xFF14B8A6)
val BackgroundDark = Color(0xFF020617)
val SurfaceDark = Color(0xFF0F172A)
val CardDark = Color(0xFF1E293B)
val TextWhite = Color(0xFFF8FAFC)
val TextMuted = Color(0xFF94A3B8)

private val DarkColorScheme = darkColorScheme(
    primary = EmeraldPrimary,
    onPrimary = Color.Black,
    primaryContainer = DarkGreen,
    onPrimaryContainer = Color.White,
    secondary = TealAccent,
    background = BackgroundDark,
    surface = SurfaceDark,
    onBackground = TextWhite,
    onSurface = TextWhite
)

@Composable
fun ShopnerChuraTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
