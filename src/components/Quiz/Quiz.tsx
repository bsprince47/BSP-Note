import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";

import { useGlobalStore } from "@/GlobalProvider";
import { DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { ai } from "../../firebase";
import { getGenerativeModel, Schema } from "firebase/ai";
import { Card, CardContent } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

const quizSchema = Schema.object({
  properties: {
    quiz: Schema.array({
      items: Schema.object({
        properties: {
          question: Schema.string(),
          options: Schema.array({
            items: Schema.object({
              properties: {
                option: Schema.string(),
                detail: Schema.string(),
                isCorrect: Schema.boolean(),
              },
            }),
          }),
        },
      }),
    }),
  },
});

// Create a `GenerativeModel` instance with a model that supports your use case
const model = getGenerativeModel(ai, {
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: quizSchema,
  },
});

// --- Type Definitions ---
interface Question {
  question: string;
  options: Array<{ option: string; detail: string; isCorrect: boolean }>;
}

export function Quiz() {
  const { openQuiz, setOpenQuiz, pageContent } = useGlobalStore();

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!openQuiz) return;

    const prom = prompt("first instructures of content");

    const loadQuiz = async () => {
      try {
        const result = await model.generateContent(prom + " " + pageContent);
        const text = result.response.text();
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        setQuizQuestions(parsed.quiz ?? []);
        setCurrentQuestion(0);
        setSelectedIdx(null);
        setIsLocked(false);
      } catch (err) {
        setQuizQuestions([]);
      }
    };
    loadQuiz();
  }, [openQuiz]);

  if (!quizQuestions.length) {
    return (
      <Sheet open={openQuiz} onOpenChange={setOpenQuiz}>
        <DialogTitle className="hidden">Edit Page</DialogTitle>

        <SheetContent className="w-full p-4 sm:max-w-1/2 overflow-y-auto overflow-x-hidden">
          <div className="text-center py-10 text-gray-500">Loading quiz...</div>
        </SheetContent>
      </Sheet>
    );
  }

  const correctIdx = quizQuestions[currentQuestion].options.findIndex(
    (opt) => opt.isCorrect
  );

  return (
    <Sheet open={openQuiz} onOpenChange={setOpenQuiz}>
      <DialogTitle className="hidden">Edit Page</DialogTitle>
      <SheetContent className="w-full p-4 sm:max-w-1/2 overflow-y-auto overflow-x-hidden pt-16">
        <Card>
          <CardContent>
            <p className="text-base font-medium">
              {quizQuestions[currentQuestion].question}
            </p>
          </CardContent>
        </Card>

        <RadioGroup
          onValueChange={(val) => {
            if (isLocked) return;
            const idx = quizQuestions[currentQuestion].options.findIndex(
              (opt) => opt.option === val
            );
            setSelectedIdx(idx);
            setIsLocked(true);
          }}
          className="space-y-2"
        >
          {quizQuestions[currentQuestion].options.map((option, i) => {
            let bgClass = "";
            let showDetail = false;

            if (selectedIdx !== null && isLocked) {
              if (i === correctIdx) {
                bgClass = "bg-green-100 text-green-900";
                showDetail =
                  selectedIdx === correctIdx || selectedIdx !== correctIdx;
              } else if (i === selectedIdx) {
                bgClass = option.isCorrect
                  ? "bg-green-100 text-green-900"
                  : "bg-red-100 text-red-900";
                showDetail = selectedIdx !== correctIdx;
              }
            }

            return (
              <div
                key={i}
                className={`flex flex-col items-start space-x-2 border border-slate-400/30 rounded-md ${bgClass} mb-2`}
                onClick={() => {
                  if (isLocked) return;
                  setSelectedIdx(i);
                  setIsLocked(true);
                }}
              >
                <div className="flex items-center w-full">
                  <RadioGroupItem
                    className="hidden"
                    value={option.option}
                    id={`option-${i}`}
                    disabled={isLocked}
                  />
                  <Label
                    className="p-4 w-full h-full font-bold"
                    htmlFor={`option-${i}`}
                  >
                    {option.option}
                  </Label>
                </div>
                {/* Show detail if needed */}
                {showDetail && option.detail && (
                  <div
                    className={`w-full text-xs p-2 ${
                      i === correctIdx
                        ? "bg-green-100 text-green-900"
                        : "bg-red-100 text-red-900"
                    } rounded-b-md px-4`}
                  >
                    {option.detail}
                  </div>
                )}
              </div>
            );
          })}
        </RadioGroup>
        {currentQuestion < quizQuestions.length - 1 && (
          <Button
            className="mt-4"
            onClick={() => {
              setCurrentQuestion((q) => q + 1);
              setSelectedIdx(null);
              setIsLocked(false);
            }}
            disabled={!isLocked}
          >
            Next
          </Button>
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
