#!/usr/bin/python3

import speech_recognition as sr
import requests
import pydub
import io

#selenium libraries
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver import Chrome

class Solver():
    def __init__(self, driver:Chrome) -> None:
        self.driver = driver

    def get_frame(self, attr:str, val:str)->WebElement:
        self.driver.switch_to.default_content()
        return next(frame for frame in self.driver.find_elements(By.TAG_NAME, 'iframe') if val in frame.get_attribute(attr))

    def solve(self):
        # switch to recaptcha frame
        try:
            captcha_frame = self.get_frame(attr="src", val="api2/anchor")
        except StopIteration:
            return
            # raise Exception("catpcha frame not found")
        self.driver.switch_to.frame(captcha_frame)

        # click check-box
        WebDriverWait(self.driver, 7).until(EC.element_to_be_clickable((By.ID, "recaptcha-anchor"))).send_keys(Keys.ENTER)

        if self.check_solved():
            return

        # challenge until success
        self.audio_solver()

    def audio_solver(self):
        # switch to recaptcha frame
        self.driver.switch_to.frame(self.get_frame(attr="src", val="api2/bframe"))

        # click audio button
        WebDriverWait(self.driver, 3).until(EC.element_to_be_clickable((By.ID, "recaptcha-audio-button"))).send_keys(Keys.ENTER)

        while not self.check_solved():
            # switch to recaptcha audio challenge frame
            self.driver.switch_to.frame(self.get_frame(attr="src", val="api2/bframe"))
        
            # get mp3 file link
            try:
                src:WebElement = WebDriverWait(self.driver, 3).until(EC.presence_of_element_located((By.ID, "audio-source")))
                src = src.get_attribute("src")
            except TimeoutException as t:
                try:
                    self.driver.find_element(By.CLASS_NAME, "rc-doscaptcha-header")
                except NoSuchElementException:
                    raise t
                else:
                    raise Exception("Your IP has banned for a while.\nTry again later.")

            # download mp3 file
            response = requests.get(src)
            sound:pydub.audio_segment.AudioSegment = pydub.AudioSegment.from_mp3(io.BytesIO(response.content))
            
            wav_file = io.BytesIO()
            sound.export(wav_file, format="wav")

            sample_audio = sr.AudioFile(wav_file)
            recognizer = sr.Recognizer()
            with sample_audio as source:
                audio = recognizer.record(source)
            
            try: 
                key:str = recognizer.recognize_google(audio)
            except:
                self.driver.find_element(By.ID, "recaptcha-reload-button").send_keys(Keys.ENTER)
            else:
                print("[INFO] Recaptcha Passcode: %s" % key)
                element = self.driver.find_element(By.ID, "audio-response")
                element.send_keys(key.lower())
                element.send_keys(Keys.ENTER)

        self.driver.switch_to.default_content()

    def check_solved(self)->bool:
        self.driver.switch_to.default_content()
        self.driver.switch_to.frame(self.get_frame(attr="src", val="api2/anchor"))

        checked = self.driver.find_element(By.ID, "recaptcha-anchor").get_attribute("aria-checked")
        self.driver.switch_to.default_content()
        return checked.lower() == "true"