# PowerShell script to update all hardcoded API URLs to use centralized API_BASE_URL

$files = @(
    "src\admin\CustomBookingDetail.jsx",
    "src\admin\EnquiriesManagement.jsx",
    "src\admin\TestimonialsManagement.jsx",
    "src\components\Blogs.jsx",
    "src\components\EnquiryForm.jsx",
    "src\components\History.jsx",
    "src\pages\BlogPage.jsx",
    "src\pages\BookTour.jsx",
    "src\pages\BookTrek.jsx",
    "src\pages\ContactSupport.jsx",
    "src\pages\HistoryPage.jsx"
)

foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Replace http://localhost:5000/api with ${API_BASE_URL}
        $content = $content -replace "'http://localhost:5000/api", "'`${API_BASE_URL}"
        $content = $content -replace '"http://localhost:5000/api', '"${API_BASE_URL}'
        $content = $content -replace '`http://localhost:5000/api', '`${API_BASE_URL}'
        
        # Replace https dev tunnel URLs too
        $content = $content -replace "'https://4zb5qb7j-5000\.inc1\.devtunnels\.ms/api", "'`${API_BASE_URL}"
        $content = $content -replace '"https://4zb5qb7j-5000\.inc1\.devtunnels\.ms/api', '"${API_BASE_URL}'
        $content = $content -replace '`https://4zb5qb7j-5000\.inc1\.devtunnels\.ms/api', '`${API_BASE_URL}'
        
        Set-Content -Path $filePath -Value $content
        Write-Host "Updated: $file" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nDone! All API URLs have been updated to use centralized API_BASE_URL." -ForegroundColor Cyan
Write-Host "Remember to add 'import { API_BASE_URL } from '../api/api';' to each file!" -ForegroundColor Yellow
