import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  ShieldCheck,
  Scan,
  Loader2,
  FileWarning,
  Lightbulb,
  ExternalLink,
  Shield,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RedFlag {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  fix: string;
}

interface AnalysisResult {
  score: number;
  label: string;
  flags: RedFlag[];
}

function RiskGauge({ score, label }: { score: number; label: string }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * score);
      setAnimatedScore(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [score]);

  const getColor = (s: number) => {
    if (s <= 50) return "#EF4444";
    if (s <= 80) return "#F4C430";
    return "#2E8B57";
  };

  const color = getColor(score);

  const radius = 90;
  const circumference = Math.PI * radius;
  const dashOffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4" data-testid="risk-gauge">
      <div className="relative w-56 h-32">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              filter: `drop-shadow(0 0 8px ${color}40)`,
              transition: "stroke 0.3s ease",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span
            className="font-mono text-5xl font-bold tracking-tight"
            style={{ color }}
            data-testid="text-risk-score"
          >
            {animatedScore}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
        />
        <span
          className="font-mono text-sm font-semibold uppercase tracking-widest"
          style={{ color }}
          data-testid="text-risk-label"
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function RedFlagItem({ flag, index }: { flag: RedFlag; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const severityColors = {
    high: "#EF4444",
    medium: "#F4C430",
    low: "#2E8B57",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.15, duration: 0.4 }}
    >
      <Card
        className="border-[rgba(255,255,255,0.06)] cursor-pointer transition-colors duration-200"
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        aria-expanded={expanded}
        data-testid={`card-flag-${index}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex-shrink-0"
              style={{ color: severityColors[flag.severity] }}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">
                  {flag.title}
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase tracking-wider"
                    style={{
                      color: severityColors[flag.severity],
                      borderColor: `${severityColors[flag.severity]}30`,
                    }}
                  >
                    {flag.severity}
                  </Badge>
                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {flag.description}
              </p>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-[#F4C430] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-semibold text-[#F4C430] uppercase tracking-wider">
                            Suggested Fix
                          </span>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {flag.fix}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ScanningOverlay() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-2 border-[#F4C430]/20 flex items-center justify-center">
          <Scan className="w-8 h-8 text-[#F4C430] animate-pulse" />
        </div>
        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent border-t-[#F4C430] animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">
          Scanning Contract...
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Analyzing clauses for risk patterns
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [contractText, setContractText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("POST", "/api/analyze", { text });
      return res.json() as Promise<AnalysisResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
  });

  const handleAnalyze = useCallback(() => {
    if (!contractText.trim()) return;
    setResult(null);
    analyzeMutation.mutate(contractText);
  }, [contractText, analyzeMutation]);

  const isAnalyzing = analyzeMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-[rgba(255,255,255,0.06)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#F4C430]/10 flex items-center justify-center border border-[#F4C430]/20">
              <Shield className="w-5 h-5 text-[#F4C430]" />
            </div>
            <div>
              <h1
                className="text-base font-bold tracking-tight text-foreground"
                data-testid="text-app-title"
              >
                Scope Sentry
              </h1>
              <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest">
                Contract Risk Scanner
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            v1.0
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <h2
                className="text-2xl font-bold tracking-tight text-foreground"
                data-testid="text-input-headline"
              >
                Paste Your Scope of Work.
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Identify &lsquo;Scope Creep&rsquo; triggers before you sign.
              </p>
            </div>

            <Card className="border-[rgba(255,255,255,0.06)] flex-1">
              <CardContent className="p-4 flex flex-col gap-4 h-full">
                <Textarea
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="Paste contract clauses here..."
                  className="flex-1 min-h-[320px] resize-none bg-background border-[rgba(255,255,255,0.06)] font-mono text-sm placeholder:text-muted-foreground/50 focus-visible:ring-[#F4C430]/30"
                  data-testid="input-contract-text"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={!contractText.trim() || isAnalyzing}
                  className="w-full bg-[#F4C430] text-[#0F1115] border-[#F4C430] font-semibold tracking-wide"
                  data-testid="button-analyze"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4" />
                      Analyze Risk
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="text-xs text-muted-foreground/60 text-center">
              Your contract text is processed securely and never stored.
            </div>
          </div>

          <div ref={resultRef} className="flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-[rgba(255,255,255,0.06)]">
                    <CardContent className="p-6">
                      <ScanningOverlay />
                    </CardContent>
                  </Card>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-6"
                >
                  <Card className="border-[rgba(255,255,255,0.06)]">
                    <CardContent className="p-8">
                      <div className="text-center mb-2">
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          Risk Assessment
                        </span>
                      </div>
                      <RiskGauge score={result.score} label={result.label} />
                    </CardContent>
                  </Card>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FileWarning className="w-4 h-4 text-[#EF4444]" />
                      <h3
                        className="text-sm font-semibold text-foreground uppercase tracking-wider"
                        data-testid="text-flags-heading"
                      >
                        Detected Risks
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{
                          color: "#EF4444",
                          borderColor: "rgba(239,68,68,0.3)",
                        }}
                      >
                        {result.flags.length}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-3">
                      {result.flags.map((flag, i) => (
                        <RedFlagItem key={i} flag={flag} index={i} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-[rgba(255,255,255,0.06)]">
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                          <ShieldCheck className="w-7 h-7 text-muted-foreground/40" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            No analysis yet
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-1 max-w-[240px]">
                            Paste your contract text and click Analyze Risk to
                            get a detailed risk report.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-12">
          <Card className="border-[rgba(255,255,255,0.06)]">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-[#F4C430]/10 flex items-center justify-center border border-[#F4C430]/20 flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#F4C430]" />
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold text-foreground"
                      data-testid="text-upsell-heading"
                    >
                      Don&rsquo;t sign bad deals.
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Track scope and get paid on time.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
                  <Button
                    asChild
                    className="flex-1 sm:flex-none text-sm bg-[#F4C430] text-[#0F1115] border-[#F4C430]"
                    data-testid="button-command-center"
                  >
                    <a
                      href="https://udaller.one"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Track this Project in Command Center
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 sm:flex-none text-sm border-[#3B82F6]/30 text-[#60A5FA]"
                    data-testid="button-contract-template"
                  >
                    <a
                      href="https://www.honeybook.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get a Solid Contract Template
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
