import type { StudyRating, SessionStep } from "../types";
import { IntroStep } from "./IntroStep";
import { KanaRecognitionCard } from "./KanaRecognitionCard";
import { KanaReverseCard } from "./KanaReverseCard";
import { LoanwordReadingCard } from "./LoanwordReadingCard";
import { SessionMessage } from "./SessionMessage";

type SessionStepViewProps = {
  step: SessionStep;
  showHardEasy: boolean;
  onIntroDone: () => void;
  onGrade: (rating: StudyRating, durationMs: number) => void;
};

// Chooses the component for the current step with plain ifs.
// The key makes React build a fresh card (empty input, new timer) for every step and re-show.
export function SessionStepView({
  step,
  showHardEasy,
  onIntroDone,
  onGrade,
}: SessionStepViewProps) {
  if (step.kind === "intro") {
    return <IntroStep key={step.item.itemKey} item={step.item} onDone={onIntroDone} />;
  }

  const { card, againCount } = step;
  const key = `${card.id}-${againCount}`;
  if (card.item_type === "kana" && card.card_type === "recognition") {
    return (
      <KanaRecognitionCard key={key} card={card} showHardEasy={showHardEasy} onGrade={onGrade} />
    );
  }
  if (card.item_type === "kana" && card.card_type === "reverse") {
    return (
      <KanaReverseCard
        key={key}
        card={card}
        againCount={againCount}
        showHardEasy={showHardEasy}
        onGrade={onGrade}
      />
    );
  }
  if (card.item_type === "loanword" && card.card_type === "reading") {
    return (
      <LoanwordReadingCard key={key} card={card} showHardEasy={showHardEasy} onGrade={onGrade} />
    );
  }
  return <SessionMessage isError message="This kind of card is not supported yet." />;
}
