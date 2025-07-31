import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";

import { useGlobalStore } from "@/GlobalProvider";
import { DialogTitle } from "./ui/dialog";
import { useEffect, useState } from "react";
import { ai } from "../firebase";
import { getGenerativeModel, Schema } from "firebase/ai";

const quizSchema = Schema.object({
  properties: {
    quiz: Schema.array({
      items: Schema.object({
        properties: {
          id: Schema.number(),
          question: Schema.string(),
          options: Schema.array({
            items: Schema.string(),
          }),
          correct: Schema.number(),
        },
      }),
    }),
  },
});

// Create a `GenerativeModel` instance with a model that supports your use case
const model = getGenerativeModel(ai, {
  model: "gemini-2.5-flash",
  // In the generation config, set the `responseMimeType` to `application/json`
  // and pass the JSON schema object into `responseSchema`.
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: quizSchema,
  },
});

type Question = {
  id: number;
  question: string;
  options: string[];
  correct: number;
};

export function Quiz() {
  const { openQuiz, setOpenQuiz, pageTitle, pageContent } = useGlobalStore();
  const [quizData, setQuizData] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  // Guard current question safely
  const current = quizData[currentQ];

  useEffect(() => {
    if (!openQuiz) return;

    const load = async () => {
      try {
        const result = await model.generateContent(pageContent);

        // Since Firebase AI returns text, parse manually:
        const text = result.response.text();
        // Clean triple backticks if present:
        const clean = text.replace(/```json|```/g, "").trim();

        const parsed = JSON.parse(clean);

        // parsed.quiz expected to be array of questions
        setQuizData(parsed.quiz ?? []);
        setCurrentQ(0);
        setScore(0);
        setSelected(null);
      } catch (err) {
        console.error("Failed to load quiz:", err);
        setQuizData([]); // fallback empty
      }
    };

    load();
  }, [openQuiz]);

  const handleAnswer = (index: number) => {
    setSelected(index);
    if (index === current.correct) setScore((s) => s + 1);
  };

  const next = () => {
    setSelected(null);
    if (currentQ + 1 < quizData.length) {
      setCurrentQ((q) => q + 1);
    } else {
      alert(`Quiz Done! You scored ${score}/${quizData.length}`);
      setCurrentQ(0);
      setScore(0);
      setSelected(null);
      setOpenQuiz(false); // close sheet after quiz done
    }
  };

  return (
    <Sheet open={openQuiz} onOpenChange={setOpenQuiz}>
      <DialogTitle className="hidden">Edit Page</DialogTitle>
      <SheetContent className="w-full p-4 sm:max-w-1/2 overflow-y-auto overflow-x-hidden">
        {!quizData.length ? (
          <div className="text-center py-10 text-gray-500">Loading quiz...</div>
        ) : (
          <>
            <h2 className="text-xl font-bold">{pageTitle}</h2>
            <p className="font-medium">{current.question}</p>
            <div className="space-y-2">
              {current.options.map((opt, i) => (
                <Button
                  key={i}
                  variant={selected === i ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleAnswer(i)}
                  disabled={selected !== null}
                >
                  {opt}
                </Button>
              ))}
            </div>
            {selected !== null && (
              <Button className="mt-4 w-full" onClick={next}>
                {currentQ + 1 === quizData.length ? "Finish" : "Next"}
              </Button>
            )}
          </>
        )}
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
