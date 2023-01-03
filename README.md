# recaptcha-solver
solve recaptcha using speech recognition

# Usage
```python
from selenium.webdriver import Chrome
import recaptcha-solver

driver = Chrome()
driver.get("https://www.google.com/recaptcha/api2/demo")

solver = recaptcha-solver.Solver(driver=driver)
solver.solve()
```

# Dependency

python >= 3.6

# Requires

speech_recognition

requests

pydub

selenium
