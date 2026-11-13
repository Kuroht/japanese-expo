import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/shared/hooks/useTheme";

import { useStudySession } from "../hooks/useStudySession";
import { SessionDone } from "./SessionDone";
import { SessionMessage } from "./SessionMessage";
import { SessionProgress } from "./SessionProgress";
import { SessionStepView } from "./SessionStepView";

const goHome = () => router.back();

// The study session. Decides between preparing, error, nothing-to-study, a step, and done.
export function SessionScreen() {
  const colors = useTheme();
  const session = useStudySession();
  const currentStep = session.queue[0];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        {/* Safe to leave at any time: every answer is saved the moment it is given. */}
        <Pressable
          onPress={goHome}
          accessibilityRole="button"
          accessibilityLabel="End session"
          style={styles.close}
        >
          <Text style={[styles.closeText, { color: colors.text }]}>✕</Text>
        </Pressable>
        <SessionProgress stepsDone={session.stepsDone} stepsLeft={session.queue.length} />
      </View>
      {session.status === "preparing" ? (
        <SessionMessage isLoading message="Preparing your session…" />
      ) : null}
      {session.status === "error" ? (
        <SessionMessage
          isError
          message={`Something went wrong: ${session.errorMessage}`}
          buttonLabel="Back"
          onPressButton={goHome}
        />
      ) : null}
      {session.status === "running" && currentStep ? (
        // While an answer is being saved, taps are ignored and the card is dimmed.
        <View
          style={[styles.stepArea, session.isSaving && styles.saving]}
          pointerEvents={session.isSaving ? "none" : "auto"}
        >
          <SessionStepView
            step={currentStep}
            showHardEasy={session.showHardEasy}
            onIntroDone={session.completeIntro}
            onGrade={session.gradeCard}
          />
        </View>
      ) : null}
      {session.status === "running" && !currentStep ? <FinishedView session={session} /> : null}
    </SafeAreaView>
  );
}

// Empty queue: either there was nothing to study, or the session is finished.
function FinishedView({ session }: { session: ReturnType<typeof useStudySession> }) {
  if (!session.hadAnythingToStudy) {
    return (
      <SessionMessage
        message="Nothing to study right now — come back later."
        buttonLabel="Back"
        onPressButton={goHome}
      />
    );
  }
  return (
    <SessionDone
      reviewsDone={session.reviewsDone}
      newItemsDone={session.newItemsDone}
      onBack={goHome}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  stepArea: { flex: 1 },
  saving: { opacity: 0.6 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12 },
  close: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  closeText: { fontSize: 22 },
});
