import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  BarChart3,
  Coins,
  Download,
  Eraser,
  Info,
  LineChart,
  Menu,
  Plus,
  ShieldAlert,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PortfolioTrack — CodeAlpha Stock Portfolio Tracker" },
      {
        name: "description",
        content:
          "Track sample stock investments in rupees: add holdings, see totals, export CSV. Educational demo for CodeAlpha Task 2.",
      },
      { property: "og:title", content: "PortfolioTrack — Stock Portfolio Tracker" },
      {
        property: "og:description",
        content:
          "Add sample stocks, view investment totals in ₹, and export your portfolio to CSV. Educational demo, no live market data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STOCK_PRICES: Record<string, number> = {
  AAPL: 180,
  TSLA: 250,
  MSFT: 350,
  GOOGL: 140,
  AMZN: 180,
};

const SYMBOLS = Object.keys(STOCK_PRICES);
const STORAGE_KEY = "codealpha-portfolio-v1";

type Holding = { id: string; symbol: string; price: number; quantity: number };

const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

function loadHoldings(): Holding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (h: unknown): h is Holding =>
          !!h &&
          typeof h === "object" &&
          typeof (h as Holding).symbol === "string" &&
          Number.isFinite(Number((h as Holding).price)) &&
          Number.isInteger(Number((h as Holding).quantity)) &&
          Number((h as Holding).quantity) > 0,
      )
      .map((h) => ({
        id: String(h.id ?? crypto.randomUUID()),
        symbol: h.symbol,
        price: Number(h.price),
        quantity: Number(h.quantity),
      }));
  } catch {
    return [];
  }
}

