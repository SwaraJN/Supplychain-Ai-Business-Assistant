import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

// ── HERO SECTION ──
function HeroSection({ darkMode }: { darkMode: boolean }) {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: darkMode
          ? "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)"
          : "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)",
      }}
    >
      {/* Animated gradient orb following mouse */}
      <div
        className="absolute pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          width: "600px",
          height: "600px",
          transform: "translate(-50%, -50%)",
          background: darkMode
            ? "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: darkMode
            ? "linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)"
            : "linear-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.15) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: darkMode
                ? "rgba(124, 58, 237, 0.1)"
                : "rgba(139, 92, 246, 0.08)",
              border: darkMode
                ? "1px solid rgba(124, 58, 237, 0.3)"
                : "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <span className="text-2xl">✦</span>
            <span
              className={`text-sm font-semibold ${darkMode ? "text-violet-300" : "text-violet-700"}`}
            >
              Powered by CrewAI & Multi-Agent Systems
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className={`text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Autonomous
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Supply Chain
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className={`text-xl lg:text-2xl mb-12 max-w-3xl mx-auto ${darkMode ? "text-slate-300" : "text-slate-600"}`}
            style={{ lineHeight: 1.6 }}
          >
            AI-powered agents that autonomously manage procurement, quality
            control, and logistics — transforming your supply chain from
            reactive to predictive.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => navigate("/signin")}
              className="group relative px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/50 hover:-translate-y-1"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              }}
            >
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              className={`px-8 py-4 rounded-2xl font-semibold border-2 transition-all duration-300 hover:-translate-y-1 ${
                darkMode
                  ? "border-slate-700 text-white hover:bg-slate-800"
                  : "border-slate-300 text-slate-900 hover:bg-slate-50"
              }`}
            >
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20"
          >
            {[
              { value: "78%", label: "Faster Procurement" },
              { value: "92%", label: "Error Reduction" },
              { value: "24/7", label: "Autonomous Ops" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div
                  className={`text-4xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}
                >
                  {stat.value}
                </div>
                <div
                  className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className={`w-6 h-10 rounded-full border-2 flex items-start justify-center p-2 ${
            darkMode ? "border-slate-600" : "border-slate-400"
          }`}
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={`w-1.5 h-1.5 rounded-full ${darkMode ? "bg-slate-400" : "bg-slate-600"}`}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── PROBLEM SECTION ──
function ProblemSection({ darkMode }: { darkMode: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problems = [
    {
      icon: "📧",
      title: "Manual Email Hell",
      description:
        "Supply chain teams spend 40% of their time reading, writing, and tracking vendor emails manually.",
    },
    {
      icon: "⏰",
      title: "Reactive Operations",
      description:
        "Companies discover stock shortages only after they happen, causing production delays and lost revenue.",
    },
    {
      icon: "🤝",
      title: "Vendor Chaos",
      description:
        "Comparing quotes, tracking negotiations, and managing vendor relationships across spreadsheets and inboxes.",
    },
    {
      icon: "🔍",
      title: "Quality Blind Spots",
      description:
        "Manual quality checks lead to 15-20% rejection rates, with vendors learning about issues days later.",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-32 px-6 relative overflow-hidden"
      style={{
        background: darkMode
          ? "linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(30, 41, 59, 0.5) 100%)"
          : "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(248, 250, 252, 1) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2
            className={`text-5xl lg:text-6xl font-bold mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            The{" "}
            <span className="bg-gradient-to-r from-rose-500 to-red-600 bg-clip-text text-transparent">
              Supply Chain
            </span>
            <br />
            Crisis
          </h2>
          <p
            className={`text-xl max-w-3xl mx-auto ${darkMode ? "text-slate-300" : "text-slate-600"}`}
          >
            Traditional supply chain management is broken. Manual processes,
            fragmented systems, and reactive decision-making cost businesses
            millions in lost productivity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                darkMode
                  ? "bg-slate-800/50 border-slate-700 hover:border-rose-500/50"
                  : "bg-white/80 border-slate-200 hover:border-rose-300"
              }`}
              style={{
                boxShadow: darkMode
                  ? "0 10px 40px rgba(0, 0, 0, 0.3)"
                  : "0 10px 40px rgba(0, 0, 0, 0.06)",
              }}
            >
              <div className="text-5xl mb-4">{problem.icon}</div>
              <h3
                className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                {problem.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Impact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
          className={`mt-20 p-8 rounded-3xl border ${
            darkMode
              ? "bg-rose-900/20 border-rose-500/30"
              : "bg-rose-50 border-rose-200"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div
                className={`text-5xl font-bold mb-2 ${darkMode ? "text-rose-400" : "text-rose-600"}`}
              >
                $2.3M
              </div>
              <div
                className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Average annual cost of manual procurement
              </div>
            </div>
            <div>
              <div
                className={`text-5xl font-bold mb-2 ${darkMode ? "text-rose-400" : "text-rose-600"}`}
              >
                156 hrs
              </div>
              <div
                className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Wasted per month on vendor coordination
              </div>
            </div>
            <div>
              <div
                className={`text-5xl font-bold mb-2 ${darkMode ? "text-rose-400" : "text-rose-600"}`}
              >
                18%
              </div>
              <div
                className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Stock-out rate in traditional systems
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── SOLUTION SECTION ──
function SolutionSection({ darkMode }: { darkMode: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: "🤖",
      gradient: "from-violet-500 to-purple-600",
      title: "Autonomous Procurement",
      description:
        "AI agents monitor inventory 24/7, automatically draft RFQs, negotiate with vendors, and create purchase orders — all without human intervention.",
      metrics: ["78% faster", "0 manual emails", "Real-time decisions"],
    },
    {
      icon: "📊",
      gradient: "from-emerald-500 to-teal-600",
      title: "Predictive Analytics",
      description:
        "ML models predict stock shortages before they happen, optimize reorder points, and suggest ideal procurement timing based on historical patterns.",
      metrics: ["92% accuracy", "2 weeks ahead", "Zero stockouts"],
    },
    {
      icon: "✅",
      gradient: "from-blue-500 to-cyan-600",
      title: "Intelligent Quality Control",
      description:
        "Automated inspection workflows, instant vendor feedback, and replacement requests — all managed by QC agents with 99.5% accuracy.",
      metrics: ["95% pass rate", "Instant alerts", "Auto-replacement"],
    },
    {
      icon: "🚚",
      gradient: "from-amber-500 to-orange-600",
      title: "Smart Logistics",
      description:
        "Route optimization, carrier selection, and real-time tracking powered by logistics agents that ensure on-time delivery every time.",
      metrics: ["98% on-time", "30% cost saving", "Live tracking"],
    },
  ];

  return (
    <section ref={ref} className="py-32 px-6 relative overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: darkMode
            ? "radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 50%)"
            : "radial-gradient(circle at 20% 50%, rgba(167, 139, 250, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(129, 140, 248, 0.1) 0%, transparent 50%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2
            className={`text-5xl lg:text-6xl font-bold mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Meet Your{" "}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              AI Workforce
            </span>
          </h2>
          <p
            className={`text-xl max-w-3xl mx-auto ${darkMode ? "text-slate-300" : "text-slate-600"}`}
          >
            A fleet of specialized AI agents working 24/7 to automate your
            entire supply chain — from procurement to delivery.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className={`group relative p-8 rounded-3xl border backdrop-blur-xl transition-all duration-300 overflow-hidden ${
                darkMode
                  ? "bg-slate-800/50 border-slate-700 hover:border-violet-500/50"
                  : "bg-white/80 border-slate-200 hover:border-violet-300"
              }`}
              style={{
                boxShadow: darkMode
                  ? "0 20px 60px rgba(0, 0, 0, 0.3)"
                  : "0 20px 60px rgba(0, 0, 0, 0.08)",
              }}
            >
              {/* Gradient accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="flex items-start gap-6 mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}
                >
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-2xl font-bold mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`text-base leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex flex-wrap gap-3">
                {feature.metrics.map((metric, j) => (
                  <div
                    key={j}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                      darkMode
                        ? "bg-slate-700/50 text-slate-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {metric}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── HOW IT WORKS SECTION ──
function HowItWorksSection({ darkMode }: { darkMode: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      number: "01",
      title: "Connect Your Systems",
      description:
        "Integrate with your ERP, email, and existing tools in minutes. Our AI agents sync seamlessly with your current workflow.",
      icon: "🔗",
    },
    {
      number: "02",
      title: "AI Learns Your Business",
      description:
        "CrewAI agents analyze your historical data, vendor patterns, and procurement rules to understand your unique supply chain.",
      icon: "🧠",
    },
    {
      number: "03",
      title: "Autonomous Operations Begin",
      description:
        "Agents start monitoring inventory, communicating with vendors, and making procurement decisions based on your defined thresholds.",
      icon: "⚡",
    },
    {
      number: "04",
      title: "Continuous Optimization",
      description:
        "The system learns from every transaction, improving accuracy, speed, and cost-efficiency over time with zero manual effort.",
      icon: "📈",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-32 px-6 relative overflow-hidden"
      style={{
        background: darkMode
          ? "linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(30, 41, 59, 0.5) 50%, rgba(15, 23, 42, 0) 100%)"
          : "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(248, 250, 252, 1) 50%, rgba(255, 255, 255, 0) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2
            className={`text-5xl lg:text-6xl font-bold mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            How It Works
          </h2>
          <p
            className={`text-xl max-w-3xl mx-auto ${darkMode ? "text-slate-300" : "text-slate-600"}`}
          >
            From setup to autonomous operations in 4 simple steps
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div
            className={`absolute left-1/2 top-0 bottom-0 w-0.5 hidden lg:block ${
              darkMode ? "bg-slate-700" : "bg-slate-200"
            }`}
          />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 * i, duration: 0.6 }}
              className={`relative mb-16 lg:mb-24 last:mb-0 flex items-center ${
                i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
            >
              {/* Content */}
              <div
                className={`w-full lg:w-5/12 ${i % 2 === 0 ? "lg:pr-16" : "lg:pl-16"}`}
              >
                <div
                  className={`p-8 rounded-3xl border backdrop-blur-xl ${
                    darkMode
                      ? "bg-slate-800/50 border-slate-700"
                      : "bg-white/80 border-slate-200"
                  }`}
                  style={{
                    boxShadow: darkMode
                      ? "0 20px 60px rgba(0, 0, 0, 0.3)"
                      : "0 20px 60px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">{step.icon}</div>
                    <div
                      className={`text-6xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent`}
                    >
                      {step.number}
                    </div>
                  </div>
                  <h3
                    className={`text-2xl font-bold mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-base leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Center dot */}
              <div className="hidden lg:flex w-2/12 justify-center absolute left-1/2 -translate-x-1/2">
                <div
                  className={`w-6 h-6 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg`}
                />
              </div>

              {/* Spacer */}
              <div className="hidden lg:block w-5/12" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── BUSINESS MODEL SECTION ──
function BusinessModelSection({ darkMode }: { darkMode: boolean }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const tiers = [
    {
      name: "Starter",
      price: "$499",
      period: "/month",
      description: "Perfect for small businesses starting their AI journey",
      features: [
        "Up to 100 SKUs",
        "5 AI Agents (Procurement, Quality, Logistics)",
        "Email automation",
        "Basic analytics",
        "Standard support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$1,299",
      period: "/month",
      description: "For growing companies scaling operations",
      features: [
        "Up to 1,000 SKUs",
        "10 AI Agents (All modules)",
        "Advanced vendor intelligence",
        "Predictive analytics",
        "Priority support",
        "Custom integrations",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited SKUs",
        "Unlimited AI Agents",
        "Multi-location support",
        "Dedicated success manager",
        "SLA guarantee",
        "White-label options",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section ref={ref} className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2
            className={`text-5xl lg:text-6xl font-bold mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Simple,{" "}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p
            className={`text-xl max-w-3xl mx-auto ${darkMode ? "text-slate-300" : "text-slate-600"}`}
          >
            Choose the plan that fits your business. All plans include a 14-day
            free trial.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative p-8 rounded-3xl border backdrop-blur-xl transition-all duration-300 ${
                tier.popular
                  ? darkMode
                    ? "bg-gradient-to-br from-violet-900/30 to-purple-900/30 border-violet-500"
                    : "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-300"
                  : darkMode
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-white/80 border-slate-200"
              }`}
              style={{
                boxShadow: tier.popular
                  ? darkMode
                    ? "0 20px 60px rgba(124, 58, 237, 0.3)"
                    : "0 20px 60px rgba(167, 139, 250, 0.2)"
                  : darkMode
                    ? "0 20px 60px rgba(0, 0, 0, 0.3)"
                    : "0 20px 60px rgba(0, 0, 0, 0.08)",
              }}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}
                >
                  {tier.name}
                </h3>
                <p
                  className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  {tier.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-5xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={`text-lg ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    {tier.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <svg
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${tier.popular ? "text-violet-500" : darkMode ? "text-emerald-400" : "text-emerald-600"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() =>
                  tier.cta === "Contact Sales" ? null : navigate("/signin")
                }
                className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  tier.popular
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-2xl hover:shadow-violet-500/50"
                    : darkMode
                      ? "bg-slate-700 text-white hover:bg-slate-600"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* ROI Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
          className={`mt-20 p-8 lg:p-12 rounded-3xl border ${
            darkMode
              ? "bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/30"
              : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
          }`}
        >
          <div className="text-center mb-8">
            <h3
              className={`text-3xl font-bold mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Average ROI in 6 Months
            </h3>
            <p
              className={`text-lg ${darkMode ? "text-slate-300" : "text-slate-600"}`}
            >
              Our customers see measurable returns within months
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div
                className={`text-5xl font-bold mb-2 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}
              >
                312%
              </div>
              <div
                className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Average ROI
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-5xl font-bold mb-2 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}
              >
                $1.8M
              </div>
              <div
                className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Avg. annual savings
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-5xl font-bold mb-2 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}
              >
                4.2x
              </div>
              <div
                className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Productivity increase
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── CTA SECTION ──
function CTASection({ darkMode }: { darkMode: boolean }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="py-32 px-6 relative overflow-hidden"
      style={{
        background: darkMode
          ? "radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.2) 0%, transparent 70%)"
          : "radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.15) 0%, transparent 70%)",
      }}
    >
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2
            className={`text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Ready to Go{" "}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Autonomous?
            </span>
          </h2>
          <p
            className={`text-xl lg:text-2xl mb-12 ${darkMode ? "text-slate-300" : "text-slate-600"}`}
          >
            Join 500+ companies that have transformed their supply chains with
            AI
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/signin")}
              className="group relative px-10 py-5 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/50 hover:-translate-y-1"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              }}
            >
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              className={`px-10 py-5 rounded-2xl font-bold text-lg border-2 transition-all duration-300 hover:-translate-y-1 ${
                darkMode
                  ? "border-slate-700 text-white hover:bg-slate-800"
                  : "border-slate-300 text-slate-900 hover:bg-slate-50"
              }`}
            >
              Schedule Demo
            </button>
          </div>

          <p
            className={`text-sm mt-6 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
          >
            14-day free trial · No credit card required · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ── NAVIGATION ──
function Navigation({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? darkMode
            ? "bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-lg"
            : "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            ✦
          </div>
          <span
            className={`font-bold text-xl ${darkMode ? "text-white" : "text-slate-900"}`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Code Neurons AI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "Pricing", "Contact"].map((item) => (
            <button
              key={item}
              className={`font-medium transition-colors ${
                darkMode
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              darkMode
                ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => navigate("/signin")}
            className="hidden sm:block px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:shadow-xl transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

// ── MAIN COMPONENT ──
export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
      }`}
    >
      <Navigation darkMode={darkMode} setDarkMode={setDarkMode} />
      <HeroSection darkMode={darkMode} />
      <ProblemSection darkMode={darkMode} />
      <SolutionSection darkMode={darkMode} />
      <HowItWorksSection darkMode={darkMode} />
      <BusinessModelSection darkMode={darkMode} />
      <CTASection darkMode={darkMode} />

      {/* Footer */}
      <footer
        className={`border-t py-12 ${darkMode ? "border-slate-800" : "border-slate-200"}`}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p
            className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}
          >
            © 2025 SupplyChain AI. Powered by CrewAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
