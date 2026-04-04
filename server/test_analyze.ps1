$response = Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/analyze" -Form @{
    file = Get-Item "c:\Users\Dillu\Desktop\EL\Vision47\VISION-47-PoseCorrect\sample_squat.mp4"
    exercise_type = "squat"
}
$response | ConvertTo-Json -Depth 6
