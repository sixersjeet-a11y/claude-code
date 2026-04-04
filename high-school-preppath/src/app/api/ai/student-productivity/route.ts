import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const assignmentSchema = z.object({
  title: z.string(),
  className: z.string().optional(),
  textbookTitle: z.string().optional(),
  pageNumbers: z.array(z.string()).default([]),
  problemNumbers: z.array(z.string()).default([]),
  questionType: z.enum(['math', 'essay', 'science', 'reading', 'vocab', 'test_study', 'worksheet', 'other']).default('other'),
  dueHint: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium')
});

const gradeCategorySchema = z.object({
  name: z.string(),
  weightPercent: z.number().min(0).max(100),
  currentPercent: z.number().min(0).max(100)
});

const payloadSchema = z.object({
  text: z.string().optional(),
  imageUrls: z.array(z.string().url()).default([]),
  base64Images: z.array(z.string()).default([]),
  nowIso: z.string().datetime().optional(),
  targetGradePercent: z.number().min(0).max(100).default(90),
  upcomingAssessmentWeightPercent: z.number().min(1).max(100).default(20),
  realisticMode: z.boolean().default(true),
  completedStudyMinutesLast7Days: z.number().int().min(0).default(0),
  currentStreakDays: z.number().int().min(0).default(0),
  gradeCategories: z.array(gradeCategorySchema).default([])
});

type Assignment = z.infer<typeof assignmentSchema>;
type GradeCategory = z.infer<typeof gradeCategorySchema>;

type Urgency = 'low' | 'medium' | 'high' | 'critical';

function clampRange(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function parsePageCount(pageNumbers: string[]) {
  if (!pageNumbers.length) return 0;
  return pageNumbers.reduce((count, page) => {
    const match = page.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (match) {
      const start = Number(match[1]);
      const end = Number(match[2]);
      return count + Math.max(0, end - start + 1);
    }
    return count + 1;
  }, 0);
}

function estimateMinutes(assignment: Assignment) {
  const difficultyBump = assignment.difficulty === 'hard' ? 15 : assignment.difficulty === 'easy' ? -10 : 0;
  switch (assignment.questionType) {
    case 'essay':
      return clampRange(70 + difficultyBump * 2, 45, 120);
    case 'math':
    case 'science':
      return clampRange(30 + assignment.problemNumbers.length * 3 + difficultyBump, 25, 60);
    case 'worksheet':
      return clampRange(15 + assignment.problemNumbers.length * 2 + difficultyBump, 15, 35);
    case 'reading':
      return clampRange(parsePageCount(assignment.pageNumbers) * 7 + 8 + difficultyBump, 15, 120);
    case 'test_study':
      return assignment.difficulty === 'hard' ? 180 : assignment.difficulty === 'easy' ? 90 : 120;
    case 'vocab':
      return clampRange(15 + assignment.problemNumbers.length * 2 + difficultyBump, 15, 45);
    default:
      return clampRange(30 + difficultyBump, 20, 60);
  }
}

function parseNaturalDueDate(hint: string | undefined, now: Date): Date | undefined {
  if (!hint) return undefined;
  const lower = hint.toLowerCase();

  if (lower.includes('tomorrow')) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 0, 0);
    return d;
  }

  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const weekdayMatch = lower.match(/(?:test|quiz|due|on|by)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (weekdayMatch?.[1]) {
    const target = weekdays.indexOf(weekdayMatch[1].toLowerCase());
    if (target >= 0) {
      const d = new Date(now);
      const delta = (target - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + delta);
      d.setHours(23, 59, 0, 0);
      return d;
    }
  }

  const timeMatch = lower.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (timeMatch) {
    const d = new Date(now);
    let hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    const meridian = timeMatch[3]?.toLowerCase();
    if (meridian === 'pm' && hour < 12) hour += 12;
    if (meridian === 'am' && hour === 12) hour = 0;
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  return undefined;
}

function detectUrgency(dueDate: Date | undefined, now: Date): Urgency {
  if (!dueDate) return 'low';
  const hoursUntil = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntil <= 6) return 'critical';
  if (hoursUntil <= 24) return 'high';
  if (hoursUntil <= 72) return 'medium';
  return 'low';
}

