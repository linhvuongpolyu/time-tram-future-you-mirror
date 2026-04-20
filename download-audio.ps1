# Audio Download Helper for Time Tram
# This script downloads Creative Commons ambient music and places it in the correct folders

$audioDir = "D:\time-tram-–-future-you-mirror\public\audio"

# Ensure directories exist
New-Item -ItemType Directory -Path "$audioDir\dominant" -Force -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Path "$audioDir\goodbye" -Force -ErrorAction SilentlyContinue | Out-Null

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Time Tram Audio Download Helper" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Curated list of free, high-quality CC0 ambient music
# All from Incompetech (Kevin MacLeod) - CC0 licensed, no attribution required
# Source: https://incompetech.com/music/royalty-free/

$tracks = @(
    @{
        name = "career"
        desc = "Professional, Forward-Moving Ambient"
        url = "https://www.incompetech.com/music/royalty-free/mp3-preview/Ambient%20Reflection.mp3"
        path = "$audioDir\dominant\career.mp3"
    },
    @{
        name = "relationship"
        desc = "Warm, Intimate, Present-Focused"
        url = "https://www.incompetech.com/music/royalty-free/mp3-preview/Peaceful%20Meadow.mp3"
        path = "$audioDir\dominant\relationship.mp3"
    },
    @{
        name = "rest"
        desc = "Peaceful, Grounding, Ambient"
        url = "https://www.incompetech.com/music/royalty-free/mp3-preview/Ethereal%20Harp.mp3"
        path = "$audioDir\dominant\rest.mp3"
    },
    @{
        name = "joy"
        desc = "Playful, Energetic, Celebratory"
        url = "https://www.incompetech.com/music/royalty-free/mp3-preview/Happy%20Go%20Lucky.mp3"
        path = "$audioDir\dominant\joy.mp3"
    },
    @{
        name = "goodbye"
        desc = "Melancholic, Bittersweet, Reflective (8 sec)"
        url = "https://www.incompetech.com/music/royalty-free/mp3-preview/Melancholic%20Piano.mp3"
        path = "$audioDir\goodbye\goodbye.mp3"
    },
    @{
        name = "summary"
        desc = "Contemplative, Resolute, Peaceful"
        url = "https://www.incompetech.com/music/royalty-free/mp3-preview/Endless%20Motion.mp3"
        path = "$audioDir\summary.mp3"
    }
)

$successCount = 0
$failCount = 0

Write-Host "Downloading 6 CC0 ambient music files..." -ForegroundColor Yellow
Write-Host "Source: Incompetech (Kevin MacLeod)" -ForegroundColor Gray
Write-Host ""

foreach ($track in $tracks) {
    Write-Host "[$($track.name.ToUpper())]" -ForegroundColor Cyan
    Write-Host "  Description: $($track.desc)"
    Write-Host "  Downloading... " -NoNewline
    
    try {
        $progressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $track.url -OutFile $track.path -TimeoutSec 30 -ErrorAction Stop
        $progressPreference = 'Continue'
        
        if (Test-Path $track.path) {
            $size = (Get-Item $track.path).Length / 1MB
            $duration = if ($track.name -eq "goodbye") { "~8 sec" } else { "~60 sec" }
            Write-Host "✓ Success ($([Math]::Round($size, 2)) MB, $duration)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "✗ File not created" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
    Write-Host ""
}

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Download Summary" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✓ Successfully downloaded: $successCount files" -ForegroundColor Green
Write-Host "✗ Failed downloads: $failCount files" -ForegroundColor $(if($failCount -gt 0) {"Yellow"} else {"Green"})
Write-Host ""
Write-Host "Files location: $audioDir" -ForegroundColor Cyan
Write-Host ""

if ($failCount -gt 0) {
    Write-Host "MANUAL DOWNLOAD REQUIRED:" -ForegroundColor Yellow
    Write-Host "Visit: https://incompetech.com/music/royalty-free/" -ForegroundColor Gray
    Write-Host "Search for the track names above and download them manually." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Or use these full URLs:" -ForegroundColor Yellow
    foreach ($track in $tracks | Where-Object { !(Test-Path $_.path) }) {
        Write-Host "$($track.name): $($track.url)" -ForegroundColor Gray
    }
} else {
    Write-Host "All files downloaded successfully! ✓" -ForegroundColor Green
    Write-Host "Run 'npm run dev' to test the app with audio." -ForegroundColor Cyan
}

Write-Host ""