function Glass({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card/50 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] ${className}`}
    >
      {children}
    </div>
  );
}

function Index() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [symbol, setSymbol] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHoldings(loadHoldings());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
    } catch {
      /* storage unavailable */
    }
  }, [holdings, loaded]);

  const totals = useMemo(() => {
    const investment = holdings.reduce((s, h) => s + h.price * h.quantity, 0);
    const qty = holdings.reduce((s, h) => s + h.quantity, 0);
    return { investment, qty, count: holdings.length };
  }, [holdings]);

  const selectedPrice = symbol ? STOCK_PRICES[symbol] : 0;
  const qtyNum = Number(quantity);
  const previewTotal =
    symbol && Number.isInteger(qtyNum) && qtyNum > 0 ? selectedPrice * qtyNum : 0;

  const scrollToForm = () => {
    setMenuOpen(false);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const addStock = () => {
    if (!symbol) {
      setError("Please select a stock symbol.");
      toast.error("Please select a stock symbol.");
      return;
    }
    if (!/^\d+$/.test(quantity.trim()) || Number(quantity) <= 0) {
      setError("Quantity must be a positive whole number.");
      toast.error("Quantity must be a positive whole number.");
      return;
    }
    setError(null);
    setHoldings((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        symbol,
        price: STOCK_PRICES[symbol],
        quantity: Number(quantity),
      },
    ]);
    toast.success(`${quantity} × ${symbol} added to your portfolio.`);
    setQuantity("");
  };

  const clearForm = () => {
    setSymbol("");
    setQuantity("");
    setError(null);
  };

  const confirmDelete = () => {
    const item = holdings.find((h) => h.id === deleteId);
    setHoldings((prev) => prev.filter((h) => h.id !== deleteId));
    setDeleteId(null);
    toast.success(item ? `${item.symbol} removed from portfolio.` : "Holding removed.");
  };

  const downloadCsv = () => {
    if (holdings.length === 0) {
      toast.error("Your portfolio is empty — add a stock before downloading.");
      return;
    }
    const rows = [
      ["Stock Symbol", "Sample Price", "Quantity", "Total Value"],
      ...holdings.map((h) => [
        h.symbol,
        String(h.price),
        String(h.quantity),
        String(h.price * h.quantity),
      ]),
      ["TOTAL", "", String(totals.qty), String(totals.investment)],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio_tracker.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("portfolio_tracker.csv downloaded.");
  };

  const clearPortfolio = () => {
    setHoldings([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setClearOpen(false);
    toast.success("Portfolio cleared.");
  };

  const navLinks = [
    { label: "Dashboard", href: "#dashboard" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "About", href: "#about" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_50%_at_20%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent),radial-gradient(45%_40%_at_90%_10%,color-mix(in_oklab,var(--accent)_14%,transparent),transparent)]" />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <LineChart className="size-5" />
            </div>
            <div>
              <p className="text-base font-semibold leading-tight tracking-tight">
                PortfolioTrack
              </p>
              <p className="text-xs text-muted-foreground">Stock Portfolio Tracker</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <Button onClick={scrollToForm} className="ml-2" size="sm">
              <Plus className="size-4" /> Add Investment
            </Button>
          </nav>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="grid size-10 place-items-center rounded-lg border border-border text-foreground md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-border bg-card/70 px-4 py-3 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <Button onClick={scrollToForm} className="mt-2">
                <Plus className="size-4" /> Add Investment
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
        {/* Dashboard header */}
        <section id="dashboard" className="space-y-4 scroll-mt-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                <Activity className="size-3.5" /> Demo Portfolio • Sample Prices
              </span>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                My Investment Portfolio
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Track your sample stock investments with ease.
              </p>
            </div>
            <Button onClick={scrollToForm} size="lg">
              <Plus className="size-4" /> Add Investment
            </Button>
          </div>

          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={<Wallet className="size-5" />}
              label="Total Investment"
              value={inr(totals.investment)}
              tone="primary"
            />
            <SummaryCard
              icon={<BarChart3 className="size-5" />}
              label="Total Stocks"
              value={String(totals.count)}
              tone="accent"
            />
            <SummaryCard
              icon={<Coins className="size-5" />}
              label="Total Quantity"
              value={String(totals.qty)}
              tone="primary"
            />
            <SummaryCard
              icon={<TrendingUp className="size-5" />}
              label="Portfolio Status"
              value={totals.count > 0 ? "Active" : "Empty"}
              tone="accent"
            />
          </div>
        </section>

        {/* Add form */}
        <section ref={formRef} className="scroll-mt-24">
          <Glass className="p-6">
            <h2 className="text-xl font-semibold tracking-tight">Add Stock Investment</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Prices below are fictional sample values used for this educational demo.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Stock Symbol</Label>
                <Select value={symbol} onValueChange={setSymbol}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a stock" />
                  </SelectTrigger>
                  <SelectContent>
                    {SYMBOLS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s} — {inr(STOCK_PRICES[s])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qty">Quantity</Label>
                <Input
                  id="qty"
                  inputMode="numeric"
                  placeholder="e.g. 10"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setError(null);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Sample Price</Label>
                <Input
                  id="price"
                  readOnly
                  value={symbol ? inr(selectedPrice) : "—"}
                  className="bg-secondary/40 text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label>Total Value</Label>
                <div className="flex h-9 items-center rounded-md border border-border bg-secondary/40 px-3 text-sm font-semibold text-accent">
                  {inr(previewTotal)}
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 flex items-center gap-2 text-sm text-destructive">
                <ShieldAlert className="size-4" /> {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={addStock}>
                <Plus className="size-4" /> Add Stock
              </Button>
              <Button variant="secondary" onClick={clearForm}>
                <Eraser className="size-4" /> Clear Form
              </Button>
            </div>
          </Glass>
        </section>

        {/* Portfolio table */}
        <section id="portfolio" className="scroll-mt-24">
          <Glass className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold tracking-tight">My Stock Holdings</h2>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={downloadCsv}>
                  <Download className="size-4" /> Download CSV
                </Button>
                <Button variant="destructive" onClick={() => setClearOpen(true)}>
                  <Trash2 className="size-4" /> Clear Portfolio
                </Button>
              </div>
            </div>

            {holdings.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <div className="grid size-14 place-items-center rounded-2xl bg-secondary/50 text-muted-foreground">
                  <BarChart3 className="size-7" />
                </div>
                <p className="text-base font-medium">No holdings yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Add your first sample stock investment using the form above to see your
                  portfolio come to life.
                </p>
                <Button variant="secondary" onClick={scrollToForm}>
                  <Plus className="size-4" /> Add Investment
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Stock Symbol</th>
                      <th className="px-6 py-3 font-medium">Sample Price</th>
                      <th className="px-6 py-3 font-medium">Quantity</th>
                      <th className="px-6 py-3 font-medium">Total Value</th>
                      <th className="px-6 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h) => (
                      <tr
                        key={h.id}
                        className="border-b border-border/60 transition-colors hover:bg-secondary/30"
                      >
                        <td className="px-6 py-4 font-semibold">{h.symbol}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {inr(h.price)}
                        </td>
                        <td className="px-6 py-4">{h.quantity}</td>
                        <td className="px-6 py-4 font-semibold text-accent">
                          {inr(h.price * h.quantity)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleteId(h.id)}
                          >
                            <Trash2 className="size-4" /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-secondary/40 font-semibold">
                      <td className="px-6 py-4">Total</td>
                      <td className="px-6 py-4" />
                      <td className="px-6 py-4">{totals.qty}</td>
                      <td className="px-6 py-4 text-primary">{inr(totals.investment)}</td>
                      <td className="px-6 py-4" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Glass>
        </section>

        {/* About */}
        <section id="about" className="scroll-mt-24">
          <Glass className="p-6">
            <div className="flex items-center gap-2">
              <Info className="size-5 text-primary" />
              <h2 className="text-xl font-semibold tracking-tight">About This Project</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              This Stock Portfolio Tracker is developed as a beginner-friendly project for
              the CodeAlpha Python Programming Internship – Task 2. It demonstrates
              investment calculations, predefined stock data, form handling, data storage,
              and CSV export.
            </p>
            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground/90">
              <p className="font-medium">Educational demo only</p>
              <p className="mt-1 text-muted-foreground">
                All prices are fictional sample values. This app does not provide live
                market data, real-time quotes, or financial advice. Do not use it to make
                investment decisions.
              </p>
            </div>
          </Glass>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        CodeAlpha Stock Portfolio Tracker • Sample data, educational use only
      </footer>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this holding?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the selected stock entry from your saved portfolio. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear the entire portfolio?</AlertDialogTitle>
            <AlertDialogDescription>
              Every saved holding will be deleted from this browser and the dashboard will
              reset to zero.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearPortfolio}>Clear portfolio</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "accent";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary/15 text-primary ring-primary/25"
      : "bg-accent/15 text-accent ring-accent/25";
  return (
    <Glass className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className={`grid size-10 place-items-center rounded-xl ring-1 ${toneClass}`}>
          {icon}
        </div>
      </div>
    </Glass>
  );
}