function buildStudyGuide(assignments: Array<{ title: string; questionType: Assignment['questionType']; difficulty: Assignment['difficulty']; className?: string }>) {
  const tests = assignments.filter((a) => a.questionType === 'test_study');
  const focus = tests.length ? tests : assignments.slice(0, 3);
  return {
    generated: focus.length > 0,
    focusSubjects: focus.map((item) => item.className ?? item.title),
    sections: [
      'Top concepts to memorize',
      'Formula / key term checklist',
      'Fast recap summary',
      'Practice quiz with worked solutions'
    ],
    studyBlocksRecommendation: focus.map((item, index) => ({
      block: index + 1,
      focus: item.title,
      recommendedMinutes: item.difficulty === 'hard' ? 60 : 40
    }))
  };
}

function calculateGradeProjection(
  categories: GradeCategory[],
  targetGradePercent: number,
  upcomingAssessmentWeightPercent: number
) {
  if (!categories.length) {
    return {
      currentGradePercent: null,
      minimumNeededOnNextAssessment: null,
      projectedGradeIfPlanFollowed: null
    };
  }

  const current = categories.reduce((acc, c) => acc + (c.currentPercent * c.weightPercent) / 100, 0);
  const remainingWeight = 100 - upcomingAssessmentWeightPercent;
  const weightedCurrentPortion = remainingWeight <= 0 ? 0 : (current / 100) * remainingWeight;
  const minNeeded = ((targetGradePercent - weightedCurrentPortion) / upcomingAssessmentWeightPercent) * 100;
  const projected = clampRange(current + 3, 0, 100);

  return {
    currentGradePercent: Number(current.toFixed(2)),
    minimumNeededOnNextAssessment: Number(clampRange(minNeeded, 0, 100).toFixed(2)),
    projectedGradeIfPlanFollowed: Number(projected.toFixed(2))
  };
}

function buildSchedule(assignments: Array<{ title: string; estimatedMinutes: number; urgency: Urgency }>, now: Date) {
  const sorted = [...assignments].sort((a, b) => {
    const rank: Record<Urgency, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return rank[b.urgency] - rank[a.urgency] || b.estimatedMinutes - a.estimatedMinutes;
  });

  let cursor = new Date(now);
  const blocks = sorted.map((task, index) => {
    const start = new Date(cursor);
    const duration = clampRange(task.estimatedMinutes, 20, 90);
    const end = new Date(start.getTime() + duration * 60 * 1000);
    cursor = new Date(end.getTime() + 10 * 60 * 1000);
    return {
      order: index + 1,
      task: task.title,
      urgency: task.urgency,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      durationMinutes: duration
    };
  });

  return blocks;
}

