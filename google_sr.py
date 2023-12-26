import sys
import speech_recognition as sr
import urllib
import pydub
import os
import io

def download_audio(src):
    with urllib.request.urlopen(src) as response:
        audio_bytes = response.read()
    return audio_bytes

def convert_mp3_to_wav(audio_bytes):
    audio_segment = pydub.AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
    wav_bytes = audio_segment.export(format="wav").read()
    return wav_bytes

def process_audio(wav_bytes):
    sample_audio = sr.AudioFile(io.BytesIO(wav_bytes))
    recognizer = sr.Recognizer()
    with sample_audio as source:
        audio = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio)
            return text.lower()
        except sr.UnknownValueError:
            print("Google Speech Recognition could not understand audio")
            return None
        except sr.RequestError as e:
            print(f"Could not request results from Google Speech Recognition service; {e}")
            return None

if __name__ == "__main__":
    root_dir = os.path.dirname(__file__)
    mp3_path = os.path.join(root_dir, "sample.mp3")
    wav_path = os.path.join(root_dir, "sample.wav")

    # Read the input from stdin
    src = sys.stdin.read().strip()

    # Process the audio and get the result
    mp3_audio = download_audio(src)
    wav_audio = convert_mp3_to_wav(mp3_audio)
    result = process_audio(wav_audio)

    # Write the result to stdout
    print(result)

# def download_audio(src, download_path):
#     urllib.request.urlretrieve(src, download_path)

# def convert_mp3_to_wav(src_path, dest_path):
#     sound = pydub.AudioSegment.from_mp3(src_path)
#     sound.export(dest_path, format="wav")

# def process_audio(wav_path):
#     sample_audio = sr.AudioFile(wav_path)
#     r:sr.Recognizer = sr.Recognizer()
#     with sample_audio as source:
#         audio = r.record(source)

#     key = r.recognize_google(audio)
#     result = key.lower()

#     return result

# download_audio(src, mp3_path)
# convert_mp3_to_wav(mp3_path, wav_path)
# result = process_audio(wav_path)