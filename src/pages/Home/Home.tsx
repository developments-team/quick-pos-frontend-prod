/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Building2,
  ShoppingCart,
  BarChart3,
  Users,
  Package,
  ChevronRight,
  Check,
  Star,
  ArrowRight,
  Zap,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../context/apiConfig";
import { Spinner } from "../../components/ui/Spinner";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { BranchSwitcher } from "./BranchSwitcher";
import { TenantChooser } from "./TenantChooser";
import { ProfileSetup } from "./ProfileSetup";

export function Home() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>();

  // Branch Switcher modal state
  const [branchSwitcherOpen, setBranchSwitcherOpen] = useState(false);
  const [branchSwitcherData, setBranchSwitcherData] = useState<any>(null);
  const [branchSwitcherBranches, setBranchSwitcherBranches] = useState<any[]>(
    [],
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Tenant Chooser modal state
  const [tenantChooserOpen, setTenantChooserOpen] = useState(false);
  const [tenantChooserLoginData, setTenantChooserLoginData] =
    useState<any>(null);
  const [tenantChooserTenants, setTenantChooserTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  // Profile Setup modal state
  const [profileSetupOpen, setProfileSetupOpen] = useState(false);
  const [profileSetupData, setProfileSetupData] = useState<any>(null);

  // Track which steps occurred to allow navigating back through the flow
  const [hadProfileStep, setHadProfileStep] = useState(false);
  const [hadTenantStep, setHadTenantStep] = useState(false);

  const openLoginModal = () => {
    setAuthModalOpen(true);
  };

  const openSignupModal = () => {
    const popularPlan = (plansData?.data ?? []).find(
      (p: any) => p.isRecommended,
    );
    if (popularPlan) {
      setSelectedPlanId(popularPlan.id);
    }
    setSignupModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const handleLoginSuccess = (data: any) => {
    closeAuthModal();
    setHadProfileStep(false);
    setHadTenantStep(false);
    setSelectedTenantId(null);
    setSelectedBranchId(null);

    // Step 1: Profile setup first if hasProfile is explicitly false
    if ("hasProfile" in data.data && data.data.hasProfile === false) {
      setHadProfileStep(true);
      setProfileSetupData(data);
      setProfileSetupOpen(true);
      return;
    }

    // Step 2: Proceed to tenant/branch flow
    proceedAfterProfile(data);
  };

  const handleProfileComplete = (profileResponse: any) => {
    setProfileSetupOpen(false);
    if (profileSetupData) {
      // Merge profile data and mark hasProfile as true so we don't loop back
      const updatedData = {
        ...profileSetupData,
        data: {
          ...profileSetupData.data,
          ...profileResponse?.data,
          hasProfile: true,
        },
      };
      proceedAfterProfile(updatedData);
    }
  };

  const proceedAfterProfile = (data: any) => {
    // Step 2: If multiple tenants, show tenant chooser
    if (data.data.tenants && data.data.tenants.length > 1) {
      setHadTenantStep(true);
      setTenantChooserLoginData(data);
      setTenantChooserTenants(data.data.tenants);
      if (!selectedTenantId) {
        // Auto-select if only one tenant
        if (data.data.tenants.length === 1) {
          setSelectedTenantId(data.data.tenants[0].tenant.id);
        }
      }
      setTenantChooserOpen(true);
      return;
    }

    // Single tenant or no tenants — resolve tenant data and proceed
    const resolvedData = resolveTenantData(data, data.data.tenants?.[0]);
    proceedAfterTenant(resolvedData);
  };

  const resolveTenantData = (loginData: any, selectedTenant?: any) => {
    if (!selectedTenant) return loginData;

    return {
      ...loginData,
      data: {
        ...loginData.data,
        tenant: selectedTenant.tenant,
        role: selectedTenant.role,
        branches: selectedTenant.branches,
      },
    };
  };

  const handleTenantSelected = (loginData: any, selectedTenant: any) => {
    setSelectedTenantId(selectedTenant.tenant.id);
    setTenantChooserOpen(false);
    const resolvedData = resolveTenantData(loginData, selectedTenant);
    proceedAfterTenant(resolvedData);
  };

  const proceedAfterTenant = (data: any) => {
    // Step 3: If multiple branches, show branch switcher
    if (data.data.branches && data.data.branches.length > 1) {
      setBranchSwitcherData(data.data);
      setBranchSwitcherBranches(data.data.branches);
      if (!selectedBranchId) {
        // Auto-select if only one branch
        if (data.data.branches.length === 1) {
          setSelectedBranchId(data.data.branches[0].id);
        }
      }
      setBranchSwitcherOpen(true);
    } else {
      const userToSave = {
        ...data.data,
        branches: data.data.branches ? data.data.branches[0] : undefined,
      };
      localStorage.setItem("user_data", JSON.stringify(userToSave));
      navigate("/dashboard");
    }
  };

  const features = [
    {
      icon: Building2,
      title: "Multi-Tenant Architecture",
      description:
        "Serve multiple businesses from a single platform with complete data isolation and customization.",
    },
    {
      icon: Package,
      title: "Inventory Management",
      description:
        "Real-time stock tracking, low stock alerts, and automated reorder points across all branches.",
    },
    {
      icon: ShoppingCart,
      title: "Sales & Purchases",
      description:
        "Streamlined point of sale with support for multiple payment methods and purchase management.",
    },
    {
      icon: BarChart3,
      title: "Advanced Reports",
      description:
        "Income statements, balance sheets, trial balance, and general ledger at your fingertips.",
    },
    {
      icon: Users,
      title: "Role Management",
      description:
        "Fine-grained permissions and role-based access control for your team members.",
    },
    {
      icon: Globe,
      title: "Branch Management",
      description:
        "Manage multiple locations seamlessly with centralized control and branch-specific settings.",
    },
  ];

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["public-plans"],
    queryFn: async () => {
      const res = await axiosInstance.get("/plans/public");
      return res.data;
    },
  });

  const formatLimit = (value: number, singular: string, plural: string) => {
    return value === -1
      ? `Unlimited ${plural}`
      : value === 1
        ? `${value} ${singular}`
        : `Up to ${value} ${plural}`;
  };

  const reportLevelLabel: Record<string, string> = {
    BASIC: "Basic Reports",
    STANDARD: "Advanced Reports",
    ADVANCED: "Custom Reports",
  };

  const supportTypeLabel: Record<string, string> = {
    EMAIL: "Email Support",
    PRIORITY: "Priority Support",
    PREMIUM: "24/7 Premium Support",
  };

  const pricingPlans = (plansData?.data ?? []).map((plan: any) => ({
    id: plan.id,
    name: plan.name,
    price: `$${plan.price}`,
    period: "/month",
    description: plan.description,
    features: [
      formatLimit(plan.branchLimit, "Branch", "Branches"),
      formatLimit(plan.userLimit, "User", "Users"),
      formatLimit(plan.productLimit, "Product", "Products"),
      reportLevelLabel[plan.reportLevel] ?? plan.reportLevel,
      supportTypeLabel[plan.supportType] ?? plan.supportType,
    ],
    popular: plan.isRecommended,
  }));

  const testimonials = [
    {
      name: "Ahmed Hassan",
      role: "CEO, TechMart",
      content:
        "QuickPOS transformed how we manage our 12 retail locations. The multi-tenant feature is a game-changer!",
      rating: 5,
    },
    {
      name: "Sarah Johnson",
      role: "Operations Manager, FreshMart",
      content:
        "The reporting capabilities are incredible. We now have real-time insights into our business performance.",
      rating: 5,
    },
    {
      name: "Mohamed Ali",
      role: "Owner, SuperStore Chain",
      content:
        "Best POS system we've used. Easy to set up and the customer support is outstanding.",
      rating: 5,
    },
  ];

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Testimonials" },
  ];

  return (
    <div className="min-h-screen bg-(--bg-app)">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-(--bg-app)/80 border-b border-(--border)">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-(--primary) rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-(--primary)">
                QuickPOS
              </span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-(--text-secondary) hover:text-(--text-primary) transition-colors text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={openLoginModal}
                className="text-(--text-secondary) hover:text-(--text-primary) transition-colors text-sm font-medium px-4 py-2 cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={openSignupModal}
                className="bg-(--primary) hover:bg-(--primary-hover) text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 cursor-pointer"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-(--bg-panel) border border-(--border) text-(--text-primary)"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-(--border) bg-(--bg-app)/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-(--text-secondary) hover:text-(--text-primary) transition-colors text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-(--border) space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="block w-full text-center py-2.5 rounded-xl text-sm font-medium text-(--text-primary) bg-(--bg-panel) border border-(--border)"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openSignupModal();
                  }}
                  className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-(--primary)"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-48 sm:w-96 h-48 sm:h-96 bg-(--primary)/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-48 sm:w-96 h-48 sm:h-96 bg-(--primary)/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-(--primary)/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-(--bg-panel) border border-(--border) mb-6 sm:mb-8 animate-pulse">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
            <span className="text-xs sm:text-sm text-(--text-secondary)">
              Trusted by 500+ businesses worldwide
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-(--text-primary) mb-4 sm:mb-6 leading-tight">
            The Ultimate
            <span className="block text-(--primary)">Multi-Tenant POS</span>
            <span className="block">System</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-(--text-secondary) max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4 sm:px-0">
            Empower your business with a powerful, scalable point-of-sale
            solution. Manage multiple branches, track inventory, and generate
            insightful reports—all from one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4 sm:px-0">
            <button
              onClick={openSignupModal}
              className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-(--primary) hover:bg-(--primary-hover) text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold text-(--text-primary) bg-(--bg-panel) border border-(--border) hover:bg-(--bg-item) transition-all duration-300"
            >
              Learn More
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto px-2 sm:px-0">
            {[
              { value: "500+", label: "Businesses" },
              { value: "1M+", label: "Transactions" },
              { value: "50+", label: "Countries" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-(--bg-panel)/50 backdrop-blur-sm border border-(--border)"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-(--primary)">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-(--text-secondary) mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-(--text-primary) mb-3 sm:mb-4">
              Powerful Features for Modern Businesses
            </h2>
            <p className="text-base sm:text-lg text-(--text-secondary) max-w-2xl mx-auto px-4 sm:px-0">
              Everything you need to run your business efficiently, from
              inventory to accounting.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-(--bg-panel) border border-(--border) hover:border-(--primary)/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-(--primary)/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-(--primary)" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-(--text-primary) mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-(--text-secondary) leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative"
      >
        <div className="absolute inset-0 bg-(--primary)/5"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-(--text-primary) mb-3 sm:mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base sm:text-lg text-(--text-secondary) max-w-2xl mx-auto px-4 sm:px-0">
              Choose the plan that's right for your business. Upgrade or
              downgrade anytime.
            </p>
          </div>

          {plansLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="w-8 h-8 text-(--primary)" />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan: any, idx: number) => (
                <div
                  key={idx}
                  className={`relative w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] p-6 sm:p-8 rounded-xl sm:rounded-2xl border transition-all duration-300 hover:-translate-y-2 ${
                    plan.popular
                      ? "bg-(--primary)/10 border-(--primary)/50 shadow-xl shadow-indigo-500/10"
                      : "bg-(--bg-panel) border-(--border) hover:border-(--primary)/30"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-(--primary) text-white text-xs sm:text-sm font-semibold whitespace-nowrap">
                      Most Popular
                    </div>
                  )}
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-semibold text-(--text-primary) mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-(--text-secondary) mb-3 sm:mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl sm:text-4xl font-bold text-(--text-primary)">
                        {plan.price}
                      </span>
                      <span className="text-(--text-secondary) text-sm sm:text-base">
                        {plan.period}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {plan.features.map((feature: string, fIdx: number) => (
                      <li
                        key={fIdx}
                        className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-(--text-secondary)"
                      >
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-(--success) flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setSignupModalOpen(true);
                    }}
                    className={`block w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-center text-sm sm:text-base font-semibold transition-all duration-300 cursor-pointer ${
                      plan.popular
                        ? "bg-(--primary) text-white hover:bg-(--primary-hover) hover:shadow-lg hover:shadow-indigo-500/25"
                        : "bg-(--bg-item) text-(--text-primary) hover:bg-(--border)"
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-(--text-primary) mb-3 sm:mb-4">
              Loved by Businesses Everywhere
            </h2>
            <p className="text-base sm:text-lg text-(--text-secondary) max-w-2xl mx-auto px-4 sm:px-0">
              See what our customers have to say about QuickPOS.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-(--bg-panel) border border-(--border) hover:border-(--primary)/30 transition-all duration-300"
              >
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-(--text-secondary) mb-4 sm:mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-(--primary) flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-(--text-primary)">
                      {testimonial.name}
                    </div>
                    <div className="text-xs sm:text-sm text-(--text-secondary)">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-(--primary)/10 border border-(--primary)/20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-(--text-primary) mb-3 sm:mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-base sm:text-lg text-(--text-secondary) mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses that trust QuickPOS for their
              point-of-sale needs. Start your free trial today.
            </p>
            <button
              onClick={openSignupModal}
              className="inline-flex items-center gap-2 bg-(--primary) hover:bg-(--primary-hover) text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-(--border)">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-(--primary) rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-(--primary)">
                  QuickPOS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-(--text-secondary) leading-relaxed">
                The ultimate multi-tenant POS solution for modern businesses.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-sm sm:text-base text-(--text-primary) mb-3 sm:mb-4">
                Product
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                {["Features", "Pricing", "Integrations", "Updates"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-xs sm:text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm sm:text-base text-(--text-primary) mb-3 sm:mb-4">
                Company
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                {["About", "Blog", "Careers", "Contact"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs sm:text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm sm:text-base text-(--text-primary) mb-3 sm:mb-4">
                Support
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  "Help Center",
                  "Documentation",
                  "API Reference",
                  "Status",
                ].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs sm:text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 sm:pt-8 border-t border-(--border) gap-4 sm:gap-0">
            <p className="text-xs sm:text-sm text-(--text-muted) order-2 sm:order-1">
              © 2026 QuickPOS. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6 order-1 sm:order-2">
              <a
                href="#"
                className="text-xs sm:text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-xs sm:text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {authModalOpen && (
        <Login
          isOpen={authModalOpen}
          onClose={closeAuthModal}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Signup Tenant Modal */}
      {signupModalOpen && (
        <Signup
          isOpen={signupModalOpen}
          onClose={() => {
            setSignupModalOpen(false);
            setSelectedPlanId(undefined);
          }}
          selectedPlanId={selectedPlanId}
          plans={plansData?.data ?? []}
        />
      )}

      {/* Tenant Chooser Modal */}
      {tenantChooserOpen && (
        <TenantChooser
          isOpen={tenantChooserOpen}
          onClose={() => setTenantChooserOpen(false)}
          loginData={tenantChooserLoginData}
          tenants={tenantChooserTenants}
          onTenantSelected={handleTenantSelected}
          selectedTenantId={selectedTenantId}
          onBack={() => {
            setTenantChooserOpen(false);
            if (hadProfileStep) {
              setProfileSetupOpen(true);
            } else {
              setAuthModalOpen(true);
            }
          }}
        />
      )}

      {/* Branch Switcher Modal */}
      {branchSwitcherOpen && (
        <BranchSwitcher
          isOpen={branchSwitcherOpen}
          onClose={() => setBranchSwitcherOpen(false)}
          userData={branchSwitcherData}
          branches={branchSwitcherBranches}
          selectedBranchId={selectedBranchId}
          onBack={() => {
            setBranchSwitcherOpen(false);
            if (hadTenantStep) {
              setTenantChooserOpen(true);
            } else if (hadProfileStep) {
              setProfileSetupOpen(true);
            } else {
              setAuthModalOpen(true);
            }
          }}
        />
      )}

      {/* Profile Setup Modal */}
      {profileSetupOpen && (
        <ProfileSetup
          isOpen={profileSetupOpen}
          onClose={() => setProfileSetupOpen(false)}
          userData={profileSetupData?.data}
          onProfileComplete={handleProfileComplete}
          onBack={() => {
            setProfileSetupOpen(false);
            setAuthModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
