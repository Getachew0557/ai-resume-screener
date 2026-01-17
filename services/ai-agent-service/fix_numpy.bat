@echo off
echo Downgrading NumPy to <2 to fix compatibility issues...
pip uninstall -y numpy
pip install "numpy<2" --ignore-installed --user

echo Verifying NumPy version...
python -c "import numpy; print(f'NumPy Version: {numpy.__version__}')"

echo DONE. Please run start_all.bat now.
pause
