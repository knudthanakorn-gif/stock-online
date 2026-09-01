Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\admin\.gemini\antigravity\brain\fdb4b440-fb92-4f80-8f27-2a9eb79df530\.user_uploaded\media_1786950715427.png"
$destPath = "D:\stock online\public\logo.png"

$img = [System.Drawing.Bitmap]::FromFile($srcPath)
$minX = $img.Width
$minY = $img.Height
$maxX = 0
$maxY = 0

for ($y = 0; $y -lt $img.Height; $y++) {
    for ($x = 0; $x -lt $img.Width; $x++) {
        $c = $img.GetPixel($x, $y)
        if ($c.A -gt 30 -and ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240)) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Detected bounds: minX=$minX, minY=$minY, maxX=$maxX, maxY=$maxY"

$pad = 12
$minX = [Math]::Max(0, $minX - $pad)
$minY = [Math]::Max(0, $minY - $pad)
$maxX = [Math]::Min($img.Width - 1, $maxX + $pad)
$maxY = [Math]::Min($img.Height - 1, $maxY + $pad)
$w = $maxX - $minX
$h = $maxY - $minY

$rect = [System.Drawing.Rectangle]::new($minX, $minY, $w, $h)
$cropped = $img.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$img.Dispose()

# Create transparent image
$finalBmp = [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $p = $cropped.GetPixel($x, $y)
        if ($p.R -gt 245 -and $p.G -gt 245 -and $p.B -gt 245) {
            $finalBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
        } else {
            $finalBmp.SetPixel($x, $y, $p)
        }
    }
}
$cropped.Dispose()

$finalBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$finalBmp.Dispose()
Write-Host "Successfully generated cropped transparent logo at $destPath (${w}x${h})"
