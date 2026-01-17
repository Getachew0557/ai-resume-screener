@echo off
echo Uninstalling problematic packages...
pip uninstall -y pyarrow datasets sentence-transformers

echo Installing fixed versions...
pip install pyarrow==12.0.0 datasets==2.14.6 sentence-transformers --no-cache-dir

echo Verifying import...
python -c "import pyarrow; import datasets; print('PyArrow and Datasets loaded successfully')"

if %errorlevel% neq 0 (
    echo FAILED to fix dependencies. Please try running: conda install -y pyarrow
) else (
    echo SUCCESS! Dependencies fixed.
)
pause
