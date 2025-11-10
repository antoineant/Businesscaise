@echo off
REM Script to apply database migration 002 (Windows)
REM This updates the submissions table to fix the "session_id does not exist" error

echo.
echo Applying database migration 002...
echo.

if not exist .env (
    echo Error: .env file not found!
    echo.
    echo Please create .env file with your database credentials:
    echo   DB_HOST=localhost
    echo   DB_PORT=5432
    echo   DB_NAME=businesscaise
    echo   DB_USER=postgres
    echo   DB_PASSWORD=your_password
    echo.
    pause
    exit /b 1
)

REM Load database credentials from .env
for /f "tokens=1,2 delims==" %%a in ('type .env ^| findstr /v "^#"') do set %%a=%%b

echo Connecting to database: %DB_NAME%@%DB_HOST%:%DB_PORT%
echo.

REM Apply migration using psql
set "PGPASSWORD=%DB_PASSWORD%"
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f migrations\002_update_submissions_table.sql

if %errorlevel% equ 0 (
    echo.
    echo Migration applied successfully!
    echo.
    echo Next steps:
    echo   1. Run your E2E tests again
    echo   2. The submit test should now pass!
) else (
    echo.
    echo Migration failed!
    echo.
    echo Please check:
    echo   1. PostgreSQL is running
    echo   2. Database credentials in .env are correct
    echo   3. Database 'businesscaise' exists
)

echo.
pause