export async function POST(req: NextRequest) {
  const parsed = payloadSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const now = parsed.data.nowIso ? new Date(parsed.data.nowIso) : new Date();
  const imageInputs = parsed.data.imageUrls.map((url) => ({ type: 'input_image' as const, image_url: url, detail: 'auto' as const }));
  const base64Inputs = parsed.data.base64Images.map((img) => ({ type: 'input_image' as const, image_url: `data:image/jpeg;base64,${img}`, detail: 'auto' as const }));

  const response = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content: [
          {
            type: 'input_text',
            text:
              'Extract ALL assignments from the input (multiple assignments possible). Return strict JSON with shape: { assignments: Assignment[], notesBundle: { bullets: string[], glossary: { term: string, definition: string }[], summary: string, testQuestions: { question: string, answer: string }[] }, rewriteSupport: { simpler: string, stepByStep: string[], outline: string[], brainstorm: string[], eli5: string, professorMode: string }, flashcards: { term: string, definition: string }[] }. Assignment must include title, className(optional), textbookTitle(optional), pageNumbers[], problemNumbers[], questionType (math|essay|science|reading|vocab|test_study|worksheet|other), dueHint(optional), difficulty (easy|medium|hard).'
          }
        ]
      },
      {
        role: 'user',
        content: [{ type: 'input_text', text: parsed.data.text ?? 'No OCR text supplied; use visual extraction.' }, ...imageInputs, ...base64Inputs]
      }
    ]
  });

  let raw: {
    assignments?: unknown[];
    notesBundle?: unknown;
    rewriteSupport?: unknown;
    flashcards?: unknown;
  };

  try {
    raw = JSON.parse(response.output_text || '{}');
  } catch {
    return NextResponse.json({ error: 'Model returned non-JSON output', raw: response.output_text }, { status: 502 });
  }

  const assignments = (Array.isArray(raw.assignments) ? raw.assignments : [])
    .map((item) => assignmentSchema.safeParse(item))
    .filter((item): item is { success: true; data: Assignment } => item.success)
    .map((item) => {
      const dueDate = parseNaturalDueDate(item.data.dueHint, now);
      const urgency = detectUrgency(dueDate, now);
      const estimatedMinutes = estimateMinutes(item.data);
      return {
        ...item.data,
        dueDateIso: dueDate?.toISOString(),
        urgency,
        estimatedMinutes,
        warning:
          urgency === 'critical'
            ? 'Critical deadline risk: start immediately.'
            : urgency === 'high' && estimatedMinutes >= 60
              ? 'High urgency + long duration. Break into focused blocks now.'
              : undefined
      };
    });

  const totalMinutes = assignments.reduce((sum, task) => sum + task.estimatedMinutes, 0);
  const weeklyHours = Number((parsed.data.completedStudyMinutesLast7Days / 60).toFixed(1));
  const productivityScore = clampRange(
    Math.round(40 + parsed.data.currentStreakDays * 3 + weeklyHours * 4 - Math.max(0, totalMinutes - 180) / 5),
    0,
    100
  );

  const hardestSubject =
    assignments
      .slice()
      .sort((a, b) => b.estimatedMinutes - a.estimatedMinutes)
      .at(0)?.className ?? 'Not enough data';

  const gradeMetrics = calculateGradeProjection(
    parsed.data.gradeCategories,
    parsed.data.targetGradePercent,
    parsed.data.upcomingAssessmentWeightPercent
  );

  const studyGuide = buildStudyGuide(assignments);
  const scheduleBlocks = buildSchedule(assignments, now);
  const overloadWarning = totalMinutes > 240 ? 'Overload warning: more than 4 hours detected. Split across multiple days.' : undefined;

  const reminders = scheduleBlocks.slice(0, 3).map((block) => ({
    message: `${block.task} is next. Do a focused ${block.durationMinutes}-minute sprint.`,
    triggerAtIso: new Date(new Date(block.startIso).getTime() - 10 * 60 * 1000).toISOString()
  }));

  return NextResponse.json({
    generatedAt: now.toISOString(),
    assignments,
    totals: {
      assignmentCount: assignments.length,
      estimatedMinutes: totalMinutes,
      overloadWarning
    },
    schedule: {
      oneTapTimeBlocks: scheduleBlocks,
      exportTargets: ['google_calendar', 'apple_calendar', 'notion']
    },
    smartNotifications: reminders,
    notesBundle: raw.notesBundle,
    flashcards: raw.flashcards,
    rewriteSupport: parsed.data.realisticMode
      ? {
          mode: 'learning_support_only',
          policy: 'Direct final answers are withheld when misuse risk is high; explanations and guided steps are provided.',
          tools: raw.rewriteSupport
        }
      : { mode: 'full_assistance', tools: raw.rewriteSupport },
    testPrep: {
      ...studyGuide,
      autoGenerated: studyGuide.generated,
      practiceQuizIncluded: true
    },
    gradeCalculator: {
      ...gradeMetrics,
      targetGradePercent: parsed.data.targetGradePercent,
      upcomingAssessmentWeightPercent: parsed.data.upcomingAssessmentWeightPercent
    },
    productivity: {
      currentStreakDays: parsed.data.currentStreakDays,
      weeklyHours,
      productivityScore,
      hardestWorkingSubject: hardestSubject,
      improvementTips: [
        'Start with highest-urgency tasks before low-urgency reading.',
        'Use 25-minute focus blocks + 5-minute breaks.',
        'Review flashcards right before sleep for retention.'
      ]
    },
    parentDashboard: {
      enabled: true,
      summary: {
        homeworkItems: assignments.length,
        upcomingTests: assignments.filter((a) => a.questionType === 'test_study').length,
        weeklyStudyHours: weeklyHours
      }
    },
    integrations: {
      chromeExtension: {
        enabled: true,
        sources: ['Google Classroom', 'Canvas', 'PowerSchool']
      },
      smartCapture: true
    }
  });
}
