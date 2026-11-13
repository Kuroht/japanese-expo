import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useCallback, useState } from "react";

// Records the user repeating a sentence and plays the recording back.
// The latest recording is kept in memory only (one per hook instance), not saved anywhere.
export function useShadowRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // The player loads the recording as soon as there is a uri (null = nothing loaded).
  const player = useAudioPlayer(recordingUri);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage(
          "Microphone permission was denied. Allow it for this app in your phone settings to record.",
        );
        return;
      }
      // The docs require allowsRecording before recording. playsInSilentMode lets iOS play
      // sound with the silent switch on (Android has no such switch and ignores it).
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not start recording.");
    }
  }, [recorder]);

  const stopRecording = useCallback(async () => {
    try {
      await recorder.stop();
      setRecordingUri(recorder.uri);
      // On iOS, leaving recording mode on sends playback to the quiet earpiece speaker.
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not stop recording.");
    }
  }, [recorder]);

  // Starts the recording from the beginning.
  const playRecording = useCallback(() => {
    void player.seekTo(0);
    player.play();
  }, [player]);

  return {
    isRecording: recorderState.isRecording,
    hasRecording: recordingUri !== null,
    errorMessage,
    startRecording,
    stopRecording,
    playRecording,
  };
}
