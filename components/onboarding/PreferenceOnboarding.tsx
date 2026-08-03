"use client";

import {
  OnboardingProvider,
  useOnboarding,
} from "@onboardjs/react";
import type { OnboardingContext, OnboardingStep } from "@onboardjs/core";
import {
  ArrowLeft,
  ArrowRight,
  BookHeart,
  Check,
  ClipboardCheck,
  GraduationCap,
  Languages,
  Loader2,
  Sparkles,
  Tags,
  Target,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { EDIT_READING_PREFERENCES_EVENT } from "@/lib/preference-events";
import { useGetCategoriesQuery } from "@/store/api/booksApi";
import {
  useGetDepartmentsQuery,
  useGetReadingPreferencesQuery,
  useSaveReadingPreferencesMutation,
} from "@/store/api/preferenceApi";
import type {
  BookCategory,
  BookDepartment,
  PreferredLanguage,
  ReadingPreference,
  ReadingPreferenceInput,
  ReadingPurpose,
} from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const FLOW_VERSION = "1.0.0";

function preferenceFlowStorageKey(userId: number) {
  return `norton-elibrary:preference-flow:${userId}:v1`;
}

function preferenceSkipStorageKey(userId: number) {
  return `norton-elibrary:preferences:skipped-session:${userId}`;
}

const READING_PURPOSES: Array<{
  value: ReadingPurpose;
  labelKey:
    | "dailyStudy"
    | "assignment"
    | "thesis"
    | "research"
    | "examPreparation"
    | "skillDevelopment"
    | "generalReading";
}> = [
  { value: "daily_study", labelKey: "dailyStudy" },
  { value: "assignment", labelKey: "assignment" },
  { value: "thesis", labelKey: "thesis" },
  { value: "research", labelKey: "research" },
  { value: "exam_preparation", labelKey: "examPreparation" },
  { value: "skill_development", labelKey: "skillDevelopment" },
  { value: "general_reading", labelKey: "generalReading" },
];

const LANGUAGES: Array<{
  value: PreferredLanguage;
  labelKey: "khmer" | "english" | "french" | "otherLanguage";
}> = [
  { value: "km", labelKey: "khmer" },
  { value: "en", labelKey: "english" },
  { value: "fr", labelKey: "french" },
  { value: "other", labelKey: "otherLanguage" },
];

interface PreferenceFlowContext extends OnboardingContext {
  flowData: {
    departmentId?: number | "other";
    readingPurposes?: ReadingPurpose[];
    preferredCategoryIds?: number[];
    preferredLanguages?: PreferredLanguage[];
    [key: string]: unknown;
  };
}

const FLOW_STEPS: OnboardingStep<PreferenceFlowContext>[] = [
  { id: "welcome", type: "INFORMATION", nextStep: "department" },
  {
    id: "department",
    type: "CUSTOM_COMPONENT",
    payload: { componentKey: "department-preference" },
    nextStep: "purpose",
  },
  {
    id: "purpose",
    type: "CUSTOM_COMPONENT",
    payload: { componentKey: "reading-purpose-preference" },
    nextStep: "categories",
  },
  {
    id: "categories",
    type: "CUSTOM_COMPONENT",
    payload: { componentKey: "favorite-categories-preference" },
    nextStep: "language",
  },
  {
    id: "language",
    type: "CUSTOM_COMPONENT",
    payload: { componentKey: "preferred-language-preference" },
    nextStep: "confirmation",
  },
  { id: "confirmation", type: "CONFIRMATION", nextStep: null },
];

const STEP_META = {
  welcome: {
    eyebrowKey: "welcomeEyebrow",
    titleKey: "welcomeTitle",
    descriptionKey: "welcomeDescription",
    icon: Sparkles,
  },
  department: {
    eyebrowKey: "departmentEyebrow",
    titleKey: "departmentTitle",
    descriptionKey: "departmentDescription",
    icon: GraduationCap,
  },
  purpose: {
    eyebrowKey: "purposeEyebrow",
    titleKey: "purposeTitle",
    descriptionKey: "purposeDescription",
    icon: Target,
  },
  categories: {
    eyebrowKey: "categoriesEyebrow",
    titleKey: "categoriesTitle",
    descriptionKey: "categoriesDescription",
    icon: Tags,
  },
  language: {
    eyebrowKey: "languageEyebrow",
    titleKey: "languageTitle",
    descriptionKey: "languageDescription",
    icon: Languages,
  },
  confirmation: {
    eyebrowKey: "confirmationEyebrow",
    titleKey: "confirmationTitle",
    descriptionKey: "confirmationDescription",
    icon: ClipboardCheck,
  },
} as const;

function toggleValue<T>(values: T[], value: T) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function ChoiceCard({
  selected,
  onClick,
  title,
  description,
  disabled = false,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "group flex min-h-16 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
        selected
          ? "border-[#20659C] bg-[#20659C]/8 shadow-sm ring-1 ring-[#20659C]/15 dark:border-sky-400 dark:bg-sky-400/10"
          : "border-slate-200 bg-white hover:border-[#20659C]/40 hover:bg-sky-50/60 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-sky-400/40 dark:hover:bg-slate-800",
        disabled && "cursor-not-allowed opacity-45",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-[#20659C] bg-[#20659C] text-white dark:border-sky-400 dark:bg-sky-400 dark:text-slate-950"
            : "border-slate-300 bg-white text-transparent dark:border-slate-600 dark:bg-slate-900",
        )}
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}

function SummaryRow({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/60">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700"
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

interface PreferenceFlowProps {
  preference: ReadingPreference | null;
  departments: BookDepartment[];
  categories: BookCategory[];
  editing: boolean;
  onSkip: () => void;
  onSave: (values: ReadingPreferenceInput) => Promise<void>;
}

function PreferenceFlow({
  preference,
  departments,
  categories,
  editing,
  onSkip,
  onSave,
}: PreferenceFlowProps) {
  const t = useTranslations("Preferences");
  const { currentStep, state, next, previous, loading } =
    useOnboarding<PreferenceFlowContext>();
  const initialDepartment = preference
    ? preference.departmentId ?? "other"
    : undefined;
  const [departmentId, setDepartmentId] = useState<number | "other" | undefined>(
    initialDepartment,
  );
  const [purposes, setPurposes] = useState<ReadingPurpose[]>(
    preference?.readingPurposes ?? [],
  );
  const [categoryIds, setCategoryIds] = useState<number[]>(
    preference?.preferredCategoryIds ?? [],
  );
  const [languages, setLanguages] = useState<PreferredLanguage[]>(
    preference?.preferredLanguages ?? [],
  );
  const [validationMessage, setValidationMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const hasHydratedAnswers = useRef(false);

  const stepId = String(currentStep?.id ?? (editing ? "department" : "welcome")) as keyof typeof STEP_META;
  const meta = STEP_META[stepId];
  const Icon = meta.icon;
  const currentStepNumber = state?.currentStepNumber ?? (editing ? 2 : 1);
  const progress = (currentStepNumber / FLOW_STEPS.length) * 100;
  const isBusy = loading.isAnyLoading || isSaving;

  useEffect(() => {
    if (loading.isHydrating || !state || hasHydratedAnswers.current) return;

    const savedAnswers = state.context.flowData;
    const timer = window.setTimeout(() => {
      if (savedAnswers.departmentId !== undefined) {
        setDepartmentId(savedAnswers.departmentId);
      }
      if (savedAnswers.readingPurposes?.length) {
        setPurposes(savedAnswers.readingPurposes);
      }
      if (savedAnswers.preferredCategoryIds?.length) {
        setCategoryIds(savedAnswers.preferredCategoryIds);
      }
      if (savedAnswers.preferredLanguages?.length) {
        setLanguages(savedAnswers.preferredLanguages);
      }
      hasHydratedAnswers.current = true;
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loading.isHydrating, state]);

  const goNext = async () => {
    setValidationMessage("");
    if (stepId === "department") {
      if (departmentId === undefined) {
        setValidationMessage(t("selectDepartment"));
        return;
      }
      await next({ departmentId });
      return;
    }
    if (stepId === "purpose") {
      if (!purposes.length) {
        setValidationMessage(t("selectPurpose"));
        return;
      }
      await next({ readingPurposes: purposes });
      return;
    }
    if (stepId === "categories") {
      if (!categoryIds.length || categoryIds.length > 5) {
        setValidationMessage(t("selectCategories"));
        return;
      }
      await next({ preferredCategoryIds: categoryIds });
      return;
    }
    if (stepId === "language") {
      if (!languages.length) {
        setValidationMessage(t("selectLanguage"));
        return;
      }
      await next({ preferredLanguages: languages });
      return;
    }
    await next();
  };

  const save = async () => {
    setValidationMessage("");
    setIsSaving(true);
    try {
      await onSave({
        departmentId: departmentId === "other" ? null : departmentId ?? null,
        readingPurposes: purposes,
        preferredCategoryIds: categoryIds,
        preferredLanguages: languages,
        onboardingCompleted: true,
      });
      await next();
    } catch (error) {
      const message =
        typeof error === "object" &&
        error &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data &&
        "error" in error.data &&
        typeof error.data.error === "object" &&
        error.data.error &&
        "message" in error.data.error
          ? String(error.data.error.message)
          : t("saveError");
      setValidationMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const departmentName =
    departmentId === "other"
      ? t("otherDepartment")
      : departments.find((department) => department.id === departmentId)?.name ??
        "Not selected";
  const purposeNames = purposes.map((purpose) => {
    const option = READING_PURPOSES.find(
      (candidate) => candidate.value === purpose,
    );
    return option ? t(option.labelKey) : purpose;
  });
  const categoryNames = categoryIds.map(
    (id) => categories.find((category) => category.id === id)?.name ?? String(id),
  );
  const languageNames = languages.map((language) => {
    const option = LANGUAGES.find(
      (candidate) => candidate.value === language,
    );
    return option ? t(option.labelKey) : language;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-200 px-5 pb-4 pt-5 sm:px-8 sm:pt-7 dark:border-slate-800">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#20659C] to-[#55B9EA] text-white shadow-lg shadow-[#20659C]/20">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#20659C] dark:text-sky-400">
                {t(meta.eyebrowKey)}
              </p>
              <span className="text-xs font-medium text-slate-400">
                {currentStepNumber}/{FLOW_STEPS.length}
              </span>
            </div>
            <Progress value={progress} className="mt-2 h-1.5" />
          </div>
        </div>

        <DialogHeader className="pr-7">
          <DialogTitle className="font-khmer text-xl leading-relaxed sm:text-2xl">
            {t(meta.titleKey)}
          </DialogTitle>
          <DialogDescription className="leading-6">
            {t(meta.descriptionKey)}
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
        {stepId === "welcome" && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: GraduationCap, title: t("welcomeDepartmentTitle"), text: t("welcomeDepartmentText") },
              { icon: Target, title: t("welcomeGoalsTitle"), text: t("welcomeGoalsText") },
              { icon: BookHeart, title: t("welcomeInterestsTitle"), text: t("welcomeInterestsText") },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <item.icon className="size-5 text-[#20659C] dark:text-sky-400" />
                <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {stepId === "department" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {departments.map((department) => (
              <ChoiceCard
                key={department.id}
                selected={departmentId === department.id}
                onClick={() => setDepartmentId(department.id)}
                title={department.name}
                description={department.nameKh || department.code || undefined}
              />
            ))}
            <ChoiceCard
              selected={departmentId === "other"}
              onClick={() => setDepartmentId("other")}
              title={t("otherDepartment")}
              description={t("departmentNotListed")}
            />
          </div>
        )}

        {stepId === "purpose" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {READING_PURPOSES.map((purpose) => (
              <ChoiceCard
                key={purpose.value}
                selected={purposes.includes(purpose.value)}
                onClick={() =>
                  setPurposes((values) => toggleValue(values, purpose.value))
                }
                title={t(purpose.labelKey)}
              />
            ))}
          </div>
        )}

        {stepId === "categories" && (
          <>
            <div className="mb-4 flex items-center justify-between rounded-xl bg-sky-50 px-4 py-2 text-sm text-[#20659C] dark:bg-sky-950/30 dark:text-sky-300">
              <span>{t("chooseSubjects")}</span>
              <span className="font-bold">{categoryIds.length}/5</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.map((category) => {
                const selected = categoryIds.includes(category.id);
                return (
                  <ChoiceCard
                    key={category.id}
                    selected={selected}
                    disabled={!selected && categoryIds.length >= 5}
                    onClick={() =>
                      setCategoryIds((values) =>
                        toggleValue(values, category.id),
                      )
                    }
                    title={category.name}
                    description={category.nameKh || undefined}
                  />
                );
              })}
            </div>
          </>
        )}

        {stepId === "language" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {LANGUAGES.map((language) => (
              <ChoiceCard
                key={language.value}
                selected={languages.includes(language.value)}
                onClick={() =>
                  setLanguages((values) => toggleValue(values, language.value))
                }
                title={t(language.labelKey)}
              />
            ))}
          </div>
        )}

        {stepId === "confirmation" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryRow label={t("departmentSummary")} values={[departmentName]} />
            <SummaryRow label={t("purposeSummary")} values={purposeNames} />
            <SummaryRow label={t("categoriesSummary")} values={categoryNames} />
            <SummaryRow label={t("languagesSummary")} values={languageNames} />
          </div>
        )}

        {validationMessage && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          >
            {validationMessage}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-8 dark:border-slate-800 dark:bg-slate-950/50">
        {stepId === "welcome" && !editing ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            className="text-slate-500"
          >
            {t("skip")}
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={() => previous()}
            disabled={isBusy}
            className="gap-2"
          >
            <ArrowLeft className="size-4" /> {t("back")}
          </Button>
        )}

        {stepId === "confirmation" ? (
          <Button
            type="button"
            onClick={save}
            disabled={isBusy}
            className="gap-2 rounded-xl bg-[#20659C] px-5 hover:bg-[#174f7c]"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {t("showBooks")}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={goNext}
            disabled={isBusy}
            className="gap-2 rounded-xl bg-[#20659C] px-5 hover:bg-[#174f7c]"
          >
            {stepId === "welcome" ? t("start") : t("continue")}
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function PreferenceOnboarding() {
  const t = useTranslations("Preferences");
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [instance, setInstance] = useState(0);
  const {
    data: preferenceResponse,
    isLoading: isPreferenceLoading,
    isFetching: isPreferenceFetching,
  } = useGetReadingPreferencesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: departmentResponse } = useGetDepartmentsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: categoryResponse } = useGetCategoriesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [savePreferences] = useSaveReadingPreferencesMutation();

  const preference = preferenceResponse?.data ?? null;
  const departments = departmentResponse?.data ?? [];
  const categories = categoryResponse?.data ?? [];

  useEffect(() => {
    if (
      isAuthLoading ||
      !isAuthenticated ||
      isPreferenceLoading ||
      isPreferenceFetching ||
      preference?.onboardingCompleted ||
      !user ||
      sessionStorage.getItem(preferenceSkipStorageKey(user.id)) === "true"
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setEditing(false);
      setInstance((value) => value + 1);
      setOpen(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    isAuthLoading,
    isAuthenticated,
    isPreferenceFetching,
    isPreferenceLoading,
    preference?.onboardingCompleted,
    user,
  ]);

  useEffect(() => {
    const editPreferences = () => {
      if (!isAuthenticated) return;
      setEditing(true);
      setInstance((value) => value + 1);
      setOpen(true);
    };
    window.addEventListener(EDIT_READING_PREFERENCES_EVENT, editPreferences);
    return () =>
      window.removeEventListener(
        EDIT_READING_PREFERENCES_EVENT,
        editPreferences,
      );
  }, [isAuthenticated]);

  const skipForNow = useCallback(() => {
    if (user) {
      sessionStorage.setItem(preferenceSkipStorageKey(user.id), "true");
    }
    setOpen(false);
  }, [user]);

  const save = useCallback(
    async (values: ReadingPreferenceInput) => {
      await savePreferences({ values, exists: Boolean(preference) }).unwrap();
      if (user) {
        sessionStorage.removeItem(preferenceSkipStorageKey(user.id));
      }
      toast.success(
        editing ? t("updated") : t("saved"),
      );
    },
    [editing, preference, savePreferences, t, user],
  );

  const initialContext = useMemo<Partial<PreferenceFlowContext>>(
    () => ({
      currentUser: user ?? undefined,
      flowData: {
        departmentId: preference
          ? preference.departmentId ?? "other"
          : undefined,
        readingPurposes: preference?.readingPurposes ?? [],
        preferredCategoryIds: preference?.preferredCategoryIds ?? [],
        preferredLanguages: preference?.preferredLanguages ?? [],
      },
    }),
    [preference, user],
  );

  if (!isAuthenticated || !user || !open) return null;

  return (
    <OnboardingProvider<PreferenceFlowContext>
      key={`${user.id}-${editing ? "edit" : "new"}-${instance}`}
      steps={FLOW_STEPS}
      initialStepId={editing ? "department" : "welcome"}
      initialContext={initialContext}
      flowId="reading-preferences"
      flowName="Norton E-Library Reading Preferences"
      flowVersion={FLOW_VERSION}
      userId={String(user.id)}
      localStoragePersistence={
        editing
          ? undefined
          : {
              key: preferenceFlowStorageKey(user.id),
              ttl: 7 * 24 * 60 * 60 * 1000,
            }
      }
      onFlowComplete={() => {
        setOpen(false);
        window.setTimeout(
          () => localStorage.removeItem(preferenceFlowStorageKey(user.id)),
          0,
        );
      }}
    >
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            if (editing) setOpen(false);
            else skipForNow();
          }
        }}
      >
        <DialogContent
          data-preference-onboarding="open"
          onPointerDownOutside={(event) => event.preventDefault()}
          className="bottom-0 left-0 top-auto flex max-h-[92dvh] w-full max-w-none translate-x-0 translate-y-0 grid-cols-none gap-0 overflow-hidden rounded-b-none rounded-t-3xl border-x-0 border-b-0 p-0 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[min(760px,calc(100vh-2rem))] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border"
        >
          <PreferenceFlow
            preference={preference}
            departments={departments}
            categories={categories}
            editing={editing}
            onSkip={skipForNow}
            onSave={save}
          />
        </DialogContent>
      </Dialog>
    </OnboardingProvider>
  );
}
